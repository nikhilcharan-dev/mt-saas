import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import { generateToken } from '../utils/jwt.js';

export const login = async (req, res) => {
  const { email, password, tenantSubdomain } = req.body;

  // 1. Basic validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  try {
    /* =====================================================
       2. SUPER ADMIN LOGIN (tenant_id IS NULL)
       ===================================================== */
    const superAdminResult = await pool.query(
      `
      SELECT id, email, full_name, role, password_hash, is_active
      FROM users
      WHERE email = $1
        AND tenant_id IS NULL
        AND role = 'super_admin'
      `,
      [email]
    );

    if (superAdminResult.rows.length > 0) {
      const superAdmin = superAdminResult.rows[0];

      if (!superAdmin.is_active) {
        return res.status(403).json({
          success: false,
          message: 'User account is inactive',
        });
      }

      const isMatch = await bcrypt.compare(password, superAdmin.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      const token = generateToken({
        userId: superAdmin.id,
        tenantId: null,
        role: superAdmin.role,
      });

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: superAdmin.id,
            email: superAdmin.email,
            fullName: superAdmin.full_name,
            role: superAdmin.role,
            tenantId: null,
          },
          token,
          expiresIn: 86400,
        },
      });
    }

    /* =====================================================
       3. TENANT USER LOGIN (tenantSubdomain REQUIRED)
       ===================================================== */
    if (!tenantSubdomain) {
      return res.status(400).json({
        success: false,
        message: 'tenantSubdomain is required',
      });
    }

    // Find tenant
    const tenantResult = await pool.query(
      'SELECT * FROM tenants WHERE subdomain = $1',
      [tenantSubdomain]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }

    const tenant = tenantResult.rows[0];

    if (tenant.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Tenant is not active',
      });
    }

    // Find user in tenant
    const userResult = await pool.query(
      `
      SELECT id, email, full_name, role, tenant_id, password_hash, is_active
      FROM users
      WHERE email = $1 AND tenant_id = $2
      `,
      [email, tenant.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken({
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: user.tenant_id,
        },
        token,
        expiresIn: 86400,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
