import { Router } from "express";
import { type NextFunction, type Request, type Response } from 'express'
import { getUserById, getUsers } from "../controllers/users.js";

const router = Router()

router.get('/', getUsers)

router.get('/:id', getUserById)

export default router;