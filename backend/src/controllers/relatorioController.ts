import type { Request, Response } from 'express';
import relatorioDomain, {
  type PeriodoRelatorio,
} from '../domains/relatorioDomain.js';

const formasPagamento = ['DINHEIRO', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO'];

function obterPeriodo(request: Request, response: Response) {
  const dataInicio = String(request.query.data_inicio ?? '');
  const dataFim = String(request.query.data_fim ?? '');
  const formatoData = /^\d{4}-\d{2}-\d{2}$/;

  if (!formatoData.test(dataInicio) || !formatoData.test(dataFim)) {
    response.status(400).send({
      error: 'Data inicial e data final são obrigatórias no formato AAAA-MM-DD',
    });
    return null;
  }

  const inicio = new Date(`${dataInicio}T00:00:00.000Z`);
  const fim = new Date(`${dataFim}T00:00:00.000Z`);

  if (
    isNaN(inicio.getTime()) ||
    isNaN(fim.getTime()) ||
    inicio.getTime() > fim.getTime()
  ) {
    response.status(400).send({
      error: 'O período informado é inválido',
    });
    return null;
  }

  const fimExclusivo = new Date(fim);
  fimExclusivo.setUTCDate(fimExclusivo.getUTCDate() + 1);

  return {
    inicio,
    fimExclusivo,
  } satisfies PeriodoRelatorio;
}

export async function getContasAbertas(request: Request, response: Response) {
  const periodo = obterPeriodo(request, response);
  if (!periodo) return;

  const clienteId = request.query.cliente_id
    ? Number(request.query.cliente_id)
    : undefined;

  if (clienteId !== undefined && !Number.isInteger(clienteId)) {
    return response.status(400).send({
      error: 'Cliente inválido',
    });
  }

  const resultado = await relatorioDomain.getContasAbertas(
    request.user.tenantId,
    periodo,
    clienteId,
  );

  return response.status(200).send(resultado);
}

export async function getLucro(request: Request, response: Response) {
  const periodo = obterPeriodo(request, response);
  if (!periodo) return;

  const resultado = await relatorioDomain.getLucro(
    request.user.tenantId,
    periodo,
  );

  return response.status(200).send(resultado);
}

export async function getResumoVendas(request: Request, response: Response) {
  const periodo = obterPeriodo(request, response);
  if (!periodo) return;

  const resultado = await relatorioDomain.getResumoVendas(
    request.user.tenantId,
    periodo,
  );

  return response.status(200).send(resultado);
}

export async function getFormasPagamento(request: Request, response: Response) {
  const periodo = obterPeriodo(request, response);
  if (!periodo) return;

  const formaPagamento = request.query.forma_pagamento
    ? String(request.query.forma_pagamento)
    : undefined;

  if (formaPagamento && !formasPagamento.includes(formaPagamento)) {
    return response.status(400).send({
      error: 'Forma de pagamento inválida',
    });
  }

  const resultado = await relatorioDomain.getFormasPagamento(
    request.user.tenantId,
    periodo,
    formaPagamento,
  );

  return response.status(200).send(resultado);
}
