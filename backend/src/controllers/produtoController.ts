import type { Request, Response } from 'express';
import produtoDomain from '../domains/produtoDomain.js';

export async function createProduto(request: Request, response: Response) {
  const user = request.user;

  if (!request.body.nome || request.body.nome.trim() === '') {
    return response
      .status(400)
      .send({ error: 'Nome do produto é obrigatório' });
  }

  const produto = await produtoDomain.createProduto(
    request.body.nome,
    user.tenantId,
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

  const quantidadeInformada =
    request.body.quantidade != null && request.body.quantidade !== '';

  if (
    quantidadeInformada &&
    isNaN(Number(request.body.quantidade))
  ) {
    return response.status(400).send({
      error: 'Quantidade do produto deve ser um número',
    });
  }

  const produtoData = {
    id: Number(produtoId),
    nome: request.body.nome,
    tenant_id: request.user.tenantId,
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
