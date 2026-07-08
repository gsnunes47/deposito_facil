import type { Request, Response } from 'express';
import fornecedorDomain from '../domains/fornecedorDomain.js';

export async function createFornecedor(request: Request, response: Response) {
  const user = request.user;

  if (!request.body.nome || request.body.nome.trim() === '') {
    return response
      .status(400)
      .send({ error: 'Nome do fornecedor é obrigatório' });
  }

  const fornecedor = await fornecedorDomain.createFornecedor(
    request.body.nome,
    user.tenantId,
    request.body.documento ?? '',
  );

  if (fornecedor.code === 200) {
    return response.status(200).send({
      message: fornecedor.message,
      fornecedor_id: fornecedor.fornecedor_id,
    });
  } else {
    return response.status(400).send({
      message: fornecedor.message,
      error: fornecedor.error,
    });
  }
}

export async function getFornecedores(request: Request, response: Response) {
  const fornecedores = await fornecedorDomain.getFornecedores(
    request.user.tenantId,
  );

  response.status(200).send(fornecedores);
}

export async function deleteFornecedor(request: Request, response: Response) {
  const fornecedorId = request.params.id;

  if (!fornecedorId) {
    return response
      .status(400)
      .send({ error: 'ID do fornecedor é obrigatório' });
  } else if (isNaN(Number(fornecedorId))) {
    return response
      .status(400)
      .send({ error: 'ID do fornecedor deve ser um número' });
  }

  const fornecedor = await fornecedorDomain.deleteFornecedor(
    Number(fornecedorId),
    request.user.tenantId,
  );

  if (fornecedor.code === 200) {
    return response.status(200).send({
      message: fornecedor.message,
    });
  } else {
    return response.status(400).send({
      message: fornecedor.message,
    });
  }
}

export async function updateFornecedor(request: Request, response: Response) {
  const fornecedorId = request.params.id;
  const fornecedorNome = request.params.nome;

  if (!fornecedorId) {
    return response
      .status(400)
      .send({ error: 'ID do fornecedor é obrigatório' });
  } else if (isNaN(Number(fornecedorId))) {
    return response
      .status(400)
      .send({ error: 'ID do fornecedor deve ser um número' });
  }

  if (!fornecedorNome) {
    return response
      .status(400)
      .send({ error: 'Nome do fornecedor é obrigatório' });
  }
  const fornecedorData = {
    id: Number(fornecedorId),
    nome: `${fornecedorNome}` as string,
    documento: (request.body.documento as string) || null,
    tenant_id: request.user.tenantId,
  };

  const updatedFornecedor =
    await fornecedorDomain.updateFornecedor(fornecedorData);

  if (updatedFornecedor.code !== 200) {
    return response.status(400).send(updatedFornecedor);
  } else {
    return response.status(200).send(updatedFornecedor);
  }
}
