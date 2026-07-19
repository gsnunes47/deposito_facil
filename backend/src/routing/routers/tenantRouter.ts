import { Router } from 'express';
import * as controllers from '../../controllers/tenantController.js';

const router = Router();

router.get('/', controllers.getTenants);
router.post('/', controllers.createTenant);
router.post('/:id/users', controllers.createTenantUser);
router.patch('/:id/users/:userId', controllers.updateTenantUser);
router.delete('/:id/users/:userId', controllers.deleteTenantUser);

export default router;
