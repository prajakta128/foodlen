from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from ..core.config import get_settings
from ..core.security import generate_otp, verify_otp_candidate
from ..models.otp_challenge import OTPChallenge

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _as_aware_utc(value: datetime) -> datetime:
    """Some database backends (e.g. SQLite) drop tzinfo on round-trip even for
    timezone-aware columns. Treat any naive value coming back from the DB as UTC
    so comparisons against datetime.now(timezone.utc) never crash."""
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


class OTPService:
    def __init__(self, db: Session):
        self.db = db

    def create_challenge(self, identifier: str, purpose: str = "signup") -> OTPChallenge:
        existing = self.db.query(OTPChallenge).filter(
            OTPChallenge.identifier == identifier.lower(),
            OTPChallenge.purpose == purpose,
            OTPChallenge.verified.is_(False),
        ).order_by(OTPChallenge.created_at.desc()).first()

        if existing and _as_aware_utc(existing.expires_at) > datetime.now(timezone.utc):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="OTP already sent; please wait before requesting again")

        otp_code = generate_otp()
        challenge = OTPChallenge(
            identifier=identifier.lower(),
            purpose=purpose,
            otp_hash=pwd_context.hash(otp_code),
            expires_at=datetime.now(timezone.utc) + timedelta(seconds=settings.otp_ttl_seconds),
            attempts=0,
            max_attempts=settings.otp_max_attempts,
            verified=False,
        )
        self.db.add(challenge)
        self.db.commit()
        self.send_otp_email(identifier, otp_code)
        return challenge

    def send_otp_email(self, identifier: str, otp_code: str) -> None:
        if settings.environment.lower() == "development":
            print(f"[DEV OTP] To={identifier} code={otp_code}")
            return

    def verify_code(self, challenge: OTPChallenge, otp: str) -> bool:
        if challenge.verified:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP has already been used")
        if _as_aware_utc(challenge.expires_at) < datetime.now(timezone.utc):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP has expired")
        if challenge.attempts >= challenge.max_attempts:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP attempt limit reached")

        if not verify_otp_candidate(otp):
            challenge.attempts += 1
            self.db.commit()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP must be 6 digits")

        is_valid = pwd_context.verify(otp, challenge.otp_hash)
        challenge.attempts += 1
        self.db.commit()
        return is_valid

    def get_valid_challenge(self, identifier: str, purpose: str) -> OTPChallenge | None:
        return self.db.query(OTPChallenge).filter(
            OTPChallenge.identifier == identifier.lower(),
            OTPChallenge.purpose == purpose,
            OTPChallenge.verified.is_(False),
        ).order_by(OTPChallenge.created_at.desc()).first()
