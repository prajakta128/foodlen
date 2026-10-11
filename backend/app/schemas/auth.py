from __future__ import annotations

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: str | None = Field(default=None, min_length=7, max_length=30)
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(ch.isupper() for ch in value):
            raise ValueError("Password must contain at least one uppercase character")
        if not any(ch.isdigit() for ch in value):
            raise ValueError("Password must contain at least one number")
        return value


class LoginRequest(BaseModel):
    identifier: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)


class OTPRequest(BaseModel):
    identifier: str = Field(..., min_length=1, max_length=255)
    purpose: str = Field(default="signup", min_length=1, max_length=50)


class VerifyOTPRequest(BaseModel):
    identifier: str = Field(..., min_length=1, max_length=255)
    otp: str = Field(..., min_length=6, max_length=6)
    purpose: str = Field(default="signup", min_length=1, max_length=50)


class RefreshRequest(BaseModel):
    refresh_token: str = Field(..., min_length=10)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None = None
    role: str
    is_verified: bool
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
