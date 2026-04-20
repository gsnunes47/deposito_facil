import { Router } from "express";
import { type NextFunction, type Request, type Response } from 'express'
import * as controllers from "../../controllers/authController.js";

const router = Router()

router.post('/:tenantId', controllers.login)

export default router;
