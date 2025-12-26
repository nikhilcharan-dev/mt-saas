export const requireTenant = (req, res, next) => {
  if (!req.user || !req.user.tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Tenant access required',
    });
  }

  next();
};
