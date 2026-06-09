import type { Request, Response } from 'express';
import clienteDomain from '../domains/clienteDomain.js';

export async function createCliente(request: Request, response: Response) {
  const user = request.user;

  if (!request.body.nome || request.body.nome.trim() === '') {
    return response
      .status(400)
      .send({ error: 'Nome do cliente é obrigatório' });
  }

  const cliente = await clienteDomain.createCliente(
    request.body.nome,
    user.tenantId,
    request.body.documento ?? '',
  );

  if (cliente.code === 200) {
    return response
      .status(200)
      .send({ message: cliente.message, cliente_id: cliente.cliente_id });
  } else {
    return response
      .status(400)
      .send({ message: cliente.message, error: cliente.error });
  }
}

export async function getClientes(request: Request, response: Response) {
  const clientes = await clienteDomain.getClientes(request.user.tenantId);

  response.status(200).send(clientes);
}

export async function deleteCliente(request: Request, response: Response) {
  const clienteId = request.params.id;

  if (!clienteId) {
    return response.status(400).send({ error: 'ID do cliente é obrigatório' });
  } else if (isNaN(Number(clienteId))) {
    return response
      .status(400)
      .send({ error: 'ID do cliente deve ser um número' });
  }

  const cliente = await clienteDomain.deleteCliente(
    Number(clienteId),
    request.user.tenantId,
  );

  if (cliente.code === 200) {
    return response.status(200).send({ message: cliente.message });
  } else {
    return response.status(400).send({ message: cliente.message });
  }
}

export async function updateCliente(request: Request, response: Response) {
  const clienteId = request.params.id;

  if (!clienteId) {
    return response.status(400).send({ error: 'ID do cliente é obrigatório' });
  } else if (isNaN(Number(clienteId))) {
    return response
      .status(400)
      .send({ error: 'ID do cliente deve ser um número' });
  }

  const clienteData = {
    id: Number(clienteId),
    nome: (request.body.nome as string) || null,
    documento: (request.body.documento as string) || null,
    tenant_id: request.user.tenantId,
  };

  const updatedCliente = await clienteDomain.updateCliente(clienteData);

  if (updatedCliente.code != 200) {
    return response.status(400).send(updatedCliente);
  } else {
    response.status(200).send(updatedCliente);
  }
}
