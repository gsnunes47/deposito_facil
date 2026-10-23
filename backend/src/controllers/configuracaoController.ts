import type { Request, Response } from 'express';
import configuracaoDomain from '../domains/configuracaoDomain.js';

export async function obter(request: Request, response: Response) {
  const configuracao = await configuracaoDomain.obter(request.user.tenantId);
  if (!configuracao) {
    return response.status(404).json({ message: 'Tenant não encontrado.' });
  }
  return response.json(configuracao);
}

export async function salvar(request: Request, response: Response) {
  if (typeof request.body?.listar_produtos !== 'boolean') {
    return response.status(400).json({
      message: 'Informe se os produtos devem ser exibidos em lista.',
    });
  }

  const configuracao = await configuracaoDomain.salvar(
    request.user.tenantId,
    request.body.listar_produtos,
  );
  return response.json(configuracao);
}
