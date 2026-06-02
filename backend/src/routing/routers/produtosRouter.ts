import { Router } from "express";
import { type NextFunction, type Request, type Response } from 'express'
import * as controllers from "../../controllers/produtoController.js";

const router = Router()

router.post('/', controllers.createProduto)

router.get('/', controllers.getProdutos)

router.delete('/:id', controllers.deleteProduto)

router.put('/:id', controllers.updateProduto)

export default router;