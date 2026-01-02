import express from 'express';
import { createTask, listTasks, updateTask, deleteTask } from '../controllers/tasksController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/projects/:projectId/tasks', authenticate, createTask);
router.get('/projects/:projectId/tasks', authenticate, listTasks);
router.put('/tasks/:taskId', authenticate, updateTask);
router.delete('/tasks/:taskId', authenticate, deleteTask);

export default router;