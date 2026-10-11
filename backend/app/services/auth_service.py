from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..core.security import create_access_token, create_refresh_token, hash_password, verify_password
from ..models import Session as UserSession, User
from ..models.otp_challenge import OTPChallenge
from .otp_service import OTPService, _as_aware_utc


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.otp_service = OTPService(db)

    def signup(self, name: str, email: str, phone: str | None, password: str) -> User:
        if self.db.query(User).filter(User.email == email.lower()).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        if phone and self.db.query(User).filter(User.phone == phone).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Phone already registered")

        user = User(
            name=name.strip(),
            email=email.lower(),
            phone=phone,
            password_hash=hash_password(password),
            role="consumer",
            is_verified=False,
            is_active=True,
        )
        self.db.add(user)
        self.db.flush()
        self.otp_service.create_challenge(identifier=email.lower(), purpose="signup")
        return user

    def verify_signup_otp(self, identifier: str, otp: str) -> User:
        challenge = self.otp_service.get_valid_challenge(identifier, "signup")
        if challenge is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP is invalid or expired")

        if not self.otp_service.verify_code(challenge, otp):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP")

        user = self.db.query(User).filter(User.email == identifier.lower()).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        user.is_verified = True
        challenge.verified = True
        self.db.flush()
        return user

    def login(self, identifier: str, password: str) -> tuple[User, str, str]:
        user = self.db.query(User).filter(
            (User.email == identifier.lower()) | (User.phone == identifier)
        ).first()

        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

        if not user.is_verified:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not verified")

        access_token = create_access_token(str(user.id), {"role": user.role})
        refresh_token_value = create_refresh_token(str(user.id))

        session = UserSession(
            user_id=user.id,
            refresh_token=refresh_token_value,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),
            revoked=False,
        )
        self.db.add(session)
        self.db.commit()

        return user, access_token, refresh_token_value

    def refresh_session(self, refresh_token: str) -> tuple[str, str]:
        session = self.db.query(UserSession).filter(UserSession.refresh_token == refresh_token).first()
        if not session or session.revoked:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        if _as_aware_utc(session.expires_at) < datetime.now(timezone.utc):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

        user = self.db.query(User).filter(User.id == session.user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        new_access = create_access_token(str(user.id), {"role": user.role})
        new_refresh = create_refresh_token(str(user.id))
        session.refresh_token = new_refresh
        session.expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        self.db.commit()
        return new_access, new_refresh

    def logout(self, refresh_token: str | None) -> None:
        if not refresh_token:
            return
        session = self.db.query(UserSession).filter(UserSession.refresh_token == refresh_token).first()
        if session:
            session.revoked = True
            self.db.commit()

    def get_current_user_by_id(self, user_id: int) -> User:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user
