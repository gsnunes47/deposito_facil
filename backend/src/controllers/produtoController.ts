import type { Request, Response } from 'express';
import produtoDomain from '../domains/produtoDomain.js';

const TIPOS_ITEM = ['PRODUTO', 'SERVICO'] as const;

function obterTipoItem(tipo: unknown, usarPadrao = true) {
  if (tipo == null) return usarPadrao ? 'PRODUTO' : undefined;
  const tipoNormalizado = tipo;
  return TIPOS_ITEM.includes(tipoNormalizado as (typeof TIPOS_ITEM)[number])
    ? (tipoNormalizado as (typeof TIPOS_ITEM)[number])
    : null;
}

function obterPrecoPadrao(valor: unknown) {
  if (valor === undefined) return undefined;
  if (valor === null || valor === '') return null;

  const preco = Number(valor);
  return Number.isInteger(preco) && preco > 0 ? preco : false;
}

export async function createProduto(request: Request, response: Response) {
  const user = request.user;

  if (!request.body.nome || request.body.nome.trim() === '') {
    return response
      .status(400)
      .send({ error: 'Nome do produto é obrigatório' });
  }

  const tipo = obterTipoItem(request.body.tipo);
  const precoPadrao = obterPrecoPadrao(request.body.preco_padrao);

  if (tipo === null) {
    return response.status(400).send({
      error: 'Tipo deve ser PRODUTO ou SERVICO',
    });
  }

  if (precoPadrao === false) {
    return response.status(400).send({
      error: 'Preço padrão deve ser um valor em centavos maior que zero',
    });
  }

  const produto = await produtoDomain.createProduto(
    request.body.nome,
    user.tenantId,
    tipo!,
    precoPadrao ?? null,
  );

  if (produto.code === 200) {
    return response
      .status(200)
      .send({ message: produto.message, produto_id: produto.produto_id });
  } else {
    return response
      .status(400)
      .send({ message: produto.message, error: produto.error });
  }
}

export async function getProdutos(request: Request, response: Response) {
  const produtos = await produtoDomain.getProdutos(request.user.tenantId);

  response.status(200).send(produtos);
}

export async function deleteProduto(request: Request, response: Response) {
  const produtoId = request.params.id;

  if (!produtoId) {
    return response.status(400).send({ error: 'ID do produto é obrigatório' });
  } else if (isNaN(Number(produtoId))) {
    return response
      .status(400)
      .send({ error: 'ID do produto deve ser um número' });
  }

  const produto = await produtoDomain.deleteProduto(
    Number(produtoId),
    request.user.tenantId,
  );

  if (produto.code === 200) {
    return response.status(200).send({ message: produto.message });
  } else {
    return response.status(400).send({ message: produto.message });
  }
}

export async function updateProduto(request: Request, response: Response) {
  const produtoId = request.params.id;

  if (!produtoId) {
    return response.status(400).send({ error: 'ID do produto é obrigatório' });
  } else if (isNaN(Number(produtoId))) {
    return response
      .status(400)
      .send({ error: 'ID do produto deve ser um número' });
  }

  if (!request.body.nome || request.body.nome.trim() === '') {
    return response
      .status(400)
      .send({ error: 'Nome do produto é obrigatório' });
  }

  const tipo = obterTipoItem(request.body.tipo, false);
  const precoPadrao = obterPrecoPadrao(request.body.preco_padrao);

  if (tipo === null) {
    return response.status(400).send({
      error: 'Tipo deve ser PRODUTO ou SERVICO',
    });
  }

  if (precoPadrao === false) {
    return response.status(400).send({
      error: 'Preço padrão deve ser um valor em centavos maior que zero',
    });
  }

  const quantidadeInformada =
    request.body.quantidade != null && request.body.quantidade !== '';

  if (quantidadeInformada && isNaN(Number(request.body.quantidade))) {
    return response.status(400).send({
      error: 'Quantidade do produto deve ser um número',
    });
  }

  const produtoData = {
    id: Number(produtoId),
    nome: request.body.nome,
    tenant_id: request.user.tenantId,
    ...(tipo && { tipo }),
    ...(precoPadrao !== undefined && { preco_padrao: precoPadrao }),
    ...(quantidadeInformada && {
      quantidade: Number(request.body.quantidade),
    }),
  };

  const updatedProduto = await produtoDomain.updateProduto(produtoData);

  if (updatedProduto.code != 200) {
    return response.status(400).send(updatedProduto);
  } else {
    response.status(200).send(updatedProduto);
  }
}
