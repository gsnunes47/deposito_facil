import type { Request, Response } from 'express';
import despesaDomain from '../domains/despesaDomain.js';

export async function createDespesa(request: Request, response: Response) {
  const user = request.user;

  if (!request.body.descricao || request.body.descricao.trim() === '') {
    return response
      .status(400)
      .send({ error: 'Descrição da despesa é obrigatória' });
  }

  if (
    request.body.valor === undefined ||
    request.body.valor === null ||
    isNaN(Number(request.body.valor)) ||
    Number(request.body.valor) <= 0
  ) {
    return response
      .status(400)
      .send({ error: 'Valor da despesa deve ser maior que zero' });
  }

  if (!request.body.data || isNaN(new Date(request.body.data).getTime())) {
    return response.status(400).send({
      error: 'Data da despesa é obrigatória e deve ser válida',
    });
  }

  const despesa = await despesaDomain.createDespesa(
    Number(request.body.valor),
    request.body.descricao,
    user.tenantId,
    new Date(request.body.data),
  );

  if (despesa.code === 200) {
    return response.status(200).send({
      message: despesa.message,
      despesa_id: despesa.despesa_id,
    });
  } else {
    return response.status(400).send({
      message: despesa.message,
      error: despesa.error,
    });
  }
}

export async function getDespesas(request: Request, response: Response) {
  const despesas = await despesaDomain.getDespesas(request.user.tenantId);

  response.status(200).send(despesas);
}

export async function deleteDespesa(request: Request, response: Response) {
  const despesaId = request.params.id;

  if (!despesaId) {
    return response.status(400).send({
      error: 'ID da despesa é obrigatório',
    });
  } else if (isNaN(Number(despesaId))) {
    return response.status(400).send({
      error: 'ID da despesa deve ser um número',
    });
  }

  const despesa = await despesaDomain.deleteDespesa(
    Number(despesaId),
    request.user.tenantId,
  );

  if (despesa.code === 200) {
    return response.status(200).send({
      message: despesa.message,
    });
  } else {
    return response.status(400).send({
      message: despesa.message,
    });
  }
}

export async function updateDespesa(request: Request, response: Response) {
  const despesaId = request.params.id;

  if (!despesaId) {
    return response.status(400).send({
      error: 'ID da despesa é obrigatório',
    });
  } else if (isNaN(Number(despesaId))) {
    return response.status(400).send({
      error: 'ID da despesa deve ser um número',
    });
  }

  const despesaData = {
    id: Number(despesaId),
    descricao: (request.body.descricao as string) || '',
    valor: Number(request.body.valor),
    data: new Date(request.body.data),
    tenant_id: request.user.tenantId,
  };

  if (
    !despesaData.descricao.trim() ||
    !Number.isFinite(despesaData.valor) ||
    despesaData.valor <= 0 ||
    isNaN(despesaData.data.getTime())
  ) {
    return response.status(400).send({
      error: 'Descrição, valor e data válida são obrigatórios',
    });
  }

  const updatedDespesa = await despesaDomain.updateDespesa(despesaData);

  if (updatedDespesa.code !== 200) {
    return response.status(400).send(updatedDespesa);
  } else {
    return response.status(200).send(updatedDespesa);
  }
}
