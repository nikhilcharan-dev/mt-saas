import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import pool from './config/db.js';
import { initDatabase } from './config/initDb.js';

import authRoutes from './routes/authRoutes.js';
import tenantRoutes from './routes/tenantRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
dotenv.config();

const app = express();

/* ============================
   GLOBAL MIDDLEWARES (FIRST)
   ============================ */
app.use(cors({
  origin: ["http://localhost:3000"],
  credentials: true
}));


app.use(express.json()); // 🔥 MUST BE BEFORE ROUTES

/* ============================
   ROUTES
   ============================ */
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', taskRoutes);

/* ============================
   HEALTH CHECK
   ============================ */
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'ok',
      database: 'connected',
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
    });
  }
});

/* ============================
   START SERVER
   ============================ */
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await initDatabase();

    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database');
    process.exit(1);
  }
})();
