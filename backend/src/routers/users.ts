import { Router } from "express";
import { type NextFunction, type Request, type Response } from 'express'
import * as controllers from "../controllers/users.js";

const router = Router()

router.get('/', controllers.getUsers)

router.get('/:id', controllers.getUserById)

router.post('/', controllers.createFirstUser)

export default router;