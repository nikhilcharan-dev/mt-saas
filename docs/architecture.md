# System Architecture Guide – Version B

## Platform Architecture

### Overall Architecture Diagram

```mermaid
graph TB
    subgraph Users
        Web[Web Client]
    end

    subgraph UI["UI Layer (3000)"]
        App[React SPA<br/>Vite Build]
    end

    subgraph Services["Service Layer (5000)"]
        Server[Express API]
        JWTM[JWT Auth Guard]
        RBACM[Permission Guard]
        TENM[Tenant Boundary Guard]
    end

    subgraph Storage["Persistence Layer (5432)"]
        PG[(PostgreSQL Database)]
    end

    Web --> App
    App --> Server
    Server --> JWTM
    JWTM --> RBACM
    RBACM --> TENM
    TENM --> PG
```

### Layer Responsibilities

**User Access**
- Browsers communicate with the system using HTTP(S)

**UI Layer**
- React-based frontend
- Route-level security enforcement
- Responsive design implementation

**Service Layer**
- Node.js Express backend
- Authentication handled via JWT
- Authorization enforced through RBAC
- Tenant-based data filtering
- Uniform error responses

**Persistence Layer**
- PostgreSQL 15 database
- Tenant-aware relational schema
- Prisma ORM usage
- Schema migrations and seed data

## Login & Token Flow

```mermaid
sequenceDiagram
    participant Client
    participant UI
    participant API
    participant Token
    participant DB

    Client->>UI: Enter login details
    UI->>API: Authenticate
    API->>DB: Check tenant
    DB-->>API: Tenant OK
    API->>DB: Check user
    DB-->>API: User OK
    API->>Token: Create JWT
    Token-->>API: Signed token
    API-->>UI: Auth payload
    UI-->>Client: Access granted
```

## Data Model

### Entity Mapping

```mermaid
erDiagram
    TENANTS ||--o{ USERS : includes
    TENANTS ||--o{ PROJECTS : owns
    PROJECTS ||--o{ TASKS : groups
    USERS ||--o{ AUDIT_LOGS : generates
```

### Table Descriptions

**Tenants**
- Organization metadata
- Subscription details and limits

**Users**
- Authentication identities
- Tenant-scoped roles

**Projects**
- Tenant-level initiatives

**Tasks**
- Actionable work units

**Audit Logs**
- Operational and security records

## Tenant Data Protection

```mermaid
graph TB
    Guard[Tenant Enforcement Layer]
    T1[Tenant One]
    T2[Tenant Two]

    Guard --> T1
    Guard --> T2
```

- Tenant context derived from JWT
- Queries restricted by tenant_id
- Elevated access for super admins
- Database constraints ensure integrity

## API Organization

### Functional Areas
- Authentication
- Tenant administration
- User control
- Project handling
- Task execution
- System health

## Security & Authorization

- JWT-based authentication
- Role validation at middleware
- Tenant scoping before DB access
- Clear separation of responsibilities

## Response Convention

Successful:
```json
{ "success": true, "message": "OK" }
```

Error:
```json
{ "success": false, "message": "Failure reason" }
```
