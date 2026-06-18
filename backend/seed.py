"""Seed script to create default admin and sample tickets."""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import SessionLocal, engine, Base
from app.models import User, Ticket, UserRole, TicketStatus, TicketPriority
from app.utils.auth import get_password_hash


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        admin = db.query(User).filter(User.email == "admin@company.com").first()
        if not admin:
            admin = User(
                name="System Admin",
                email="admin@company.com",
                password_hash=get_password_hash("admin123"),
                department="IT",
                role=UserRole.admin
            )
            db.add(admin)
            db.commit()
            print("Created admin: admin@company.com / admin123")

        employee = db.query(User).filter(User.email == "john.doe@company.com").first()
        if not employee:
            employee = User(
                name="John Doe",
                email="john.doe@company.com",
                password_hash=get_password_hash("employee123"),
                department="Engineering",
                role=UserRole.employee
            )
            db.add(employee)
            db.commit()
            print("Created employee: john.doe@company.com / employee123")

        if db.query(Ticket).count() == 0:
            sample_tickets = [
                ("VPN connection failed", "Unable to connect to corporate VPN from home office", "Network Issues", "High", "Resolved", "Restarted VPN client and updated credentials"),
                ("Outlook not syncing", "Emails not syncing in Outlook since morning", "Email Problems", "Medium", "Closed", "Rebuilt OST file and reconfigured account"),
                ("Printer offline", "Floor 3 printer showing offline status", "Printer Issues", "Low", "Resolved", "Restarted print spooler service"),
                ("Password reset needed", "Forgot password for SAP system", "Account Access", "Low", "Closed", "Reset via self-service portal"),
                ("Laptop overheating", "Laptop shuts down due to overheating during meetings", "Hardware Issues", "High", "Open", None),
            ]
            for title, desc, cat, pri, status, resolution in sample_tickets:
                ticket = Ticket(
                    title=title,
                    description=desc,
                    category=cat,
                    priority=TicketPriority(pri),
                    status=TicketStatus(status),
                    employee_id=employee.id,
                    resolution=resolution
                )
                db.add(ticket)
            db.commit()
            print(f"Created {len(sample_tickets)} sample tickets")

        print("Seeding complete!")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
