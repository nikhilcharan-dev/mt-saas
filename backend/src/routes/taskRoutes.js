import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
  requireTenantUser,
  requireTenantAdmin,
} from '../middlewares/roleMiddleware.js';

import {
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';

const router = express.Router();

/* ============================
   TASK ROUTES
============================ */

// Get tasks for a project (tenant users)
router.get(
  '/projects/:projectId/tasks',
  authenticate,
  requireTenantUser,
  getProjectTasks
);

// Create task (tenant users)
router.post(
  '/projects/:projectId/tasks',
  authenticate,
  requireTenantUser,
  createTask
);

// Update task (tenant users)
router.put(
  '/tasks/:taskId',
  authenticate,
  requireTenantUser,
  updateTask
);

// Delete task (tenant admin only)
router.delete(
  '/tasks/:taskId',
  authenticate,
  requireTenantAdmin,
  deleteTask
);

export default router;
