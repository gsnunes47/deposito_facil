import type { Request, Response } from "express";
import prisma from "../repositories/db.js";
import authDomain from "../domains/authDomain.js";


export async function login(request: Request, response: Response) {

    const userData = {
        login: request.body.login,
        password: request.body.password,
        tenantId: request.params.tenantId
    }

    const auth = await authDomain.login(userData)

    if (auth.code != 200) {
        return response.status(auth.code).json(auth)
    }

    // const token = chamar função de token

    response.status(200).json({})
}
