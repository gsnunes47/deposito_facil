import { Router } from 'express';
import { type NextFunction, type Request, type Response } from 'express';
import * as controllers from '../../controllers/despesaController.js';

const router = Router();

router.post('/', controllers.createDespesa);

router.get('/', controllers.getDespesas);

router.delete('/:id', controllers.deleteDespesa);

router.put('/:id', controllers.updateDespesa);

export default router;
