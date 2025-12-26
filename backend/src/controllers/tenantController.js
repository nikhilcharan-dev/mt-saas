import pool from '../config/db.js';
import bcrypt from 'bcrypt';

export const registerTenant = async (req, res) => {
  const {
    companyName,
    subdomain,
    adminEmail,
    adminPassword,
    adminFullName,
    plan,
  } = req.body;

  // 1. Basic validation
  if (
    !companyName ||
    !subdomain ||
    !adminEmail ||
    !adminPassword ||
    !adminFullName ||
    !plan
  ) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
    });
  }

  const client = await pool.connect();

  try {
    // 2. Start transaction
    await client.query('BEGIN');

    // 3. Check subdomain uniqueness
    const subdomainCheck = await client.query(
      'SELECT id FROM tenants WHERE subdomain = $1',
      [subdomain]
    );

    if (subdomainCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Subdomain already exists',
      });
    }

    // 4. Plan limits
    const planLimits = {
      free: { maxUsers: 5, maxProjects: 3 },
      pro: { maxUsers: 25, maxProjects: 15 },
      enterprise: { maxUsers: 100, maxProjects: 100 },
    };

    const limits = planLimits[plan];
    if (!limits) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription plan',
      });
    }

    // 5. Create tenant
    const tenantResult = await client.query(
      `
      INSERT INTO tenants (
        id, name, subdomain, status,
        subscription_plan, max_users, max_projects
      )
      VALUES (
        uuid_generate_v4(), $1, $2, 'active',
        $3, $4, $5
      )
      RETURNING id
      `,
      [
        companyName,
        subdomain,
        plan,
        limits.maxUsers,
        limits.maxProjects,
      ]
    );

    const tenantId = tenantResult.rows[0].id;

    // 6. Hash admin password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // 7. Create tenant admin
    const adminResult = await client.query(
      `
      INSERT INTO users (
        id, tenant_id, email,
        password_hash, full_name, role
      )
      VALUES (
        uuid_generate_v4(), $1, $2, $3, $4, 'tenant_admin'
      )
      RETURNING id
      `,
      [tenantId, adminEmail, passwordHash, adminFullName]
    );

    const adminUserId = adminResult.rows[0].id;

    // 8. Audit log
    await client.query(
  `
  INSERT INTO audit_logs (
    tenant_id,
    user_id,
    action,
    entity,
    entity_id
  )
  VALUES ($1, $2, $3, $4, $5)
  `,
  [
    tenantId,
    req.user.userId,
    'TENANT_CREATED',
    'tenant',
    tenantId,
  ]
);

    // 9. Commit transaction
    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      data: {
        tenantId,
        adminUserId,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Tenant registration error:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    client.release();
  }
};
