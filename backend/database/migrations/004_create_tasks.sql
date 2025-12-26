CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20)
      CHECK (status IN ('todo', 'in_progress', 'completed'))
      DEFAULT 'todo',
    priority VARCHAR(20)
      CHECK (priority IN ('low', 'medium', 'high'))
      DEFAULT 'medium',
    assigned_to UUID,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_task_project
      FOREIGN KEY (project_id)
      REFERENCES projects(id)
      ON DELETE CASCADE,

    CONSTRAINT fk_task_tenant
      FOREIGN KEY (tenant_id)
      REFERENCES tenants(id)
      ON DELETE CASCADE,

    CONSTRAINT fk_task_assignee
      FOREIGN KEY (assigned_to)
      REFERENCES users(id)
      ON DELETE SET NULL
);
