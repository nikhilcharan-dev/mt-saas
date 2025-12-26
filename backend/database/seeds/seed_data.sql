-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- SUPER ADMIN
-- =========================
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
SELECT
  uuid_generate_v4(),
  NULL,
  'superadmin@system.com',
  '$2b$10$L06RY44GIZnE3U0Ox5yxFOF2i/WDfGmn0l24Xp1/u/bFdsRsPf.Fi',
  'System Admin',
  'super_admin'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'superadmin@system.com'
);


INSERT INTO tenants (
  id, name, subdomain, status, subscription_plan, max_users, max_projects
)
SELECT
  uuid_generate_v4(),
  'Demo Company',
  'demo',
  'active',
  'pro',
  25,
  15
WHERE NOT EXISTS (
  SELECT 1 FROM tenants WHERE subdomain = 'demo'
);

-- =========================
-- TENANT ADMIN
-- =========================
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
SELECT
  uuid_generate_v4(),
  t.id,
  'admin@demo.com',
  '$2b$10$ZvFDjt6U6t1IF5G9tV.OK.FBVXPSw.Jpy2ngOlyiBbbTta61u4kZa',
  'Demo Admin',
  'tenant_admin'
FROM tenants t
WHERE t.subdomain = 'demo'
AND NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@demo.com'
);

-- =========================
-- REGULAR USERS
-- =========================

INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
SELECT
  uuid_generate_v4(),
  t.id,
  'user1@demo.com',
  '$2b$10$3xomqoCyUdzFV6llqs68..elCDZbZLW3MMqD4eZPRMKW06eykuiHK',
  'Demo User One',
  'user'
FROM tenants t
WHERE t.subdomain = 'demo'
AND NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'user1@demo.com'
);

INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
SELECT
  uuid_generate_v4(),
  t.id,
  'user2@demo.com',
  '$2b$10$3xomqoCyUdzFV6llqs68..elCDZbZLW3MMqD4eZPRMKW06eykuiHK',
  'Demo User Two',
  'user'
FROM tenants t
WHERE t.subdomain = 'demo'
AND NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'user2@demo.com'
);

-- -- =========================
-- -- REGULAR USERS
-- -- =========================
-- INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
-- SELECT uuid_generate_v4(), t.id, 'user1@demo.com', '$2b$10$eImiTXuWVxfM37uY4JANjQ==', 'Demo User One', 'user'
-- FROM tenants t WHERE t.subdomain = 'demo';

-- INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
-- SELECT uuid_generate_v4(), t.id, 'user2@demo.com', '$2b$10$eImiTXuWVxfM37uY4JANjQ==', 'Demo User Two', 'user'
-- FROM tenants t WHERE t.subdomain = 'demo';

-- =========================
-- PROJECTS
-- =========================
INSERT INTO projects (id, tenant_id, name, description, created_by)
SELECT
  uuid_generate_v4(),
  t.id,
  'Project Alpha',
  'First demo project',
  u.id
FROM tenants t
JOIN users u ON u.role = 'tenant_admin'
WHERE t.subdomain = 'demo'
AND NOT EXISTS (
  SELECT 1 FROM projects WHERE name = 'Project Alpha'
);

INSERT INTO projects (id, tenant_id, name, description, created_by)
SELECT
  uuid_generate_v4(),
  t.id,
  'Project Beta',
  'Second demo project',
  u.id
FROM tenants t
JOIN users u ON u.role = 'tenant_admin'
WHERE t.subdomain = 'demo'
AND NOT EXISTS (
  SELECT 1 FROM projects WHERE name = 'Project Beta'
);


-- =========================
-- TASKS (5 TOTAL)
-- =========================
INSERT INTO tasks (id, project_id, tenant_id, title, status, priority)
SELECT
  uuid_generate_v4(),
  p.id,
  p.tenant_id,
  'Initial Planning',
  'todo',
  'high'
FROM projects p
WHERE NOT EXISTS (
  SELECT 1 FROM tasks WHERE title = 'Initial Planning'
);
