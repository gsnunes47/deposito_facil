import { Router } from 'express';
import * as controllers from '../../controllers/relatorioController.js';

const router = Router();

router.get('/contas-abertas', controllers.getContasAbertas);
router.get('/lucro', controllers.getLucro);
router.get('/resumo-vendas', controllers.getResumoVendas);
router.get('/formas-pagamento', controllers.getFormasPagamento);

export default router;
