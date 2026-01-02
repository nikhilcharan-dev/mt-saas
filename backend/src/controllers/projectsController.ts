import { z } from 'zod';
import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';
import { logAudit } from '../utils/audit';

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.string().optional()
});

export async function createProject(req: AuthRequest, res: Response) {
  const tenantId = req.params.tenantId;
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid input', data: parsed.error.flatten() });
  const { name, description } = parsed.data;

  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (req.user.role === 'user') return res.status(403).json({ success: false, message: 'Only tenant_admin can create projects' });
    if (req.user.role !== 'super_admin' && req.user.tenantId !== tenantId) return res.status(403).json({ success: false, message: 'Forbidden' });

    // Check tenant limits
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    const projectCount = await prisma.project.count({ where: { tenantId } });
    if (projectCount >= tenant.maxProjects) return res.status(403).json({ success: false, message: 'Subscription project limit reached' });

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        tenantId,
        createdBy: req.user.id,
        status: 'active'
      }
    });

    await logAudit({ tenantId, userId: req.user.id, action: 'CREATE_PROJECT', entityType: 'project', entityId: project.id, ipAddress: req.ip });

    return res.status(201).json({ success: true, message: 'Project created successfully', data: { id: project.id, name: project.name, status: project.status, createdAt: project.createdAt } });
  } catch (err) {
    console.error('createProject error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function listProjects(req: AuthRequest, res: Response) {
  const tenantId = req.params.tenantId;
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (req.user.role !== 'super_admin' && req.user.tenantId !== tenantId) return res.status(403).json({ success: false, message: 'Forbidden' });

    const page = Math.max(1, parseInt((req.query.page as string) || '1'));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '10')));
    const status = (req.query.status as string) || undefined;

    const where: any = { tenantId };
    if (status) where.status = status;

    const total = await prisma.project.count({ where });
    const projects = await prisma.project.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } });

    return res.json({ success: true, data: { projects, total, pagination: { currentPage: page, totalPages: Math.ceil(total / limit), limit } } });
  } catch (err) {
    console.error('listProjects error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function updateProject(req: AuthRequest, res: Response) {
  const projectId = req.params.projectId;
  const parsed = updateProjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid input', data: parsed.error.flatten() });
  const { name, description, status } = parsed.data;

  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (req.user.role !== 'super_admin' && req.user.tenantId !== project.tenantId) return res.status(403).json({ success: false, message: 'Forbidden' });

    const data: any = {};
    if (name) data.name = name;
    if (description !== undefined) data.description = description || null;
    if (status) data.status = status;

    const updated = await prisma.project.update({ where: { id: projectId }, data });
    await logAudit({ tenantId: project.tenantId, userId: req.user.id, action: 'UPDATE_PROJECT', entityType: 'project', entityId: projectId, ipAddress: req.ip });

    return res.json({ success: true, message: 'Project updated successfully', data: { id: updated.id, name: updated.name, status: updated.status, updatedAt: updated.updatedAt } });
  } catch (err) {
    console.error('updateProject error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function deleteProject(req: AuthRequest, res: Response) {
  const projectId = req.params.projectId;

  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (req.user.role === 'user') return res.status(403).json({ success: false, message: 'Only tenant_admin can delete projects' });

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (req.user.role !== 'super_admin' && req.user.tenantId !== project.tenantId) return res.status(403).json({ success: false, message: 'Forbidden' });

    await prisma.project.delete({ where: { id: projectId } });
    await logAudit({ tenantId: project.tenantId, userId: req.user.id, action: 'DELETE_PROJECT', entityType: 'project', entityId: projectId, ipAddress: req.ip });

    return res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    console.error('deleteProject error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}