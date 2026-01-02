import { z } from 'zod';
import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';
import { logAudit } from '../utils/audit';

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.string().optional(),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional()
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional()
});

export async function createTask(req: AuthRequest, res: Response) {
  const { projectId } = req.params;
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid input', data: parsed.error.flatten() });
  const { title, description, priority, dueDate, assignedTo } = parsed.data;

  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (req.user.role !== 'super_admin' && req.user.tenantId !== project.tenantId) return res.status(403).json({ success: false, message: 'Forbidden' });

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority: (priority || 'medium') as any,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo: assignedTo || null,
        projectId,
        tenantId: project.tenantId,
        status: 'todo'
      }
    });

    await logAudit({ tenantId: project.tenantId, userId: req.user.id, action: 'CREATE_TASK', entityType: 'task', entityId: task.id, ipAddress: req.ip });

    return res.status(201).json({ success: true, message: 'Task created successfully', data: { id: task.id, title: task.title, status: task.status, priority: task.priority, createdAt: task.createdAt } });
  } catch (err) {
    console.error('createTask error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function listTasks(req: AuthRequest, res: Response) {
  const { projectId } = req.params;
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (req.user.role !== 'super_admin' && req.user.tenantId !== project.tenantId) return res.status(403).json({ success: false, message: 'Forbidden' });

    const page = Math.max(1, parseInt((req.query.page as string) || '1'));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '10')));
    const status = (req.query.status as string) || undefined;
    const priority = (req.query.priority as string) || undefined;

    const where: any = { projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const total = await prisma.task.count({ where });
    const tasks = await prisma.task.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } });

    return res.json({ success: true, data: { tasks, total, pagination: { currentPage: page, totalPages: Math.ceil(total / limit), limit } } });
  } catch (err) {
    console.error('listTasks error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function updateTask(req: AuthRequest, res: Response) {
  const { taskId } = req.params;
  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid input', data: parsed.error.flatten() });
  const { title, description, status, priority, dueDate, assignedTo } = parsed.data;

  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (req.user.role !== 'super_admin' && req.user.tenantId !== task.tenantId) return res.status(403).json({ success: false, message: 'Forbidden' });

    const data: any = {};
    if (title) data.title = title;
    if (description !== undefined) data.description = description || null;
    if (status !== undefined) data.status = status;
    if (priority) data.priority = priority;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
    if (assignedTo !== undefined) data.assignedTo = assignedTo || null;

    const updated = await prisma.task.update({ where: { id: taskId }, data });
    await logAudit({ tenantId: task.tenantId, userId: req.user.id, action: 'UPDATE_TASK', entityType: 'task', entityId: taskId, ipAddress: req.ip });

    return res.json({ success: true, message: 'Task updated successfully', data: { id: updated.id, title: updated.title, status: updated.status, updatedAt: updated.updatedAt } });
  } catch (err) {
    console.error('updateTask error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function deleteTask(req: AuthRequest, res: Response) {
  const { taskId } = req.params;

  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (req.user.role === 'user') return res.status(403).json({ success: false, message: 'Only tenant_admin can delete tasks' });

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (req.user.role !== 'super_admin' && req.user.tenantId !== task.tenantId) return res.status(403).json({ success: false, message: 'Forbidden' });

    await prisma.task.delete({ where: { id: taskId } });
    await logAudit({ tenantId: task.tenantId, userId: req.user.id, action: 'DELETE_TASK', entityType: 'task', entityId: taskId, ipAddress: req.ip });

    return res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    console.error('deleteTask error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}