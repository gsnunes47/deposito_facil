import { Router } from "express";
import { type NextFunction, type Request, type Response } from 'express'
import * as controllers from "../../controllers/userController.js";

const router = Router()

router.get('/', controllers.getUsers)

router.get('/:id', controllers.getUserById)

router.post('/', controllers.createUser)

export default router;