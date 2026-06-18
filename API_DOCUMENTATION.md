# API Documentation

Base URL: `http://localhost:8000/api`

Interactive docs: `http://localhost:8000/api/docs`

## Authentication

All endpoints except `/auth/register` and `/auth/login` require a Bearer token:

```
Authorization: Bearer <access_token>
```

---

## Auth Endpoints

### POST /auth/register

Register a new employee account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@company.com",
  "password": "securepass",
  "department": "Engineering"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@company.com",
  "department": "Engineering",
  "role": "employee",
  "created_at": "2025-01-15T10:00:00"
}
```

### POST /auth/login

Authenticate and receive JWT token. Uses OAuth2 form format.

**Request Body (form-urlencoded):**
```
username=john@company.com&password=securepass
```

**Response:**
```json
{
  "access_token": "eyJhbG...",
  "token_type": "bearer"
}
```

### GET /auth/me

Get current authenticated user profile.

---

## Ticket Endpoints

### GET /tickets

List tickets with optional filters. Employees see only their tickets; admins see all.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| search | string | Search title/description |
| category | string | Filter by category |
| priority | string | Low/Medium/High/Critical |
| status | string | Open/In Progress/Assigned/Resolved/Closed |
| date_from | datetime | Created after |
| date_to | datetime | Created before |
| sort_by | string | Field to sort (default: created_at) |
| sort_order | string | asc/desc |
| page | int | Page number (default: 1) |
| page_size | int | Items per page (default: 20) |

### POST /tickets

Create a new ticket. ML auto-classifies category and priority.

**Request Body:**
```json
{
  "title": "VPN not connecting",
  "description": "Unable to connect to corporate VPN from home office since this morning"
}
```

**Response:** Ticket object with ML-predicted category, priority, and confidence scores.

### POST /tickets/predict

AI preview before ticket submission. Returns classification, priority, similar tickets, and solution suggestions.

**Request Body:**
```json
{
  "title": "VPN not connecting",
  "description": "Unable to connect to corporate VPN"
}
```

**Response:**
```json
{
  "category": "Network Issues",
  "category_confidence": 0.92,
  "priority": "High",
  "priority_confidence": 0.78,
  "similar_tickets": [
    {
      "ticket_id": 1,
      "title": "VPN connection failed",
      "resolution": "Restarted VPN client",
      "similarity_score": 0.85
    }
  ],
  "suggestions": [
    {
      "suggestion": "Restart the VPN client application",
      "source": "Knowledge Base"
    }
  ]
}
```

### GET /tickets/{id}

Get full ticket details including comments.

### PUT /tickets/{id}

Update ticket. Employees can edit title/description. Admins can update all fields.

**Request Body (all optional):**
```json
{
  "title": "Updated title",
  "status": "In Progress",
  "priority": "High",
  "assigned_admin": 1,
  "resolution": "Issue resolved by restarting service"
}
```

### DELETE /tickets/{id}

Delete ticket (admin only).

### POST /tickets/{id}/comments

Add a comment to a ticket.

### GET /tickets/export/csv

Export all tickets as CSV (admin only).

### GET /tickets/export/excel

Export all tickets as Excel (admin only).

---

## Dashboard Endpoints

### GET /dashboard/user

Employee dashboard with ticket counts and recent tickets.

### GET /dashboard/admin

Admin dashboard with KPIs, charts data, and recent activity.

---

## Analytics Endpoints

### GET /analytics

Full analytics data for charts (admin only).

### GET /activity-logs

Recent activity logs (admin only).

### GET /users

List all registered users (admin only).

---

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad request / validation error |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |

```json
{
  "detail": "Error message"
}
```
