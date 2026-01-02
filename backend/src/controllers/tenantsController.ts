import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';
import { logAudit } from '../utils/audit';
import { z } from 'zod';

const updateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.string().optional(),
  subscriptionPlan: z.string().optional(),
  maxUsers: z.number().int().positive().optional(),
  maxProjects: z.number().int().positive().optional()
});

const listQuerySchema = z.object({
  page: z.preprocess((v) => parseInt(String(v || '1')), z.number().int().positive()).optional(),
  limit: z.preprocess((v) => Math.min(100, Math.max(1, parseInt(String(v || '10')))), z.number().int().positive()).optional(),
  status: z.string().optional(),
  subscriptionPlan: z.string().optional()
});

export async function getTenantDetails(req: AuthRequest, res: Response) {
  const tenantId = req.params.tenantId;
  try {
    // Authorization: user must belong to tenant OR be super_admin
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (req.user.role !== 'super_admin' && req.user.tenantId !== tenantId) return res.status(403).json({ success: false, message: 'Forbidden' });

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    const [totalUsers, totalProjects, totalTasks] = await Promise.all([
      prisma.user.count({ where: { tenantId } }),
      prisma.project.count({ where: { tenantId } }),
      prisma.task.count({ where: { tenantId } })
    ]);

    return res.json({ success: true, data: {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      status: tenant.status,
      subscriptionPlan: tenant.subscriptionPlan,
      maxUsers: tenant.maxUsers,
      maxProjects: tenant.maxProjects,
      createdAt: tenant.createdAt,
      stats: {
        totalUsers,
        totalProjects,
        totalTasks
      }
    }});
  } catch (err) {
    console.error('getTenantDetails error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function updateTenant(req: AuthRequest, res: Response) {
  const tenantId = req.params.tenantId;
  const parsed = updateTenantSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid input', data: parsed.error.flatten() });
  const { name, status, subscriptionPlan, maxUsers, maxProjects } = parsed.data;

  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    // tenant_admin can only update name; super_admin can update all fields
    if (req.user.role === 'tenant_admin' && req.user.tenantId !== tenantId) return res.status(403).json({ success: false, message: 'Forbidden' });
    if (req.user.role === 'tenant_admin' && (status || subscriptionPlan || maxUsers || maxProjects)) {
      return res.status(403).json({ success: false, message: 'tenant_admin cannot update restricted fields' });
    }
    if (req.user.role === 'user') return res.status(403).json({ success: false, message: 'Forbidden' });

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    const updated = await prisma.tenant.update({ where: { id: tenantId }, data: {
      name: name ?? tenant.name,
      status: status ?? tenant.status,
      subscriptionPlan: subscriptionPlan ?? tenant.subscriptionPlan,
      maxUsers: typeof maxUsers !== 'undefined' ? maxUsers : tenant.maxUsers,
      maxProjects: typeof maxProjects !== 'undefined' ? maxProjects : tenant.maxProjects
    }});

    await logAudit({ tenantId: tenantId, userId: req.user.id, action: 'UPDATE_TENANT', entityType: 'tenant', entityId: tenantId, ipAddress: req.ip });

    return res.json({ success: true, message: 'Tenant updated successfully', data: { id: updated.id, name: updated.name, updatedAt: updated.updatedAt } });
  } catch (err) {
    console.error('updateTenant error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

import { Prisma } from '@prisma/client';

export async function listTenants(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (req.user.role !== 'super_admin') return res.status(403).json({ success: false, message: 'Not authorized' });

    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid query', data: parsed.error.flatten() });
    const page = parsed.data.page ?? 1;
    const limit = parsed.data.limit ?? 10;
    const status = parsed.data.status;
    const subscriptionPlan = parsed.data.subscriptionPlan;

    const where: any = {};
    if (status) where.status = status as any;
    if (subscriptionPlan) where.subscriptionPlan = subscriptionPlan as any;

    const totalTenants = await prisma.tenant.count({ where });
    const tenants = await prisma.tenant.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } });

    // enrich counts
    const enriched = await Promise.all(tenants.map(async (t: any) => {
      const [totalUsers, totalProjects] = await Promise.all([
        prisma.user.count({ where: { tenantId: t.id } }),
        prisma.project.count({ where: { tenantId: t.id } })
      ]);
      return { id: t.id, name: t.name, subdomain: t.subdomain, status: t.status, subscriptionPlan: t.subscriptionPlan, totalUsers, totalProjects, createdAt: t.createdAt };
    }));

    return res.json({ success: true, data: { tenants: enriched, pagination: { currentPage: page, totalPages: Math.ceil(totalTenants / limit), totalTenants, limit } } });
  } catch (err: unknown) {
    console.error('listTenants error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}