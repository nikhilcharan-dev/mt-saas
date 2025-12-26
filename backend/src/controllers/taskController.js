import pool from '../config/db.js';

/* ============================
   GET TASKS FOR PROJECT
============================ */
export const getProjectTasks = async (req, res) => {
  const { projectId } = req.params;
  const { tenantId } = req.user;

  try {
    const result = await pool.query(
      `
      SELECT t.id, t.title, t.status, t.priority, t.created_at
      FROM tasks t
      JOIN projects p ON p.id = t.project_id
      WHERE t.project_id = $1
        AND t.tenant_id = $2
      ORDER BY t.created_at DESC
      `,
      [projectId, tenantId]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
    });
  }
};

/* ============================
   CREATE TASK
============================ */
export const createTask = async (req, res) => {
  const { projectId } = req.params;
  const { title, priority } = req.body;
  const { tenantId } = req.user;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: 'Task title is required',
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO tasks (
        id, project_id, tenant_id, title, priority
      )
      VALUES (
        uuid_generate_v4(), $1, $2, $3, $4
      )
      RETURNING id, title
      `,
      [projectId, tenantId, title, priority || 'medium']
    );

    return res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create task',
    });
  }
};

/* ============================
   UPDATE TASK
============================ */
export const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, status, priority } = req.body;
  const { tenantId } = req.user;

  try {
    const result = await pool.query(
      `
      UPDATE tasks
      SET title = COALESCE($1, title),
          status = COALESCE($2, status),
          priority = COALESCE($3, priority)
      WHERE id = $4
        AND tenant_id = $5
      RETURNING id
      `,
      [title, status, priority, taskId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task updated',
    });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update task',
    });
  }
};

/* ============================
   DELETE TASK (ADMIN ONLY)
============================ */
export const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  const { tenantId } = req.user;

  try {
    const result = await pool.query(
      `
      DELETE FROM tasks
      WHERE id = $1
        AND tenant_id = $2
      `,
      [taskId, tenantId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete task',
    });
  }
};
