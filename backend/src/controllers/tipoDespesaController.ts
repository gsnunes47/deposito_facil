import type { Request, Response } from 'express';
import tipoDespesaDomain from '../domains/tipoDespesaDomain.js';

function validarNome(request: Request, response: Response) {
  if (typeof request.body.nome !== 'string' || !request.body.nome.trim()) {
    response
      .status(400)
      .send({ error: 'Nome do tipo de despesa é obrigatório' });
    return null;
  }
  return request.body.nome.trim();
}

function validarId(request: Request, response: Response) {
  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    response
      .status(400)
      .send({ error: 'ID do tipo de despesa deve ser um número válido' });
    return null;
  }
  return id;
}

export async function createTipoDespesa(request: Request, response: Response) {
  const nome = validarNome(request, response);
  if (!nome) return;
  const resultado = await tipoDespesaDomain.createTipoDespesa(
    nome,
    request.user.tenantId,
  );
  return response.status(resultado.code).send(resultado);
}

export async function getTiposDespesa(request: Request, response: Response) {
  return response
    .status(200)
    .send(await tipoDespesaDomain.getTiposDespesa(request.user.tenantId));
}

export async function updateTipoDespesa(request: Request, response: Response) {
  const id = validarId(request, response);
  if (!id) return;
  const nome = validarNome(request, response);
  if (!nome) return;
  const resultado = await tipoDespesaDomain.updateTipoDespesa(
    id,
    nome,
    request.user.tenantId,
  );
  return response.status(resultado.code).send(resultado);
}

export async function deleteTipoDespesa(request: Request, response: Response) {
  const id = validarId(request, response);
  if (!id) return;
  const resultado = await tipoDespesaDomain.deleteTipoDespesa(
    id,
    request.user.tenantId,
  );
  return response.status(resultado.code).send(resultado);
}
