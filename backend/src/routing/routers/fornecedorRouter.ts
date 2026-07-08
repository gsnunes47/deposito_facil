import { Router } from 'express';
import { type NextFunction, type Request, type Response } from 'express';
import * as controllers from '../../controllers/fornecedorController.js';

const router = Router();

router.post('/', controllers.createFornecedor);

router.get('/', controllers.getFornecedores);

router.delete('/:id', controllers.deleteFornecedor);

router.put('/:id', controllers.updateFornecedor);

export default router;
