import type { Request, Response } from 'express';
import prisma from '../repositories/db.js';
import authDomain from '../domains/authDomain.js';
import { generateToken } from '../helpers/jwtHelper.js';

export async function login(request: Request, response: Response) {
  const tenantId = Number(request.params.tenantId);

  if (!Number.isInteger(tenantId) || tenantId <= 0) {
    return response.status(400).json({
      message: 'Tenant inválido',
    });
  }

  const userData = {
    login: request.body.login,
    password: request.body.password,
    tenantId,
  };

  const auth = await authDomain.login(userData);

  if (auth.code != 200 || !auth.data) {
    return response.status(auth.code).json(auth);
  }

  const token = generateToken({
    userId: auth.data.id,
    tenantId: auth.data.tenant_id,
    accessLevel: auth.data.access_level,
  });

  response
    .cookie('token', token, {
      httpOnly: true, // JS do browser não consegue ler
      secure: process.env.NODE_ENV === 'production', // HTTPS only em prod
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000, // 2h em ms
    })
    .status(200)
    .json({ message: 'Login realizado com sucesso' });
}
