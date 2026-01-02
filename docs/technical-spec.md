# Technical Platform Architecture – Version B

## Stack Composition
- **Server Side:** Node.js v18 with Express, TypeScript, Prisma ORM, Zod schema validation, JWT authentication, bcrypt-based password security.
- **Client Side:** React 18 application bundled using Vite, client routing via React Router, REST calls using fetch.
- **Persistence Layer:** PostgreSQL 15 database.
- **Infrastructure:** Docker containers managed through Docker Compose.

## Codebase Structure
- **backend/**
  - `src/index.ts` – Server bootstrap logic
  - `src/controllers/` – Modules for authentication, tenant handling, users, projects, and tasks
  - `src/middleware/auth.ts` – Authorization and token verification
  - `src/routes/` – REST endpoint mappings
  - `src/utils/` – JWT and audit utilities
  - `src/prisma.ts` – Database client
  - `prisma/schema.prisma` – Data model
  - `prisma/seed.js` – Initial dataset
- **frontend/**
  - `src/main.jsx`, `src/App.jsx` – App initialization and routing
  - `src/context/AuthContext.jsx` – User session management
  - `src/components/ProtectedRoute.jsx` – Access-protected routes
  - `src/services/api.js` – Backend API wrapper
  - `src/pages/` – Application views
- **docs/** – All supporting documentation
- `docker-compose.yml` – Service definitions
- `integration-test.js` – Integration validation script

## Configuration Parameters

### Backend Variables
- Database connection string
- JWT secret and expiry
- API server port
- Frontend origin URL

### Frontend Variables
- API base URL

## Local Execution Flow
1. Configure and run PostgreSQL.
2. Initialize backend with dependencies, migrations, and seed data.
3. Launch frontend development server.

## Docker Workflow
1. Start full stack using Docker Compose.
2. Validate service health and UI access.
3. Tear down services when finished.

## Quality Validation
- Run integration tests to validate APIs.
- Execute unit tests for backend modules.

## API Implementation Details
- Centralized authentication routes.
- Role-based permission checks.
- Tenant-aware data access.
- Unified success and error responses.

## Production Readiness
- Secure secret management.
- TLS-enabled deployments.
- Controlled CORS policies.
- Automated database migration execution.
- Optimized frontend production builds.
