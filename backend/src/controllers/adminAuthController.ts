import type { Request, Response } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { renewSession } from '../helpers/authSession.js';

function valoresIguais(recebido: unknown, esperado: string) {
  const recebidoBuffer = Buffer.from(String(recebido ?? ''));
  const esperadoBuffer = Buffer.from(esperado);

  return (
    recebidoBuffer.length === esperadoBuffer.length &&
    timingSafeEqual(recebidoBuffer, esperadoBuffer)
  );
}

export async function login(request: Request, response: Response) {
  const expectedLogin = process.env.PLATFORM_ADMIN_LOGIN ?? 'admin';
  const expectedPassword = process.env.PLATFORM_ADMIN_PASSWORD;

  if (!expectedPassword) {
    return response
      .status(503)
      .json({ message: 'Acesso administrativo não configurado' });
  }

  if (
    !valoresIguais(request.body.login, expectedLogin) ||
    !valoresIguais(request.body.password, expectedPassword)
  ) {
    return response.status(400).json({ message: 'Login ou senha inválidos' });
  }

  renewSession(response, {
    userId: 0,
    tenantId: 0,
    accessLevel: 'platform_admin',
  });

  return response
    .status(200)
    .json({ message: 'Login realizado com sucesso' });
}
