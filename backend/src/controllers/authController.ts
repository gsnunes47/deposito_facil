import type { Request, Response } from "express";
import prisma from "../repositories/db.js";
import authDomain from "../domains/authDomain.js";
import { generateToken } from "../helpers/jwtHelper.js";


export async function login(request: Request, response: Response) {

    const userData = {
        login: request.body.login,
        password: request.body.password,
        tenantId: request.params.tenantId
    }

    const auth = await authDomain.login(userData)

    console.log('auth: ', auth)

    if (auth.code != 200 || !auth.data) {
        console.log("cagada")
        return response.status(auth.code).json(auth)
    }

    const token = generateToken({ userId: auth.data.id, tenantId: auth.data.tenant_id })
    
    response
        .cookie('token', token, {
            httpOnly: true,    // JS do browser não consegue ler
            secure: process.env.NODE_ENV === 'production', // HTTPS only em prod
            sameSite: 'strict',
            maxAge: 2 * 60 * 60 * 1000 // 2h em ms
        })
        .status(200)
        .json({ message: 'Login realizado com sucesso' })
}
