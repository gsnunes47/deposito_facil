import { Router } from 'express';
import * as controller from '../../controllers/configuracaoController.js';

const router = Router();
router.get('/', controller.obter);
router.put('/', controller.salvar);

export default router;
