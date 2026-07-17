import type { Request, Response } from 'express';
import estoqueDomain from '../domains/estoqueDomain.js';

export async function getEstoque(request: Request, response: Response) {
  const estoque = await estoqueDomain.getVisaoEstoque(request.user.tenantId);

  return response.status(200).send(estoque);
}
