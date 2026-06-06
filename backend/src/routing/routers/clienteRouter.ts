import { Router } from "express";
import { type NextFunction, type Request, type Response } from 'express'
import * as controllers from "../../controllers/clienteController.js";

const router = Router()

router.post('/', controllers.createCliente)

router.get('/', controllers.getClientes)

router.delete('/:id', controllers.deleteCliente)

router.put('/:id', controllers.updateCliente)

export default router;