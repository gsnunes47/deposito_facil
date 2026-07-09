import { Router } from 'express';
import * as controllers from '../../controllers/pagamentoEncomendaController.js';

const router = Router();

router.post('/', controllers.createPagamentoEncomenda);

router.delete('/:id', controllers.deletePagamentoEncomenda);

export default router;
