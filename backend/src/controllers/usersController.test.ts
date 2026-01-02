import { addUser } from './usersController';
import prisma from '../prisma';

jest.mock('../prisma', () => ({
  user: {
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn()
  },
  tenant: {
    findUnique: jest.fn()
  },
  task: { updateMany: jest.fn() }
}));

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('addUser controller', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 401 when not authenticated', async () => {
    const req: any = { params: { tenantId: 't1' }, body: { email: 'x@x.com', password: 'password123', fullName: 'X' } };
    const res = mockRes();

    await addUser(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not authenticated' });
  });

  test('returns 404 when tenant not found', async () => {
    const req: any = { params: { tenantId: 't1' }, body: { email: 'x@x.com', password: 'password123', fullName: 'X' }, user: { id: 'u1', role: 'tenant_admin', tenantId: 't1' }, ip: '127.0.0.1' };
    const res = mockRes();

    (prisma.tenant.findUnique as jest.Mock).mockResolvedValue(null);

    await addUser(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Tenant not found' });
  });

  test('returns 403 when limit reached', async () => {
    const req: any = { params: { tenantId: 't1' }, body: { email: 'x@x.com', password: 'password123', fullName: 'X' }, user: { id: 'u1', role: 'tenant_admin', tenantId: 't1' }, ip: '127.0.0.1' };
    const res = mockRes();

    (prisma.tenant.findUnique as jest.Mock).mockResolvedValue({ id: 't1', maxUsers: 1 });
    (prisma.user.count as jest.Mock).mockResolvedValue(1);

    await addUser(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Subscription user limit reached' });
  });

  test('creates a user successfully', async () => {
    const req: any = { params: { tenantId: 't1' }, body: { email: 'x@x.com', password: 'password123', fullName: 'X' }, user: { id: 'u1', role: 'tenant_admin', tenantId: 't1' }, ip: '127.0.0.1' };
    const res = mockRes();

    (prisma.tenant.findUnique as jest.Mock).mockResolvedValue({ id: 't1', maxUsers: 5 });
    (prisma.user.count as jest.Mock).mockResolvedValue(0);
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({ id: 'newid', email: 'x@x.com', fullName: 'X', role: 'user', isActive: true, createdAt: new Date() });

    await addUser(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: 'User created successfully' }));
  });
});