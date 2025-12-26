// SUPER ADMIN ONLY
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required',
    });
  }
  next();
};

// TENANT ADMIN ONLY
export const requireTenantAdmin = (req, res, next) => {
  if (
    !req.user ||
    !req.user.tenantId ||
    req.user.role !== 'tenant_admin'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Tenant admin access required',
    });
  }
  next();
};

// ANY TENANT USER (admin + user)
export const requireTenantUser = (req, res, next) => {
  if (!req.user || !req.user.tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Tenant access required',
    });
  }
  next();
};
