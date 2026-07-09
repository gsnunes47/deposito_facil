import type { Request, Response } from 'express';
import pagamentoEncomendaDomain from '../domains/pagamentoEncomendaDomain.js';

enum FormaPagamento {
  DINHEIRO = 'DINHEIRO',
  PIX = 'PIX',
  CARTAO_CREDITO = 'CARTAO_CREDITO',
  CARTAO_DEBITO = 'CARTAO_DEBITO',
}

export async function createPagamentoEncomenda(
  request: Request,
  response: Response,
) {
  const user = request.user;

  if (!request.body.encomenda_id || isNaN(Number(request.body.encomenda_id))) {
    return response.status(400).send({
      error: 'Id da encomenda é obrigatório e deve ser um número',
    });
  }

  if (
    !request.body.forma_pagamento ||
    !Object.values(FormaPagamento).includes(request.body.forma_pagamento)
  ) {
    return response.status(400).send({
      error: 'Forma de pagamento inválida.',
    });
  }

  if (
    !request.body.valor ||
    isNaN(Number(request.body.valor)) ||
    Number(request.body.valor) <= 0
  ) {
    return response.status(400).send({
      error: 'Valor é obrigatório e deve ser um número maior que 0.',
    });
  }

  const pagamento = await pagamentoEncomendaDomain.createPagamentoEncomenda(
    Number(request.body.encomenda_id),
    user.tenantId,
    request.body.forma_pagamento,
    Number(request.body.valor),
  );

  if (pagamento.code === 200) {
    return response.status(200).send({
      message: pagamento.message,
      pagamento_id: pagamento.pagamento_id,
    });
  } else {
    return response.status(400).send({
      message: pagamento.message,
      error: pagamento.error,
    });
  }
}

export async function deletePagamentoEncomenda(
  request: Request,
  response: Response,
) {
  const pagamentoId = request.params.id;

  if (!pagamentoId) {
    return response.status(400).send({
      error: 'ID do pagamento é obrigatório',
    });
  } else if (isNaN(Number(pagamentoId))) {
    return response.status(400).send({
      error: 'ID do pagamento deve ser um número',
    });
  }

  const pagamento = await pagamentoEncomendaDomain.deletePagamentoEncomenda(
    Number(pagamentoId),
    request.user.tenantId,
  );

  if (pagamento.code === 200) {
    return response.status(200).send({
      message: pagamento.message,
    });
  } else {
    return response.status(400).send({
      message: pagamento.message,
    });
  }
}
