import { Router } from 'express';
import * as controllers from '../../controllers/tipoDespesaController.js';

const router = Router();

router.post('/', controllers.createTipoDespesa);
router.get('/', controllers.getTiposDespesa);
router.put('/:id', controllers.updateTipoDespesa);
router.delete('/:id', controllers.deleteTipoDespesa);

export default router;
