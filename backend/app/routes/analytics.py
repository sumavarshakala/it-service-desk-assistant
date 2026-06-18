from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models import User, ActivityLog
from app.schemas import AnalyticsResponse, ActivityLogResponse, UserResponse
from app.services.analytics_service import AnalyticsService
from app.utils.auth import get_current_admin

router = APIRouter(tags=["Analytics & Users"])


@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    return AnalyticsService.get_analytics(db)


@router.get("/activity-logs", response_model=List[ActivityLogResponse])
def get_activity_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    logs = db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(100).all()
    results = []
    for log in logs:
        user = db.query(User).filter(User.id == log.user_id).first()
        results.append(ActivityLogResponse(
            id=log.id,
            user_id=log.user_id,
            user_name=user.name if user else "Unknown",
            action=log.action,
            ticket_id=log.ticket_id,
            timestamp=log.timestamp
        ))
    return results


@router.get("/users", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    return db.query(User).order_by(User.created_at.desc()).all()
