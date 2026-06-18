from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import defaultdict

from app.models import Ticket, User, ActivityLog, TicketStatus, TicketPriority, UserRole
from app.schemas import AdminDashboard, UserDashboard, AnalyticsResponse, ActivityLogResponse, TicketResponse
from app.services.ticket_service import _ticket_to_response


class AnalyticsService:
    @staticmethod
    def _avg_resolution_hours(db: Session) -> float:
        resolved = db.query(Ticket).filter(
            Ticket.resolved_at.isnot(None)
        ).all()
        if not resolved:
            return 0.0
        total_hours = sum(
            (t.resolved_at - t.created_at).total_seconds() / 3600
            for t in resolved if t.resolved_at and t.created_at
        )
        return round(total_hours / len(resolved), 2)

    @staticmethod
    def _tickets_by_field(db: Session, field) -> dict:
        results = db.query(field, func.count(Ticket.id)).group_by(field).all()
        return {str(k): v for k, v in results}

    @staticmethod
    def _monthly_trends(db: Session) -> dict:
        six_months_ago = datetime.utcnow() - timedelta(days=180)
        tickets = db.query(Ticket).filter(Ticket.created_at >= six_months_ago).all()
        trends = defaultdict(int)
        for t in tickets:
            month_key = t.created_at.strftime("%Y-%m")
            trends[month_key] += 1
        return dict(sorted(trends.items()))

    @staticmethod
    def _department_distribution(db: Session) -> dict:
        results = db.query(User.department, func.count(Ticket.id)).join(
            Ticket, Ticket.employee_id == User.id
        ).group_by(User.department).all()
        return {dept: count for dept, count in results}

    @staticmethod
    def get_user_dashboard(db: Session, user: User) -> UserDashboard:
        tickets = db.query(Ticket).filter(Ticket.employee_id == user.id).all()
        recent = db.query(Ticket).filter(
            Ticket.employee_id == user.id
        ).order_by(Ticket.created_at.desc()).limit(5).all()

        return UserDashboard(
            total_tickets=len(tickets),
            open_tickets=sum(1 for t in tickets if t.status == TicketStatus.Open),
            in_progress_tickets=sum(1 for t in tickets if t.status in [TicketStatus.In_Progress, TicketStatus.Assigned]),
            resolved_tickets=sum(1 for t in tickets if t.status in [TicketStatus.Resolved, TicketStatus.Closed]),
            recent_tickets=[_ticket_to_response(t) for t in recent]
        )

    @staticmethod
    def get_admin_dashboard(db: Session) -> AdminDashboard:
        total = db.query(Ticket).count()
        open_count = db.query(Ticket).filter(
            Ticket.status.in_([TicketStatus.Open, TicketStatus.In_Progress, TicketStatus.Assigned])
        ).count()
        closed_count = db.query(Ticket).filter(
            Ticket.status.in_([TicketStatus.Resolved, TicketStatus.Closed])
        ).count()
        critical_count = db.query(Ticket).filter(Ticket.priority == TicketPriority.Critical).count()

        recent_logs = db.query(ActivityLog).order_by(
            ActivityLog.timestamp.desc()
        ).limit(10).all()

        activity_responses = []
        for log in recent_logs:
            user = db.query(User).filter(User.id == log.user_id).first()
            activity_responses.append(ActivityLogResponse(
                id=log.id,
                user_id=log.user_id,
                user_name=user.name if user else "Unknown",
                action=log.action,
                ticket_id=log.ticket_id,
                timestamp=log.timestamp
            ))

        resolution_rate = round((closed_count / total * 100) if total > 0 else 0, 2)

        return AdminDashboard(
            total_tickets=total,
            open_tickets=open_count,
            closed_tickets=closed_count,
            critical_tickets=critical_count,
            avg_resolution_hours=AnalyticsService._avg_resolution_hours(db),
            tickets_by_category=AnalyticsService._tickets_by_field(db, Ticket.category),
            tickets_by_priority=AnalyticsService._tickets_by_field(db, Ticket.priority),
            monthly_trends=AnalyticsService._monthly_trends(db),
            resolution_rate=resolution_rate,
            department_distribution=AnalyticsService._department_distribution(db),
            recent_activity=activity_responses
        )

    @staticmethod
    def get_analytics(db: Session) -> AnalyticsResponse:
        dashboard = AnalyticsService.get_admin_dashboard(db)
        status_dist = AnalyticsService._tickets_by_field(db, Ticket.status)

        return AnalyticsResponse(
            total_tickets=dashboard.total_tickets,
            open_tickets=dashboard.open_tickets,
            closed_tickets=dashboard.closed_tickets,
            critical_tickets=dashboard.critical_tickets,
            avg_resolution_hours=dashboard.avg_resolution_hours,
            tickets_by_category=dashboard.tickets_by_category,
            tickets_by_priority=dashboard.tickets_by_priority,
            monthly_trends=dashboard.monthly_trends,
            resolution_rate=dashboard.resolution_rate,
            department_distribution=dashboard.department_distribution,
            status_distribution=status_dist
        )
