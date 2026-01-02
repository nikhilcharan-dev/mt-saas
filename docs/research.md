# Technical Research Report – Version B

## Summary

This report analyzes the system architecture, selected technologies, and security mechanisms used in constructing a multi-tenant SaaS platform for task and project coordination. The application supports multiple organizations within a single deployment while ensuring strict separation of tenant data, role-based authorization, and subscription-enforced limits. The discussion emphasizes tenancy models, stack selection decisions, and layered security controls.

---

## Evaluation of Multi-Tenant Designs

### Multi-Tenancy Explained

Multi-tenancy allows one software system to serve multiple independent customers by logically isolating their data. Architectural choices in this area directly affect system scalability, operational complexity, and cost efficiency. Three commonly adopted strategies were reviewed.

---

### Strategy 1: One Database per Tenant

**Description:**  
Each tenant is assigned an exclusive database instance.

**Pros:**
- Maximum isolation
- Independent data recovery
- Easier compliance management
- Predictable tenant performance

**Cons:**
- High operational overhead
- Increased infrastructure cost
- Complex maintenance workflows
- Limited cross-tenant insights

**Conclusion:**  
Best suited for regulated enterprise environments, but inefficient for high-volume SaaS offerings.

---

### Strategy 2: Schema-Level Isolation

**Description:**  
Tenants share a database but operate within separate schemas.

**Pros:**
- Logical data separation
- Reduced infrastructure cost
- Easier recovery than shared tables

**Cons:**
- Complex migrations at scale
- Performance concerns with many schemas
- Additional runtime overhead

**Conclusion:**  
A practical middle-ground solution for platforms with a manageable tenant count.

---

### Strategy 3: Shared Tables with Tenant Key (Adopted)

**Description:**  
All tenants share tables, with each record associated with a tenant identifier.

**Benefits:**
- Operational simplicity
- Cost efficiency
- Simplified schema management
- Excellent scalability

**Challenges:**
- Strong enforcement required to prevent leakage
- Limited per-tenant schema flexibility

**Safeguards:**
- ORM-level tenant enforcement
- Indexed tenant identifiers
- Automated security testing
- Comprehensive audit trails

**Conclusion:**  
This model offers the best balance for scalable SaaS platforms serving small and medium businesses.

---

## Technology Decisions

### Backend Services
- Node.js and Express for API development
- TypeScript for enhanced reliability and maintainability

### Database System
- PostgreSQL 15 for transactional safety and performance

### ORM Tooling
- Prisma for type-safe database access and migrations

### Frontend Stack
- React 18 with Vite for fast, modular UI development

### Authentication
- JWT-based stateless authentication
- Optimized for distributed deployments

---

## Security Framework

- Secure password storage using bcrypt
- Token-based authentication with JWT
- Role-based authorization model
- Tenant-aware access restrictions
- Input validation to prevent injection attacks
- Centralized audit logging

---

## Scalability and Deployment

- Stateless services enable horizontal scaling
- Database indexing ensures performance
- Pagination applied to list endpoints
- Docker-based deployments for consistency

---

## Closing Statement

By adopting a shared-schema tenancy model supported by a modern technology stack and layered security controls, the platform achieves scalability, strong isolation, and operational efficiency. The architecture is well-positioned to evolve as business and technical requirements grow.
