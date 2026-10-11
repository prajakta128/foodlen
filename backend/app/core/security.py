from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from passlib.context import CryptContext

from .config import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(subject: str, extra_claims: dict[str, Any] | None = None) -> str:
    expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "exp": now + expires_delta,
        "iat": now,
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_refresh_token(subject: str) -> str:
    expires_delta = timedelta(days=settings.refresh_token_expire_days)
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "exp": now + expires_delta,
        "iat": now,
        "type": "refresh",
        # A random jti guarantees uniqueness even when two refresh tokens for the
        # same user are issued within the same second (same iat/exp) — without
        # this, JWTs are deterministic and a second login in the same second
        # collides with the DB's unique constraint on sessions.refresh_token.
        "jti": secrets.token_hex(16),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])


def generate_otp() -> str:
    return f"{secrets.randbelow(1000000):06d}"


def verify_otp_candidate(candidate: str) -> bool:
    return candidate.isdigit() and len(candidate) == 6
