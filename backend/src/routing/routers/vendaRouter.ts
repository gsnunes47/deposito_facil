import { Router } from 'express';
import { type NextFunction, type Request, type Response } from 'express';
import * as controllers from '../../controllers/vendaController.js';

const router = Router();

router.post('/', controllers.createVenda);

router.post('/comprovantes', controllers.getComprovantesVendas);

router.delete('/:id', controllers.deleteVenda);

router.get('/abertas', controllers.getVendasAbertas);

router.get('/fechadas', controllers.getVendasFechadas);

router.get('/:id/comprovante', controllers.getComprovanteVenda);

router.get('/:id', controllers.getPagamentos);

export default router;
