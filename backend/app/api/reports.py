from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..api.dependencies import get_current_user
from ..core.database import get_db
from ..models import Report, User
from ..schemas.report import ReportCreate, ReportOut

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.post("", response_model=ReportOut, status_code=status.HTTP_201_CREATED, summary="Submit a report")
def create_report(
    payload: ReportCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Report:
    report = Report(
        user_id=current_user.id,
        restaurant_id=payload.restaurant_id,
        product_id=payload.product_id,
        report_type=payload.report_type,
        description=payload.description,
        status="open",
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/my", response_model=list[ReportOut], summary="List my reports")
def my_reports(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[Report]:
    return db.query(Report).filter(Report.user_id == current_user.id).all()
