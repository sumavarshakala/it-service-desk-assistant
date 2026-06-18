from sqlalchemy import Column, Integer, String, DateTime, Enum, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database.connection import Base


class UserRole(str, enum.Enum):
    employee = "employee"
    admin = "admin"


class TicketPriority(str, enum.Enum):
    Low = "Low"
    Medium = "Medium"
    High = "High"
    Critical = "Critical"


class TicketStatus(str, enum.Enum):
    Open = "Open"
    In_Progress = "In Progress"
    Assigned = "Assigned"
    Resolved = "Resolved"
    Closed = "Closed"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.employee, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    tickets = relationship("Ticket", back_populates="employee", foreign_keys="Ticket.employee_id")
    assigned_tickets = relationship("Ticket", back_populates="admin", foreign_keys="Ticket.assigned_admin")
    comments = relationship("Comment", back_populates="user")
    activity_logs = relationship("ActivityLog", back_populates="user")


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    priority = Column(Enum(TicketPriority), default=TicketPriority.Medium, nullable=False)
    status = Column(Enum(TicketStatus), default=TicketStatus.Open, nullable=False)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_admin = Column(Integer, ForeignKey("users.id"), nullable=True)
    resolution = Column(Text, nullable=True)
    category_confidence = Column(Float, nullable=True)
    priority_confidence = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    employee = relationship("User", back_populates="tickets", foreign_keys=[employee_id])
    admin = relationship("User", back_populates="assigned_tickets", foreign_keys=[assigned_admin])
    comments = relationship("Comment", back_populates="ticket", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="ticket")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    comment = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    ticket = relationship("Ticket", back_populates="comments")
    user = relationship("User", back_populates="comments")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(500), nullable=False)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="activity_logs")
    ticket = relationship("Ticket", back_populates="activity_logs")
