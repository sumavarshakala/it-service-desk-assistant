import io
import csv
from datetime import datetime
from typing import List
from sqlalchemy.orm import Session, joinedload
import pandas as pd

from app.models import Ticket, User


class ExportService:
    @staticmethod
    def _get_export_data(db: Session) -> List[dict]:
        tickets = db.query(Ticket).options(
            joinedload(Ticket.employee),
            joinedload(Ticket.admin)
        ).order_by(Ticket.created_at.desc()).all()

        return [
            {
                "Ticket ID": t.id,
                "Title": t.title,
                "Description": t.description,
                "Category": t.category,
                "Priority": t.priority.value if hasattr(t.priority, 'value') else t.priority,
                "Status": t.status.value if hasattr(t.status, 'value') else t.status,
                "Employee": t.employee.name if t.employee else "",
                "Department": t.employee.department if t.employee else "",
                "Assigned Admin": t.admin.name if t.admin else "",
                "Resolution": t.resolution or "",
                "Created At": t.created_at.strftime("%Y-%m-%d %H:%M") if t.created_at else "",
                "Updated At": t.updated_at.strftime("%Y-%m-%d %H:%M") if t.updated_at else "",
                "Resolved At": t.resolved_at.strftime("%Y-%m-%d %H:%M") if t.resolved_at else "",
            }
            for t in tickets
        ]

    @staticmethod
    def export_csv(db: Session) -> str:
        data = ExportService._get_export_data(db)
        if not data:
            return "Ticket ID,Title,Description,Category,Priority,Status\n"

        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
        return output.getvalue()

    @staticmethod
    def export_excel(db: Session) -> bytes:
        data = ExportService._get_export_data(db)
        df = pd.DataFrame(data) if data else pd.DataFrame()
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="Tickets")
        output.seek(0)
        return output.getvalue()
