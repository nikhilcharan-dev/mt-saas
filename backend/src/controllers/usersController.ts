import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import { logAudit } from '../utils/audit';

import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  role: z.enum(['user', 'tenant_admin']).optional()
});

export async function addUser(req: AuthRequest, res: Response) {
  const tenantId = req.params.tenantId;

  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid input', data: parsed.error.flatten() });
  const { email, password, fullName, role = 'user' } = parsed.data;

  try {
    // Only tenant_admin can create users for their tenant
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (req.user.role !== 'tenant_admin') return res.status(403).json({ success: false, message: 'Only tenant_admin can add users' });
    if (req.user.tenantId !== tenantId) return res.status(403).json({ success: false, message: 'Forbidden' });

    // Check tenant exists and limits
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    const currentCount = await prisma.user.count({ where: { tenantId } });
    if (currentCount >= tenant.maxUsers) return res.status(403).json({ success: false, message: 'Subscription user limit reached' });

    // Unique email per tenant
    const existing = await prisma.user.findFirst({ where: { email, tenantId } });
    if (existing) return res.status(409).json({ success: false, message: 'Email already exists in this tenant' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash, fullName, role, tenantId } });

    await logAudit({ tenantId, userId: req.user.id, action: 'CREATE_USER', entityType: 'user', entityId: user.id, ipAddress: req.ip });

    const { passwordHash: _ph, ...safeUser } = user as any;
    return res.status(201).json({ success: true, message: 'User created successfully', data: { ...safeUser, isActive: user.isActive, createdAt: user.createdAt } });
  } catch (err) {
    console.error('addUser error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function listTenantUsers(req: AuthRequest, res: Response) {
  const tenantId = req.params.tenantId;
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (req.user.role !== 'super_admin' && req.user.tenantId !== tenantId) return res.status(403).json({ success: false, message: 'Forbidden' });

    const querySchema = z.object({ search: z.string().optional(), role: z.string().optional(), page: z.preprocess((v) => parseInt(String(v || '1')), z.number().int().positive()), limit: z.preprocess((v) => Math.min(100, Math.max(1, parseInt(String(v || '50')))), z.number().int().positive()) });
    const parsedQ = querySchema.safeParse(req.query);
    if (!parsedQ.success) return res.status(400).json({ success: false, message: 'Invalid query', data: parsedQ.error.flatten() });
    const { search, role, page, limit } = parsedQ.data;

    const where: any = { tenantId };
    if (search) where.OR = [{ fullName: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }];
    if (role) where.role = role;
    const total = await prisma.user.count({ where });
    const users = await prisma.user.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } });

    const safe = users.map((u: any) => ({ id: u.id, email: u.email, fullName: u.fullName, role: u.role, isActive: u.isActive, createdAt: u.createdAt }));

    return res.json({ success: true, data: { users: safe, total, pagination: { currentPage: page, totalPages: Math.ceil(total / limit), limit } } });
  } catch (err) {
    console.error('listTenantUsers error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

const updateUserSchema = z.object({
  fullName: z.string().min(1).optional(),
  role: z.enum(['user', 'tenant_admin']).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional()
});

export async function updateUser(req: AuthRequest, res: Response) {
  const userId = req.params.userId;
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid input', data: parsed.error.flatten() });
  const { fullName, role, isActive, password } = parsed.data;

  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    // Verify same tenant
    if (req.user.role !== 'super_admin' && req.user.tenantId !== target.tenantId) return res.status(403).json({ success: false, message: 'Forbidden' });

    // Users can update own fullName; only tenant_admin can update role or isActive
    if (req.user.role !== 'tenant_admin' && req.user.id !== target.id) {
      // Not admin and not self
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const data: any = {};
    if (fullName && (req.user.id === target.id || req.user.role === 'tenant_admin')) data.fullName = fullName;
    if (typeof role !== 'undefined') {
      if (req.user.role !== 'tenant_admin') return res.status(403).json({ success: false, message: 'Only tenant_admin can update role' });
      data.role = role;
    }
    if (typeof isActive !== 'undefined') {
      if (req.user.role !== 'tenant_admin') return res.status(403).json({ success: false, message: 'Only tenant_admin can update isActive' });
      data.isActive = isActive;
    }
    if (password) {
      if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 chars' });
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({ where: { id: userId }, data });
    await logAudit({ tenantId: updated.tenantId, userId: req.user.id, action: 'UPDATE_USER', entityType: 'user', entityId: updated.id, ipAddress: req.ip });

    const { passwordHash, ...safe } = updated as any;
    return res.json({ success: true, message: 'User updated successfully', data: safe });
  } catch (err) {
    console.error('updateUser error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function deleteUser(req: AuthRequest, res: Response) {
  const userId = req.params.userId;

  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (req.user.role !== 'tenant_admin') return res.status(403).json({ success: false, message: 'Only tenant_admin can delete users' });

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    if (req.user.id === userId) return res.status(403).json({ success: false, message: 'Cannot delete yourself' });
    if (req.user.tenantId !== target.tenantId) return res.status(403).json({ success: false, message: 'Forbidden' });

    // Unassign tasks
    await prisma.task.updateMany({ where: { assignedTo: userId }, data: { assignedTo: null } });

    await prisma.user.delete({ where: { id: userId } });
    await logAudit({ tenantId: target.tenantId, userId: req.user.id, action: 'DELETE_USER', entityType: 'user', entityId: userId, ipAddress: req.ip });

    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('deleteUser error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}