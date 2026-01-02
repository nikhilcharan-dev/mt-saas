import express from 'express';
import { authenticate } from '../middleware/auth';
import { getTenantDetails, updateTenant, listTenants } from '../controllers/tenantsController';

const router = express.Router();

router.get('/', authenticate, listTenants); // super_admin only
router.get('/:tenantId', authenticate, getTenantDetails);
router.put('/:tenantId', authenticate, updateTenant);

export default router;