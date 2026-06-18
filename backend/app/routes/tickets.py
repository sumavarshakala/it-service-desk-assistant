from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from app.database.connection import get_db
from app.models import User
from app.schemas import (
    TicketCreate, TicketUpdate, TicketResponse, TicketListResponse,
    CommentCreate, CommentResponse, MLPrediction, PredictRequest
)
from app.services.ticket_service import TicketService
from app.services.export_service import ExportService
from app.utils.auth import get_current_user, get_current_admin

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.get("", response_model=TicketListResponse)
def list_tickets(
    search: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tickets, total = TicketService.get_tickets(
        db, current_user, search, category, priority, status,
        date_from, date_to, sort_by, sort_order, page, page_size
    )
    return TicketListResponse(tickets=tickets, total=total, page=page, page_size=page_size)


@router.get("/export/csv")
def export_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    csv_content = ExportService.export_csv(db)
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=tickets_{datetime.now().strftime('%Y%m%d')}.csv"}
    )


@router.get("/export/excel")
def export_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    excel_bytes = ExportService.export_excel(db)
    return StreamingResponse(
        io.BytesIO(excel_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=tickets_{datetime.now().strftime('%Y%m%d')}.xlsx"}
    )


@router.post("/predict", response_model=MLPrediction)
def predict_ticket(
    data: PredictRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return TicketService.predict(db, data.title, data.description)


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return TicketService.get_ticket(db, ticket_id, current_user)


@router.post("", response_model=TicketResponse, status_code=201)
def create_ticket(
    data: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return TicketService.create_ticket(db, data, current_user)


@router.put("/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: int,
    data: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return TicketService.update_ticket(db, ticket_id, data, current_user)


@router.delete("/{ticket_id}", status_code=204)
def delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    TicketService.delete_ticket(db, ticket_id, current_user)


@router.post("/{ticket_id}/comments", response_model=CommentResponse, status_code=201)
def add_comment(
    ticket_id: int,
    data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return TicketService.add_comment(db, ticket_id, data.comment, current_user)
