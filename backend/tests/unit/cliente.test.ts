import { describe, it, expect, afterEach } from 'vitest';
import clienteDomain from '../../src/domains/clienteDomain.js';
import prisma from '../../src/repositories/db.js';

let clienteId: number = 0;

afterEach(async () => {
  if (clienteId !== 0) {
    await prisma.cliente.deleteMany({
      where: {
        id: clienteId,
        tenant_id: 1,
      },
    });

    clienteId = 0;
  }
});

describe('Cliente Domain', () => {
  it('deve criar um cliente', async () => {
    const clienteNovo = await clienteDomain.createCliente(
      'Cliente Teste',
      1,
      '',
    );

    clienteId = Number(clienteNovo.cliente_id);

    expect(clienteNovo.code).toBe(200);
  });

  it('deve apagar um cliente', async () => {
    const clienteNovo = await clienteDomain.createCliente('Cliente Teste', 1);

    const clienteDeletado = await clienteDomain.deleteCliente(
      clienteNovo.cliente_id as number,
      1,
    );

    expect(clienteDeletado.code).toBe(200);
  });

  it('deve alterar o nome de um cliente sem mudar seu documento', async () => {
    const clienteNovo = await clienteDomain.createCliente(
      'Cliente Teste',
      1,
      '444',
    );

    clienteId = Number(clienteNovo.cliente_id);

    const clienteAtualizado = await clienteDomain.updateCliente({
      tenant_id: 1,
      documento: null,
      nome: 'Cliente Teste att',
      id: clienteNovo.cliente_id as number,
    });

    if (!clienteAtualizado.cliente) {
      throw new Error('Cliente não foi atualizado');
    }

    //atualiza o nome
    expect(clienteAtualizado.cliente.nome).toBe('Cliente Teste att');
    //mantem o documento
    expect(clienteAtualizado.cliente.documento).toBe('444');
  });

  it('deve alterar o documento de um cliente sem alterar seu nome', async () => {
    const clienteNovo = await clienteDomain.createCliente(
      'Cliente Teste',
      1,
      '444',
    );

    clienteId = Number(clienteNovo.cliente_id);

    const clienteAtualizado = await clienteDomain.updateCliente({
      tenant_id: 1,
      documento: '555',
      nome: null,
      id: clienteNovo.cliente_id as number,
    });

    if (!clienteAtualizado.cliente) {
      throw new Error('Cliente não foi atualizado');
    }

    expect(clienteAtualizado.cliente.nome).toBe('Cliente Teste');
    expect(clienteAtualizado.cliente.documento).toBe('555');
  });

  it('deve retornar erro ao atualizar cliente inexistente', async () => {
    const resultado = await clienteDomain.updateCliente({
      id: 999999,
      nome: 'Teste',
      documento: null,
      tenant_id: 1,
    });

    expect(resultado.code).toBe(400);
  });

  it('deve retornar erro ao deletar cliente inexistente', async () => {
    const resultado = await clienteDomain.deleteCliente(999999, 1);

    expect(resultado.code).toBe(400);
  });

  it('deve ler os dados de um cliente sem expor seu global_id', async () => {
    const clienteNovo = await clienteDomain.createCliente(
      'Cliente Teste',
      1,
      '444',
    );

    clienteId = Number(clienteNovo.cliente_id);

    const consultaCliente = await clienteDomain.getClientes(1);

    expect('global_id' in consultaCliente[0]).toBe(false);
  });
});
