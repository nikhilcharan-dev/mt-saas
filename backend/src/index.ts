import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import prisma from './prisma';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));

// Health
import { Request, Response, NextFunction } from 'express';
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    // Basic DB connectivity
    await prisma.$queryRaw`SELECT 1`;

    // Check seed: superadmin exists
    const superAdmin = await prisma.user.findFirst({ where: { email: 'superadmin@system.com' } });
    if (!superAdmin) {
      return res.status(503).json({ status: 'error', database: 'migrations_or_seeds_missing' });
    }

    return res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    console.error('Health check failed', err);
    return res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// API routes
app.use('/api/auth', authRoutes);
import tenantsRoutes from './routes/tenants';
import userRoutes from './routes/users';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
app.use('/api/tenants', tenantsRoutes);
app.use('/api', userRoutes);
app.use('/api', projectRoutes);
app.use('/api', taskRoutes);

// Error handler
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
