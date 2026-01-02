import prisma from '../prisma';

export async function logAudit({ tenantId, userId, action, entityType, entityId, ipAddress }: {
  tenantId: string | null;
  userId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  ipAddress?: string | null;
}) {
  try {
    // Skip audit logging for system/super-admin actions (no tenantId)
    if (!tenantId) return;
    
    await prisma.auditLog.create({ data: { tenantId: tenantId as string, userId: userId || null, action, entityType, entityId, ipAddress } });
  } catch (err) {
    console.error('Failed to write audit log', err);
  }
}
