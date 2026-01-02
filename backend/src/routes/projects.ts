import express from 'express';
import { createProject, listProjects, updateProject, deleteProject } from '../controllers/projectsController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/tenants/:tenantId/projects', authenticate, createProject);
router.get('/tenants/:tenantId/projects', authenticate, listProjects);
router.put('/projects/:projectId', authenticate, updateProject);
router.delete('/projects/:projectId', authenticate, deleteProject);

export default router;