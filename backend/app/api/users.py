from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..api.dependencies import get_current_user
from ..core.database import get_db
from ..models import User
from ..schemas.user import UserOut, UserUpdate
from ..services.user_service import UserService

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me", response_model=UserOut, summary="Get current user profile")
def get_me(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    return current_user


@router.patch("/me", response_model=UserOut, summary="Update current user profile")
def update_me(payload: UserUpdate, current_user: Annotated[User, Depends(get_current_user)], db: Annotated[Session, Depends(get_db)]) -> User:
    service = UserService(db)
    return service.update_profile(current_user, payload.name, payload.phone)


@router.delete("/me", summary="Deactivate current account")
def delete_me(current_user: Annotated[User, Depends(get_current_user)], db: Annotated[Session, Depends(get_db)]) -> dict:
    service = UserService(db)
    service.delete_account(current_user)
    return {"message": "Account deactivated successfully"}
