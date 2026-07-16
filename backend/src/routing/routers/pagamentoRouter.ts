import { Router } from 'express';
import * as controllers from '../../controllers/pagamentoController.js';

const router = Router();

router.post('/', controllers.createPagamento);
router.post('/quitar-vendas', controllers.quitarVendas);

router.delete('/:id', controllers.deletePagamento);

export default router;
