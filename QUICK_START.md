# Enterprise Task Platform – Quick Start Reference (Rewritten)

## 🚀 Startup Instructions

```bash
cd "d:\GPP\Multi-Tenant SaaS Platform with Project & Task Management"
docker-compose up -d
```

Allow approximately **10 to 15 seconds** for all containers to become fully operational.

---

## 🌐 Running Services

| Component | Address | State |
|---------|---------|-------|
| Web Client | http://localhost:3000 | ✅ Active |
| REST API | http://localhost:5000/api | ✅ Active |
| API Health | http://localhost:5000/api/health | ✅ Active |
| Database | localhost:5432 | ✅ Active |

---

## 🔐 Sample Login Accounts

### Platform Administrator (Global access)
```
Email: super_admin@demo.com
Password: super_admin
```

### Organization Administrator (Demo tenant)
```
Email: admin@demo.com
Password: demo123
Tenant: demo
```

### Regular User
```
Email: user@demo.com
Password: demo123
Tenant: demo
```

---

## 📱 Available Screens

1. **Sign In** – http://localhost:3000  
   - Secure login workflow  
   - Demo credentials displayed  
   - Option to register a new tenant  

2. **Organization Signup** – http://localhost:3000/register  
   - Create a tenant  
   - Configure admin account  
   - Define organization details  

3. **Dashboard** – http://localhost:3000/dashboard  
   - Tenant overview  
   - Quick access links  
   - User profile snapshot  

4. **Users** – http://localhost:3000/users  
   - View organization members  
   - Invite new users  
   - Modify roles  
   - Remove accounts  

5. **Projects** – http://localhost:3000/projects  
   - Create and manage projects  
   - Update metadata  
   - Archive or delete projects  

6. **Tasks** – http://localhost:3000/tasks  
   - Add tasks to projects  
   - Assign priorities  
   - Update task status  
   - Delete tasks  

---

## 📚 API Usage Samples

### Authenticate
```bash
curl -X POST http://localhost:5000/api/auth/login   -H "Content-Type: application/json"   -d '{
    "email": "admin@demo.com",
    "password": "demo123",
    "tenantSubdomain": "demo"
  }'
```

Use the issued token for secured endpoints:
```
Authorization: Bearer <token>
```

### Get Logged-in User
```bash
curl -X GET http://localhost:5000/api/auth/me   -H "Authorization: Bearer <token>"
```

### List Users
```bash
curl -X GET http://localhost:5000/api/tenants/{tenantId}/users   -H "Authorization: Bearer <token>"
```

### Add Project
```bash
curl -X POST http://localhost:5000/api/tenants/{tenantId}/projects   -H "Authorization: Bearer <token>"   -H "Content-Type: application/json"   -d '{
    "name": "My Project",
    "description": "Project description",
    "status": "active"
  }'
```

---

## 🛠️ Useful Docker Commands

### Show Running Containers
```bash
docker-compose ps
```

### Stream Logs
```bash
docker logs backend -f
docker logs frontend -f
docker logs database -f
```

### Execute Tests
```bash
node integration-test.js
```

### Stop Services
```bash
docker-compose down
```

### Reset Environment
```bash
docker-compose down -v
docker-compose up -d
```

---

## 📖 Documentation Links

- **API Reference:** docs/API.md  
- **Installation Guide:** README.md  
- **Project Summary:** COMPLETION_SUMMARY.md  
- **Deliverables List:** DELIVERABLES.md  
- **Submission Metadata:** submission.json  

---

## 🔑 Supported API Endpoints (19 Total)

### Authentication (4)
- Tenant Registration  
- Login  
- Fetch Current User  
- Logout  

### Tenants (3)
- Retrieve All Tenants  
- Tenant Info  
- Modify Tenant  

### Users (4)
- Create User  
- Get Users  
- Update User  
- Remove User  

### Projects (4)
- Add Project  
- Get Projects  
- Update Project  
- Delete Project  

### Tasks (4)
- Add Task  
- Get Tasks  
- Update Task  
- Delete Task  

---

## ✨ Platform Features

- Fully functional REST API suite  
- Secure tenant isolation  
- JWT-based authentication (24h expiry)  
- Role-driven authorization  
- Input validation with Zod  
- Persistent audit logs  
- Six-page React UI  
- Docker-powered setup  
- Automatic database initialization  
- Complete technical documentation  

---

## 🐛 Troubleshooting

### Port Already in Use
Use Windows Task Manager or:
```bash
netstat -ano | findstr :3000
```

### Containers Not Starting
```bash
docker-compose up -d --build
```

### Database Connectivity Problems
```bash
docker-compose logs database
```

### Token Invalid or Expired
Log in again after 24 hours to obtain a new token.

---

## 📊 System Flow

```
React UI (3000)
      ↓
Express API (5000)
      ↓
PostgreSQL (5432)
```

---

## 📁 Repository Structure

```
frontend/
backend/
docs/
docker-compose.yml
README.md
submission.json
integration-test.js
```

---

## 🎯 Next Steps

1. Execute `docker-compose up -d`
2. Open http://localhost:3000
3. Sign in using demo accounts
4. Explore platform features
5. Refer to API docs for deeper understanding

---

## 📝 Additional Notes

- All persistent data resides in PostgreSQL  
- JWT tokens stored in browser localStorage  
- Passwords encrypted using bcrypt  
- All requests validated server-side  
- Audit logging enabled by default  
- Tenant-level data separation enforced  

---

🚀 **The system is fully operational and ready for evaluation!**
