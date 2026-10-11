from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..api.dependencies import require_admin
from ..core.database import get_db
from ..models import Report, Restaurant, User
from ..schemas.report import ReportOut, ReportUpdate

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/users", summary="List all users")
def list_users(
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> list[dict]:
    users = db.query(User).all()
    return [{
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "is_verified": user.is_verified,
        "is_active": user.is_active,
    } for user in users]


@router.get("/restaurants", summary="List all restaurants")
def list_restaurants(
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> list[dict]:
    restaurants = db.query(Restaurant).all()
    return [{
        "id": restaurant.id,
        "name": restaurant.name,
        "owner_id": restaurant.owner_id,
        "verification_status": restaurant.verification_status,
        "city": restaurant.city,
    } for restaurant in restaurants]


@router.get("/reports", response_model=list[ReportOut], summary="List all reports")
def list_reports(
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> list[Report]:
    return db.query(Report).all()


@router.get("/analytics/overview", summary="Get admin analytics overview")
def analytics_overview(
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    registered_consumers = db.query(User).filter(User.role == "consumer").count()
    active_consumers = db.query(User).filter(User.role == "consumer", User.is_active.is_(True)).count()
    restaurants = db.query(Restaurant).count()
    reports = db.query(Report).count()
    analyses = 0
    return {
        "registered_consumers": registered_consumers,
        "active_consumers": active_consumers,
        "restaurants": restaurants,
        "reports": reports,
        "analyses": analyses,
    }


@router.patch("/reports/{report_id}", response_model=ReportOut, summary="Moderate a report")
def moderate_report(
    report_id: int,
    payload: ReportUpdate,
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> Report:
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    report.status = payload.status
    db.commit()
    db.refresh(report)
    return report
