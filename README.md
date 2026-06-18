# Intelligent IT Service Desk Assistant

An enterprise-grade full-stack web application for IT support ticket management with Machine Learning-powered automation. Built for final-year Computer Science placement projects and software engineering interviews.

## Features

### Core Functionality
- **User Authentication** — JWT-based auth with bcrypt password hashing
- **Role-Based Access Control** — Employee and Admin roles
- **Ticket Management** — Create, edit, view, assign, close tickets with comments
- **Activity Logging** — Track all ticket lifecycle events
- **Search & Filters** — Search by title, filter by category, priority, status, date
- **Export Reports** — CSV and Excel export for admins

### AI / Machine Learning
- **Automatic Ticket Classification** — TF-IDF + Multinomial Naive Bayes (8 categories)
- **Priority Prediction** — ML classifier with rule-based enhancement
- **Similar Ticket Retrieval** — TF-IDF embeddings + Cosine Similarity
- **Smart Solution Recommendations** — Knowledge base + historical resolutions

### Analytics Dashboard
- KPI cards (total, open, closed, critical tickets)
- Charts: Category distribution, Priority breakdown, Monthly trends, Resolution rate, Department distribution
- Built with Chart.js

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Backend | FastAPI, Python, SQLAlchemy, MySQL, JWT, Scikit-learn |
| Frontend | React (Vite), Tailwind CSS, React Router, Axios, Chart.js |
| ML | TF-IDF Vectorizer, Naive Bayes, Cosine Similarity, Joblib |

## Project Structure

```
it-service-desk-assistant/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── routes/              # API route handlers
│   │   ├── services/            # Business logic
│   │   ├── ml/                  # ML training & inference
│   │   ├── database/            # DB connection
│   │   └── utils/               # Auth utilities
│   ├── main.py                  # Uvicorn entry point
│   ├── seed.py                  # Database seeding
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/               # React page components
│   │   ├── components/          # Reusable UI components
│   │   ├── charts/              # Chart.js visualizations
│   │   ├── services/            # API client
│   │   └── context/             # Auth context
│   └── package.json
├── database/
│   └── schema.sql               # MySQL schema
└── README.md
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8.0+

## Setup Instructions

### 1. Database Setup

```bash
# Start MySQL and create database
mysql -u root -p < database/schema.sql
```

Or manually:
```sql
CREATE DATABASE it_service_desk;
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env       # Windows
# cp .env.example .env       # Linux/Mac
# Edit .env with your MySQL credentials

# Train ML models
python -m app.ml.train_models

# Seed database with demo data
python seed.py

# Start backend server
python main.py
```

Backend runs at: **http://localhost:8000**
API Docs: **http://localhost:8000/api/docs**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:5173**

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | admin123 |
| Employee | john.doe@company.com | employee123 |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/me` | Get current user |

### Tickets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets` | List tickets (with search/filters) |
| GET | `/api/tickets/{id}` | Get ticket details |
| POST | `/api/tickets` | Create ticket (auto ML classification) |
| PUT | `/api/tickets/{id}` | Update ticket |
| DELETE | `/api/tickets/{id}` | Delete ticket (admin) |
| POST | `/api/tickets/predict` | AI preview before submission |
| POST | `/api/tickets/{id}/comments` | Add comment |
| GET | `/api/tickets/export/csv` | Export CSV (admin) |
| GET | `/api/tickets/export/excel` | Export Excel (admin) |

### Dashboard & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/user` | Employee dashboard |
| GET | `/api/dashboard/admin` | Admin dashboard |
| GET | `/api/analytics` | Full analytics data |
| GET | `/api/activity-logs` | Activity logs (admin) |
| GET | `/api/users` | List users (admin) |

## ML Model Details

### Training
- **Dataset**: 120+ labeled IT support tickets across 8 categories and 4 priority levels
- **Category Classifier**: TF-IDF (5000 features, bigrams) + Multinomial Naive Bayes
- **Priority Classifier**: Same pipeline with rule-based keyword enhancement
- **Similarity Engine**: TF-IDF vectorizer + Cosine Similarity

### Evaluation Metrics
Run training to see metrics:
```bash
python -m app.ml.train_models
```
Metrics saved to `backend/app/ml/models/metrics.json`

### Ticket Categories
Network Issues, Software Issues, Hardware Issues, Email Problems, Account Access, Security Issues, Printer Issues, Other

### Priority Levels
Low, Medium, High, Critical

## Interview Talking Points

1. **OOP**: Service classes (TicketService, AnalyticsService), model inheritance with SQLAlchemy Base
2. **DBMS**: Normalized schema with foreign keys, indexes, ENUM types, activity logging
3. **REST APIs**: Full CRUD with proper HTTP status codes, pagination, filtering
4. **Authentication**: JWT tokens, bcrypt hashing, RBAC middleware
5. **Machine Learning**: End-to-end pipeline — data collection, training, evaluation, deployment via Joblib
6. **Full Stack**: React SPA with protected routes, real-time AI preview, Chart.js analytics
7. **Software Engineering**: Separation of concerns (routes → services → models), environment config, seed scripts

## License

MIT — Built for educational and placement purposes.
