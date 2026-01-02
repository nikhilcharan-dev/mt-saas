# Enterprise Multi-Tenant Task Management System

A production-grade, scalable SaaS platform designed to handle project and task workflows across multiple organizations. Built using modern web technologies including **Node.js**, **Express**, **React**, and **PostgreSQL**, and packaged with **Docker** to ensure reliable deployment and environment consistency.

---

## ✨ Core Features

- **Tenant-Level Data Separation** – Guarantees strict isolation of organizational data  
- **Role-Based Authorization** – Supports three roles: super_admin, tenant_admin, and user  
- **Secure Login Mechanism** – JWT authentication with 24-hour validity and bcrypt-protected passwords  
- **Comprehensive REST APIs** – 19 well-defined endpoints enabling complete CRUD operations  
- **Subscription-Based Limits** – User and project quotas enforced per plan  
- **Audit Trail Support** – Automatic logging of sensitive and critical actions  
- **Modern React Interface** – Protected routes, global state management, and clean UI  
- **Automated Database Initialization** – Migrations and seed data executed automatically  
- **Docker-First Architecture** – Fully containerized services orchestrated using Docker Compose  

---

## 🏗️ System Architecture

```
Presentation Layer (React SPA)
            ↓
Service Layer (Node.js + Express)
            ↓
Persistence Layer (PostgreSQL)
```

- Frontend available at **http://localhost:3000**
- Backend API hosted at **http://localhost:5000/api**
- Database service exposed on **port 5432**

---

## 🚀 Setup & Execution

### Requirements
- Docker and Docker Compose  
- Node.js 18+ (required only for non-containerized development)

### Launch Platform
```bash
docker-compose up -d
```

Once initialized, access the platform using:
- UI: http://localhost:3000  
- API: http://localhost:5000/api  
- Database: localhost:5432  

### Check Running Containers
```bash
docker-compose ps
```

### Stop Services
```bash
docker-compose down
```

---

## 📱 Platform Usage

### Sample Login Accounts

**System Administrator**
- Email: superadmin@system.com  
- Password: Admin@123  

**Tenant Administrator (Demo Tenant)**
- Email: admin@demo.com  
- Password: Demo@123  
- Tenant: demo  

**Standard Users**
- user1@demo.com / User@123  
- user2@demo.com / User@123  
- Tenant: demo  

---

### Organization Onboarding
Use the **Register** option to onboard a new tenant and configure its administrator account.

### User Administration
- List users within the organization  
- Add users with specific roles  
- Modify user details  
- Remove users when required  

### Project Operations
- Create and manage projects  
- Update or archive projects  
- Permanently delete unused projects  

### Task Operations
- Create tasks under projects  
- Assign priority and status  
- Edit or delete tasks  

---

## 📚 API Summary

Detailed API documentation is available in **docs/API.md**.

### Sample Requests

**Authenticate User**
```bash
curl -X POST http://localhost:5000/api/auth/login   -H "Content-Type: application/json"   -d '{
    "email": "admin@demo.com",
    "password": "demo123",
    "tenantSubdomain": "demo"
  }'
```

**Create a Project**
```bash
curl -X POST http://localhost:5000/api/tenants/{tenantId}/projects   -H "Authorization: Bearer <token>"   -H "Content-Type: application/json"   -d '{
    "name": "My Project",
    "description": "Project description",
    "status": "active"
  }'
```

---

## 🔐 Authentication Lifecycle

1. User submits credentials  
2. Server generates a JWT (24-hour expiry)  
3. Client includes token in Authorization header  
4. Middleware validates token on each request  
5. Expired tokens require re-login  

---

## 📊 Data Entities

- **Tenant** – Organization configuration and subscription settings  
- **User** – Account details, role, and tenant association  
- **Project** – Projects owned by tenants  
- **Task** – Action items linked to projects  
- **AuditLog** – Immutable record of platform activities  

---

## 🧪 Validation & Testing

Run end-to-end integration tests:
```bash
node integration-test.js
```

All 19 APIs are tested using realistic scenarios.

---

## 📁 Directory Layout

```
frontend/        # React client
backend/         # Express + TypeScript services
docs/            # Documentation
docker-compose.yml
integration-test.js
submission.json
README.md
```

---

## 🔧 Environment Configuration

### Backend
- DATABASE_URL  
- JWT_SECRET  
- NODE_ENV  

### Frontend
- VITE_API_URL (points to backend API)

Defaults are optimized for Docker-based execution.

---

## 🛡️ Security Practices

- bcrypt password encryption  
- JWT (HS256) authentication  
- Zod-powered input validation  
- Role-based access control  
- Enforced tenant scoping  
- Complete audit logging  
- CORS policy enforcement  
- Containers run as non-root users  

---

## 📦 Subscription Tiers

| Plan | Max Users | Max Projects | Features |
|------|-----------|--------------|----------|
| Free | 5 | 2 | Essential functionality |
| Pro | 50 | 10 | Full feature set |
| Enterprise | Unlimited | Unlimited | No restrictions |

All limits are strictly enforced by the API.

---

## 🐳 Docker Commands

```bash
docker-compose up -d --build
docker logs backend -f
docker-compose down
docker-compose down -v
docker-compose build backend
```

---

## 🧠 Technology Stack

React, Vite, Node.js, Express, TypeScript, PostgreSQL, Prisma, JWT, bcryptjs, Zod, Jest, Docker

---

## 🐛 Troubleshooting

- **Services fail to start** – Inspect logs and rebuild containers  
- **Database delays** – Wait briefly and restart services  
- **Frontend issues** – Confirm API endpoint configuration  
- **Unauthorized responses** – JWT expired, please log in again  

---

## 📝 Additional Information

- All timestamps are stored in UTC  
- Emails must be unique per tenant  
- Super admins are provisioned by the system  
- Demo records are seeded automatically  
- Tokens are stored in browser localStorage  

---

## ✨ Key Highlights

✔ Tenant-based isolation  
✔ Secure role hierarchy  
✔ JWT-driven authentication  
✔ Subscription control  
✔ Automated schema migrations  
✔ Full audit logging  
✔ Docker-enabled deployment  

---

**Author:** **NIKHIL CHARAN GOLLAPALLI**
