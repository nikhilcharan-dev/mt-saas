# System Architecture Document
## Multi-Tenant SaaS Platform – Project & Task Management System

---

## 1. System Architecture Overview

The system follows a three-tier architecture consisting of a frontend client, backend API server, and a relational database. Docker is used to containerize and orchestrate all services.

### Components:
- **Client (Browser):** Accessed by users via web browser
- **Frontend:** React-based UI for interaction
- **Backend:** Node.js + Express REST API
- **Database:** PostgreSQL for persistent storage
- **Authentication:** JWT-based stateless authentication

### Architecture Flow:
1. User interacts with the frontend
2. Frontend sends API requests to backend
3. Backend validates JWT and role permissions
4. Backend queries PostgreSQL with tenant isolation
5. Response returned to frontend

---

## 2. System Architecture Diagram

The diagram below represents the high-level system architecture.

**Diagram Location:**  
`docs/images/system-architecture.png`

**Description:**
- Browser communicates with frontend
- Frontend communicates with backend API
- Backend communicates with PostgreSQL database
- JWT used for authentication
- Tenant isolation enforced at API level

*(Diagram will be added as an image file)*

---

## 3. Database Schema Design (ERD)

The database schema is designed to enforce tenant isolation and data integrity.

### Core Tables:
- tenants
- users
- projects
- tasks
- audit_logs

Each table (except super_admin users) includes a `tenant_id` column.

**ERD Diagram Location:**  
`docs/images/database-erd.png`

**Design Highlights:**
- Foreign keys with CASCADE delete
- Indexes on tenant_id for performance
- Composite unique constraint on (tenant_id, email)

*(ERD diagram will be added as an image file)*

---

## 4. API Architecture

### Authentication APIs
- POST /api/auth/register-tenant (Public)
- POST /api/auth/login (Public)
- GET /api/auth/me (Authenticated)
- POST /api/auth/logout (Authenticated)

### Tenant Management APIs
- GET /api/tenants/:tenantId (Authenticated)
- PUT /api/tenants/:tenantId (Tenant Admin / Super Admin)
- GET /api/tenants (Super Admin only)

### User Management APIs
- POST /api/tenants/:tenantId/users (Tenant Admin)
- GET /api/tenants/:tenantId/users (Authenticated)
- PUT /api/users/:userId (Authenticated)
- DELETE /api/users/:userId (Tenant Admin)

### Project Management APIs
- POST /api/projects (Authenticated)
- GET /api/projects (Authenticated)
- PUT /api/projects/:projectId (Tenant Admin / Creator)
- DELETE /api/projects/:projectId (Tenant Admin / Creator)

### Task Management APIs
- POST /api/projects/:projectId/tasks (Authenticated)
- GET /api/projects/:projectId/tasks (Authenticated)
- PATCH /api/tasks/:taskId/status (Authenticated)
- PUT /api/tasks/:taskId (Authenticated)

---

## 5. Authentication & Authorization Flow

- Users authenticate using email, password, and tenant subdomain
- Backend issues JWT containing:
  - userId
  - tenantId
  - role
- JWT is sent in Authorization header for all protected APIs
- Role-based middleware checks permissions
- Tenant isolation middleware filters data by tenant_id

---

## 6. Multi-Tenancy Enforcement Strategy

- tenant_id is extracted from JWT token
- All database queries are filtered using tenant_id
- Super admin role bypasses tenant filter
- Client is never allowed to send tenant_id in request body

---

## 7. Audit Logging

All critical actions such as CREATE, UPDATE, and DELETE are logged in the audit_logs table with:
- tenant_id
- user_id
- action
- entity_type
- entity_id
- timestamp
