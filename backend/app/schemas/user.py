from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    phone: str | None = Field(default=None, min_length=7, max_length=30)


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None = None
    role: str
    is_verified: bool
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
