import { Router } from 'express';
import { type NextFunction, type Request, type Response } from 'express';
import * as controllers from '../../controllers/encomendaController.js';

const router = Router();

router.post('/', controllers.createEncomenda);

router.get('/abertas', controllers.getEncomendasAbertas);

router.get('/fechadas', controllers.getEncomendasFechadas);

router.get('/:id', controllers.getPagamentos)

export default router;
