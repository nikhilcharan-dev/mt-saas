import pool from '../config/db.js';

/* ============================
   GET PROJECTS (Tenant Scoped)
============================ */
export const getProjects = async (req, res) => {
  try {
    const { tenantId } = req.user;

    const result = await pool.query(
      `
      SELECT id, name, description, created_at
      FROM projects
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      `,
      [tenantId]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get projects error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
    });
  }
};

/* ============================
   CREATE PROJECT (Admin Only)
============================ */
export const createProject = async (req, res) => {
  const { name, description } = req.body;
  const { tenantId, userId } = req.user;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Project name is required',
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO projects (
        id, tenant_id, name, description, created_by
      )
      VALUES (
        uuid_generate_v4(), $1, $2, $3, $4
      )
      RETURNING id, name
      `,
      [tenantId, name, description || null, userId]
    );

    return res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create project',
    });
  }
};

/* ============================
   UPDATE PROJECT (Admin Only)
============================ */
export const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const { tenantId } = req.user;

  try {
    const result = await pool.query(
      `
      UPDATE projects
      SET name = $1,
          description = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND tenant_id = $4
      RETURNING id
      `,
      [name, description, id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Project updated',
    });
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update project',
    });
  }
};

/* ============================
   DELETE PROJECT (Admin Only)
============================ */
export const deleteProject = async (req, res) => {
  const { id } = req.params;
  const { tenantId } = req.user;

  try {
    const result = await pool.query(
      `
      DELETE FROM projects
      WHERE id = $1 AND tenant_id = $2
      `,
      [id, tenantId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Project deleted',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete project',
    });
  }
};
