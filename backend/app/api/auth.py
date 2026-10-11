from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.security import create_access_token, create_refresh_token, verify_password
from ..models import Session as UserSession, User
from ..schemas.auth import LoginRequest, OTPRequest, RefreshRequest, SignupRequest, TokenResponse, UserResponse, VerifyOTPRequest
from ..services.auth_service import AuthService
from .dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/signup", status_code=status.HTTP_201_CREATED, summary="Register a user and send OTP")
def signup(payload: SignupRequest, db: Annotated[Session, Depends(get_db)]) -> dict:
    service = AuthService(db)
    user = service.signup(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password=payload.password,
    )
    return {
        "message": "Signup successful. Please verify your OTP.",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_verified": user.is_verified,
        },
    }


@router.post("/send-otp", summary="Send OTP for a signup or verification request")
def send_otp(payload: OTPRequest, db: Annotated[Session, Depends(get_db)]) -> dict:
    user = db.query(User).filter(User.email == payload.identifier.lower()).first()
    if payload.purpose == "signup" and user and user.is_verified:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already verified")
    service = AuthService(db)
    service.otp_service.create_challenge(identifier=payload.identifier, purpose=payload.purpose)
    return {"message": "OTP sent successfully"}


@router.post("/verify-otp", summary="Verify OTP and complete account validation")
def verify_otp(payload: VerifyOTPRequest, db: Annotated[Session, Depends(get_db)]) -> dict:
    service = AuthService(db)
    user = service.verify_signup_otp(identifier=payload.identifier, otp=payload.otp)
    access_token = create_access_token(str(user.id), {"role": user.role})
    refresh_token = create_refresh_token(str(user.id))
    db.add(UserSession(user_id=user.id, refresh_token=refresh_token, expires_at=__import__('datetime').datetime.now(__import__('datetime').timezone.utc) + __import__('datetime').timedelta(days=7), revoked=False))
    db.commit()
    return {
        "message": "OTP verified successfully",
        "token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_verified": user.is_verified,
        },
    }


@router.post("/login", summary="Login with email or phone and password")
def login(payload: LoginRequest, db: Annotated[Session, Depends(get_db)]) -> dict:
    service = AuthService(db)
    user, access_token, refresh_token = service.login(identifier=payload.identifier, password=payload.password)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "is_verified": user.is_verified,
        },
    }


@router.post("/refresh", summary="Refresh an access token")
def refresh(payload: RefreshRequest, db: Annotated[Session, Depends(get_db)]) -> dict:
    service = AuthService(db)
    access_token, refresh_token = service.refresh_session(payload.refresh_token)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/logout", summary="Revoke current session")
def logout(db: Annotated[Session, Depends(get_db)], payload: RefreshRequest | None = None) -> dict:
    service = AuthService(db)
    service.logout(payload.refresh_token if payload else None)
    return {"message": "Logged out successfully"}


@router.get("/me", summary="Get current authenticated user")
def me(current_user: Annotated[User, Depends(get_current_user)]) -> dict:
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role,
        "is_verified": current_user.is_verified,
        "is_active": current_user.is_active,
    }
