# Multi-Tenant SaaS REST API Documentation (Version B)

## Overview
This document outlines a scalable REST API built for a multi-organization SaaS application. Each tenant operates independently while sharing the same infrastructure, with strict safeguards to prevent cross-tenant data access.

Access control is implemented using role-based permissions, and resource usage is governed by subscription tiers. These mechanisms ensure both security and fair resource allocation across tenants.

**API Root:** `http://localhost:5000/api`

---

## Authentication Services

### Organization Onboarding
Registers a new tenant and provisions an administrative account.

**POST** `/api/auth/register-tenant`

This process establishes the organization, assigns a subdomain, and enables administrative control.

---

### Login Service
Authenticates a user and returns a signed JWT.

**POST** `/api/auth/login`

The token must be supplied in subsequent requests for authorization.

---

### User Profile
Returns information about the currently authenticated user.

**GET** `/api/auth/me`

---

### Sign Out
Handles client-side logout functionality.

**POST** `/api/auth/logout`

---

## Tenant APIs

### Retrieve Tenants
Provides a paginated list of all tenants in the system.

**GET** `/api/tenants`

Restricted to super administrators.

---

### Tenant Details
Displays subscription and configuration data for a tenant.

**GET** `/api/tenants/:tenantId`

---

### Modify Tenant
Allows administrators to update tenant-level settings.

**PUT** `/api/tenants/:tenantId`

---

## User APIs

### Add User
Creates a new tenant user with assigned permissions.

**POST** `/api/tenants/:tenantId/users`

---

### View Users
Lists all users registered under a tenant.

**GET** `/api/tenants/:tenantId/users`

---

### Edit User
Changes user details or access level.

**PUT** `/api/users/:userId`

---

### Remove User
Deletes a user account from the tenant.

**DELETE** `/api/users/:userId`

---

## Project Services

### New Project
Creates a project within a tenant workspace.

**POST** `/api/tenants/:tenantId/projects`

---

### Project Listing
Fetches all tenant projects.

**GET** `/api/tenants/:tenantId/projects`

---

### Project Update
Edits project metadata or lifecycle state.

**PUT** `/api/projects/:projectId`

---

### Project Removal
Deletes a project and associated records.

**DELETE** `/api/projects/:projectId`

---

## Task Services

### Add Task
Adds a task to a project.

**POST** `/api/projects/:projectId/tasks`

---

### Task Listing
Retrieves tasks under a project.

**GET** `/api/projects/:projectId/tasks`

---

### Task Modification
Updates task details.

**PUT** `/api/tasks/:taskId`

---

### Task Deletion
Deletes a task.

**DELETE** `/api/tasks/:taskId`

---

## Error Responses
All errors are returned in a standardized format using appropriate HTTP status codes for clarity and consistency.

---

## Audit & Security
Every create, update, or delete action is recorded for audit purposes. JWT-based authentication and RBAC protect all secured endpoints.

---

## Plans & Limits
Subscription plans control feature access, project limits, and user capacity across tenants.
