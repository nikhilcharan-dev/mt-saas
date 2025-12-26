import express from 'express';
import { registerTenant } from '../controllers/tenantController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireSuperAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post(
  '/register',
  authenticate,
  requireSuperAdmin,
  registerTenant
);

export default router;
