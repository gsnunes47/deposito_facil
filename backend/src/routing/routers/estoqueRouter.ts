import { Router } from 'express';
import * as controllers from '../../controllers/estoqueController.js';

const router = Router();

router.get('/', controllers.getEstoque);

export default router;
