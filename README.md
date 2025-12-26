# 🏢 Multi-Tenant SaaS Platform

A full-stack **Multi-Tenant SaaS Application** with **strict tenant data isolation** and **role-based access control**.  
The platform supports **Super Admin**, **Tenant Admin**, and **End Users**, enabling secure project and task management across multiple tenants.

This project is fully **Dockerized** and production-ready, with automated database migrations and seed data loading.

---

## 🚀 Tech Stack

### Frontend
- React (Vite)
- Axios
- React Router DOM

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcrypt (password hashing)

### Database
- PostgreSQL

### DevOps & Tools
- Docker
- Docker Compose
- Git
- Postman / Swagger (API testing)

---

## ✨ Features

- Multi-tenant architecture using **shared database with tenant isolation**
- Role-based authentication and authorization (JWT)
- Super Admin tenant registration
- Tenant Admin project and task management
- User-level task access
- Secure audit logging
- Automatic database migrations and seed data loading
- Fully containerized frontend, backend, and database

---

---

## ⚙️ Environment Setup

### Prerequisites
- Node.js **>= 18**
- Docker & Docker Compose
- Git

---

## 🐳 Run Application Using Docker (Recommended)

Clone the repository:
bash
git clone https://github.com/Sravanipunnam/multi-tenant-saas.git
cd multi-tenant-saas
docker-compose up -d --build

### Application URLs

- Frontend: http://localhost:3000

- Backend API: http://localhost:5000

- Health Check: http://localhost:5000/api/health

- Database migrations and seed data load automatically on backend startup

### Test Credintials
-- Email: admin@demo.com
-- Password: Demo@123
-- Tenant Subdomain: demo

-- Email: user1@demo.com
-- Password: User@123
-- Tenant Subdomain: demo

## 🔐 Security Highlights

- **Password Hashing:**  
  All user passwords are securely hashed using **bcrypt** before being stored in the database, preventing plain-text password exposure.

- **JWT-Based Stateless Authentication:**  
  Authentication is handled using **JSON Web Tokens (JWT)**, enabling secure, stateless session management without server-side session storage.

- **Role-Based Authorization:**  
  Custom authorization middleware enforces access control based on user roles (**super_admin**, **tenant_admin**, **user**), ensuring users can only access permitted resources.

- **Tenant Data Isolation:**  
  Strict tenant isolation is implemented using `tenant_id` filtering at the application level, preventing cross-tenant data access.

- **Audit Logging:**  
  Critical system actions such as tenant creation, project creation, and task updates are logged in an `audit_logs` table for traceability and security monitoring.

### Sravani Punnam
### Full-Stack Developer | Backend & System Design Enthusiast
