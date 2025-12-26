# Technical Specification
## Multi-Tenant SaaS Platform – Project & Task Management System

---

## 1. Project Structure

### Backend Structure

backend/
├── src/
│ ├── controllers/ # Business logic for APIs
│ ├── routes/ # API route definitions
│ ├── middleware/ # Auth, RBAC, tenant isolation
│ ├── models/ # Database query logic
│ ├── utils/ # Helper functions (JWT, audit logs)
│ ├── config/ # Database and environment config
│ └── app.js # Express app entry point
├── migrations/ # SQL migration files
├── seeds/ # Seed data SQL
├── Dockerfile # Backend Docker configuration
├── package.json
└── .env

### Frontend Structure

frontend/
├── src/
│ ├── components/ # Reusable UI components
│ ├── pages/ # Page-level components
│ ├── services/ # API calls (Axios)
│ ├── context/ # Auth and global state
│ ├── routes/ # Protected routes
│ ├── utils/ # Helper utilities
│ └── App.js
├── public/
├── Dockerfile # Frontend Docker configuration
└── package.json

---

## 2. Development Setup Guide

### Prerequisites
- Node.js v18+
- Docker & Docker Compose
- Git

---

## 3. Environment Variables

### Backend Environment Variables

DB_HOST=database
DB_PORT=5432
DB_NAME=saas_db
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

PORT=5000
NODE_ENV=development

FRONTEND_URL=http://frontend:3000

---

## 4. Local Development Setup

### Step 1: Clone Repository
git clone <repository-url>
cd mt-saas

### Step 2: Start Application with Docker

### Step 3: Verify Services
- Backend Health Check: http://localhost:5000/api/health
- Frontend: http://localhost:3000

---

## 5. Database Setup

- Migrations run automatically on backend startup
- Seed data loads automatically
- No manual database commands required

---

## 6. Testing

- APIs tested using Postman or Swagger
- JWT token required for protected routes
- Role-based access validated manually
