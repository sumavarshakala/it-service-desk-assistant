from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models import User
from app.schemas import AdminDashboard, UserDashboard, AnalyticsResponse, UserResponse
from app.services.analytics_service import AnalyticsService
from app.utils.auth import get_current_user, get_current_admin

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/user", response_model=UserDashboard)
def user_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AnalyticsService.get_user_dashboard(db, current_user)


@router.get("/admin", response_model=AdminDashboard)
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    return AnalyticsService.get_admin_dashboard(db)
