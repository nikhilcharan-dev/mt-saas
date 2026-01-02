import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import prisma from '../prisma';
import { User, Tenant } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  tenantId?: string | null;
  role: 'super_admin' | 'tenant_admin' | 'user' | string;
}

export interface AuthRequest extends Request {
  user?: User | null;
  tenant?: Tenant | null;
  tokenPayload?: TokenPayload;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Authorization header missing' });

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    req.tokenPayload = payload;

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account is inactive' });

    req.user = user;

    if (payload.tenantId) {
      const tenant = await prisma.tenant.findUnique({ where: { id: payload.tenantId } });
      req.tenant = tenant;
    } else {
      req.tenant = null;
    }

    next();
  } catch (err) {
    console.error('Auth error', err);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (roles.includes(req.user.role)) return next();
    return res.status(403).json({ success: false, message: 'Forbidden' });
  };
}
