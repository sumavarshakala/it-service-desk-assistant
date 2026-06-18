from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from fastapi import HTTPException, status

from app.models import Ticket, Comment, User, UserRole, TicketStatus, ActivityLog
from app.schemas import TicketCreate, TicketUpdate, TicketResponse, CommentResponse
from app.ml.inference import ml_service
from app.utils.auth import log_activity


def _ticket_to_response(ticket: Ticket) -> TicketResponse:
    comments = [
        CommentResponse(
            id=c.id,
            ticket_id=c.ticket_id,
            user_id=c.user_id,
            user_name=c.user.name if c.user else "Unknown",
            comment=c.comment,
            timestamp=c.timestamp
        )
        for c in (ticket.comments or [])
    ]
    return TicketResponse(
        id=ticket.id,
        title=ticket.title,
        description=ticket.description,
        category=ticket.category,
        priority=ticket.priority,
        status=ticket.status,
        employee_id=ticket.employee_id,
        employee_name=ticket.employee.name if ticket.employee else None,
        assigned_admin=ticket.assigned_admin,
        admin_name=ticket.admin.name if ticket.admin else None,
        resolution=ticket.resolution,
        category_confidence=ticket.category_confidence,
        priority_confidence=ticket.priority_confidence,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        resolved_at=ticket.resolved_at,
        comments=comments
    )


class TicketService:
    @staticmethod
    def get_tickets(
        db: Session,
        user: User,
        search: Optional[str] = None,
        category: Optional[str] = None,
        priority: Optional[str] = None,
        status_filter: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        page: int = 1,
        page_size: int = 20
    ):
        query = db.query(Ticket).options(
            joinedload(Ticket.employee),
            joinedload(Ticket.admin),
            joinedload(Ticket.comments).joinedload(Comment.user)
        )

        if user.role == UserRole.employee:
            query = query.filter(Ticket.employee_id == user.id)

        if search:
            query = query.filter(
                or_(
                    Ticket.title.ilike(f"%{search}%"),
                    Ticket.description.ilike(f"%{search}%")
                )
            )
        if category:
            query = query.filter(Ticket.category == category)
        if priority:
            query = query.filter(Ticket.priority == priority)
        if status_filter:
            query = query.filter(Ticket.status == status_filter)
        if date_from:
            query = query.filter(Ticket.created_at >= date_from)
        if date_to:
            query = query.filter(Ticket.created_at <= date_to)

        total = query.count()

        sort_col = getattr(Ticket, sort_by, Ticket.created_at)
        if sort_order == "asc":
            query = query.order_by(sort_col.asc())
        else:
            query = query.order_by(sort_col.desc())

        tickets = query.offset((page - 1) * page_size).limit(page_size).all()
        return [_ticket_to_response(t) for t in tickets], total

    @staticmethod
    def get_ticket(db: Session, ticket_id: int, user: User) -> TicketResponse:
        ticket = db.query(Ticket).options(
            joinedload(Ticket.employee),
            joinedload(Ticket.admin),
            joinedload(Ticket.comments).joinedload(Comment.user)
        ).filter(Ticket.id == ticket_id).first()

        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        if user.role == UserRole.employee and ticket.employee_id != user.id:
            raise HTTPException(status_code=403, detail="Access denied")

        return _ticket_to_response(ticket)

    @staticmethod
    def create_ticket(db: Session, data: TicketCreate, user: User) -> TicketResponse:
        historical = db.query(Ticket).filter(
            Ticket.resolution.isnot(None),
            Ticket.status.in_([TicketStatus.Resolved, TicketStatus.Closed])
        ).all()

        hist_data = [
            {"id": t.id, "title": t.title, "description": t.description, "resolution": t.resolution}
            for t in historical
        ]

        prediction = ml_service.full_prediction(data.title, data.description, hist_data)

        ticket = Ticket(
            title=data.title,
            description=data.description,
            category=prediction["category"],
            priority=prediction["priority"],
            employee_id=user.id,
            category_confidence=prediction["category_confidence"],
            priority_confidence=prediction["priority_confidence"]
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)

        log_activity(db, user.id, f"Created ticket: {ticket.title}", ticket.id)

        ticket = db.query(Ticket).options(
            joinedload(Ticket.employee),
            joinedload(Ticket.admin),
            joinedload(Ticket.comments)
        ).filter(Ticket.id == ticket.id).first()

        return _ticket_to_response(ticket)

    @staticmethod
    def update_ticket(db: Session, ticket_id: int, data: TicketUpdate, user: User) -> TicketResponse:
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")

        if user.role == UserRole.employee:
            if ticket.employee_id != user.id:
                raise HTTPException(status_code=403, detail="Access denied")
            allowed = {"title", "description"}
            update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items() if k in allowed}
        else:
            update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            if value is not None:
                setattr(ticket, key, value)

        if update_data.get("status") in [TicketStatus.Resolved, TicketStatus.Closed]:
            ticket.resolved_at = datetime.utcnow()

        ticket.updated_at = datetime.utcnow()
        db.commit()

        log_activity(db, user.id, f"Updated ticket #{ticket_id}", ticket_id)

        ticket = db.query(Ticket).options(
            joinedload(Ticket.employee),
            joinedload(Ticket.admin),
            joinedload(Ticket.comments).joinedload(Comment.user)
        ).filter(Ticket.id == ticket_id).first()

        return _ticket_to_response(ticket)

    @staticmethod
    def delete_ticket(db: Session, ticket_id: int, user: User):
        if user.role != UserRole.admin:
            raise HTTPException(status_code=403, detail="Admin access required")

        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")

        log_activity(db, user.id, f"Deleted ticket #{ticket_id}", ticket_id)
        db.delete(ticket)
        db.commit()

    @staticmethod
    def add_comment(db: Session, ticket_id: int, comment_text: str, user: User) -> CommentResponse:
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        if user.role == UserRole.employee and ticket.employee_id != user.id:
            raise HTTPException(status_code=403, detail="Access denied")

        comment = Comment(ticket_id=ticket_id, user_id=user.id, comment=comment_text)
        db.add(comment)
        db.commit()
        db.refresh(comment)

        log_activity(db, user.id, f"Added comment on ticket #{ticket_id}", ticket_id)

        return CommentResponse(
            id=comment.id,
            ticket_id=comment.ticket_id,
            user_id=comment.user_id,
            user_name=user.name,
            comment=comment.comment,
            timestamp=comment.timestamp
        )

    @staticmethod
    def predict(db: Session, title: str, description: str) -> dict:
        historical = db.query(Ticket).filter(
            Ticket.resolution.isnot(None),
            Ticket.status.in_([TicketStatus.Resolved, TicketStatus.Closed])
        ).all()
        hist_data = [
            {"id": t.id, "title": t.title, "description": t.description, "resolution": t.resolution}
            for t in historical
        ]
        return ml_service.full_prediction(title, description, hist_data)
