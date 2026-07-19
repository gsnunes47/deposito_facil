import { Router } from 'express';
import * as controllers from '../../controllers/adminAuthController.js';

const router = Router();

router.post('/', controllers.login);

export default router;
