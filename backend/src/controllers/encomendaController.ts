import type { Request, Response } from 'express';
import encomendaDomain from '../domains/encomendaDomain.js';

export async function createEncomenda(request: Request, response: Response) {
  const user = request.user;
  const possuiFornecedorId =
    request.body.fornecedor_id !== undefined &&
    request.body.fornecedor_id !== null;
  const fornecedorNome =
    typeof request.body.fornecedor_nome === 'string'
      ? request.body.fornecedor_nome.trim()
      : '';

  if (
    possuiFornecedorId &&
    !Number.isInteger(Number(request.body.fornecedor_id))
  ) {
    return response.status(400).send({
      error: 'ID do fornecedor deve ser um número válido',
    });
  }

  if (
    (possuiFornecedorId && fornecedorNome) ||
    (!possuiFornecedorId && !fornecedorNome)
  ) {
    return response.status(400).send({
      error: 'Selecione um fornecedor ou informe o nome de um novo fornecedor',
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

    const quantidade = Number(produto.quantidade);

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      return response.status(400).send({
        error: `Quantidade deve ser um inteiro maior que zero para o produto na posição ${index}`,
      });
    }

    const valorUnitario = Number(produto.valor_unitario);

    if (!Number.isFinite(valorUnitario) || valorUnitario <= 0) {
      return response.status(400).send({
        error: `Valor unitário deve ser maior que zero para o produto na posição ${index}`,
      });
    }

    produtosData.push({
      id: Number(produto.id),
      quantidade,
      valor_unitario: valorUnitario,
    });
  }

  const encomendaNova = await encomendaDomain.createEncomenda(
    possuiFornecedorId
      ? { fornecedor_id: Number(request.body.fornecedor_id) }
      : { fornecedor_nome: fornecedorNome },
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
