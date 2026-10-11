from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..models import User


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def update_profile(self, user: User, name: str | None, phone: str | None) -> User:
        if name is not None:
            user.name = name.strip()
        if phone is not None:
            user.phone = phone
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete_account(self, user: User) -> None:
        user.is_active = False
        self.db.commit()
