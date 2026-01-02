import express from 'express';
import { addUser, listTenantUsers, updateUser, deleteUser } from '../controllers/usersController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/tenants/:tenantId/users', authenticate, addUser);
router.get('/tenants/:tenantId/users', authenticate, listTenantUsers);
router.put('/users/:userId', authenticate, updateUser);
router.delete('/users/:userId', authenticate, deleteUser);

export default router;