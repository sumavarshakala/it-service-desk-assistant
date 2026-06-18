from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    employee = "employee"
    admin = "admin"


class TicketPriority(str, Enum):
    Low = "Low"
    Medium = "Medium"
    High = "High"
    Critical = "Critical"


class TicketStatus(str, Enum):
    Open = "Open"
    In_Progress = "In Progress"
    Assigned = "Assigned"
    Resolved = "Resolved"
    Closed = "Closed"


class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(..., min_length=6)
    department: str = Field(..., min_length=2, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    department: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    comment: str = Field(..., min_length=1)


class CommentResponse(BaseModel):
    id: int
    ticket_id: int
    user_id: int
    user_name: str
    comment: str
    timestamp: datetime

    class Config:
        from_attributes = True


class TicketCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)


class TicketUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    category: Optional[str] = None
    priority: Optional[TicketPriority] = None
    status: Optional[TicketStatus] = None
    assigned_admin: Optional[int] = None
    resolution: Optional[str] = None


class SimilarTicket(BaseModel):
    ticket_id: int
    title: str
    resolution: Optional[str]
    similarity_score: float


class SolutionSuggestion(BaseModel):
    suggestion: str
    source: str


class MLPrediction(BaseModel):
    category: str
    category_confidence: float
    priority: str
    priority_confidence: float
    similar_tickets: List[SimilarTicket]
    suggestions: List[SolutionSuggestion]


class TicketResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    priority: TicketPriority
    status: TicketStatus
    employee_id: int
    employee_name: Optional[str] = None
    assigned_admin: Optional[int] = None
    admin_name: Optional[str] = None
    resolution: Optional[str] = None
    category_confidence: Optional[float] = None
    priority_confidence: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    comments: List[CommentResponse] = []

    class Config:
        from_attributes = True


class TicketListResponse(BaseModel):
    tickets: List[TicketResponse]
    total: int
    page: int
    page_size: int


class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    action: str
    ticket_id: Optional[int]
    timestamp: datetime

    class Config:
        from_attributes = True


class UserDashboard(BaseModel):
    total_tickets: int
    open_tickets: int
    in_progress_tickets: int
    resolved_tickets: int
    recent_tickets: List[TicketResponse]


class AdminDashboard(BaseModel):
    total_tickets: int
    open_tickets: int
    closed_tickets: int
    critical_tickets: int
    avg_resolution_hours: float
    tickets_by_category: dict
    tickets_by_priority: dict
    monthly_trends: dict
    resolution_rate: float
    department_distribution: dict
    recent_activity: List[ActivityLogResponse]


class AnalyticsResponse(BaseModel):
    total_tickets: int
    open_tickets: int
    closed_tickets: int
    critical_tickets: int
    avg_resolution_hours: float
    tickets_by_category: dict
    tickets_by_priority: dict
    monthly_trends: dict
    resolution_rate: float
    department_distribution: dict
    status_distribution: dict


class PredictRequest(BaseModel):
    title: str
    description: str
