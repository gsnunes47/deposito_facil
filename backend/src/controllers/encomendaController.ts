import type { Request, Response } from 'express';
import encomendaDomain from '../domains/encomendaDomain.js';

export async function createEncomenda(request: Request, response: Response) {
  const user = request.user;

  if (
    !request.body.fornecedor_id ||
    isNaN(Number(request.body.fornecedor_id))
  ) {
    return response.status(400).send({
      error: 'ID do fornecedor é obrigatório e deve ser um número',
    });
  }

  if (
    !request.body.produtos ||
    !Array.isArray(request.body.produtos) ||
    request.body.produtos.length === 0
  ) {
    return response.status(400).send({
      error: 'Produtos da encomenda são obrigatórios e devem ser uma lista',
    });
  }

  const produtosData = [];

  for (const [index, produto] of request.body.produtos.entries()) {
    if (!produto.id) {
      return response.status(400).send({
        error: `ID do produto é obrigatório para o produto na posição ${index}`,
      });
    } else if (isNaN(Number(produto.id))) {
      return response.status(400).send({
        error: `ID do produto deve ser um número para o produto na posição ${index}`,
      });
    }

    if (!produto.quantidade) {
      return response.status(400).send({
        error: `Quantidade é obrigatória para o produto na posição ${index}`,
      });
    } else if (isNaN(Number(produto.quantidade))) {
      return response.status(400).send({
        error: `Quantidade deve ser um número para o produto na posição ${index}`,
      });
    }

    if (!produto.valor_unitario) {
      return response.status(400).send({
        error: `Valor unitário é obrigatório para o produto na posição ${index}`,
      });
    } else if (isNaN(Number(produto.valor_unitario))) {
      return response.status(400).send({
        error: `Valor unitário deve ser um número para o produto na posição ${index}`,
      });
    }

    produtosData.push({
      id: produto.id,
      quantidade: produto.quantidade,
      valor_unitario: produto.valor_unitario,
    });
  }

  const encomendaNova = await encomendaDomain.createEncomenda(
    Number(request.body.fornecedor_id),
    produtosData,
    user.tenantId,
  );

  if (!encomendaNova.encomenda_id) {
    return response.status(400).send(encomendaNova);
  }

  return response.status(200).send({
    message: 'Encomenda criada com sucesso',
    encomenda_id: encomendaNova.encomenda_id,
  });
}

export async function getEncomendasAbertas(
  request: Request,
  response: Response,
) {
  const encomendas = await encomendaDomain.getEncomendasAbertas(
    request.user.tenantId,
  );

  response.status(200).send(encomendas);
}

export async function getEncomendasFechadas(
  request: Request,
  response: Response,
) {
  const encomendas = await encomendaDomain.getEncomendasFechadas(
    request.user.tenantId,
  );

  response.status(200).send(encomendas);
}

export async function getPagamentos(request: Request, response: Response) {
  if (!request.params.id || isNaN(Number(request.params.id))) {
    return response.status(400).send({
      error: 'ID da encomenda é obrigatório e deve ser um número',
    });
  }

  const encomenda = await encomendaDomain.getEncomendaPagamentos(
    Number(request.params.id),
    request.user.tenantId,
  );

  response.status(200).send(encomenda);
}
