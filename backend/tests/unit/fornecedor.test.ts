import { describe, it, expect, afterEach } from 'vitest';
import fornecedorDomain from '../../src/domains/fornecedorDomain.js';
import prisma from '../../src/repositories/db.js';

let fornecedorId = 0;

afterEach(async () => {
  if (fornecedorId !== 0) {
    await prisma.fornecedor.deleteMany({
      where: {
        id: fornecedorId,
        tenant_id: 1,
      },
    });
  }

  fornecedorId = 0;
});

describe('Fornecedor Domain', () => {
  it('deve criar um fornecedor', async () => {
    const fornecedorNovo = await fornecedorDomain.createFornecedor(
      'Fornecedor Teste',
      1,
      '12345678900',
    );

    fornecedorId = fornecedorNovo.fornecedor_id as number;

    expect(fornecedorNovo.code).toBe(200);
  });

  it('deve apagar um fornecedor', async () => {
    const fornecedorNovo = await fornecedorDomain.createFornecedor(
      'Fornecedor Teste',
      1,
      '12345678900',
    );

    const fornecedorDeletado = await fornecedorDomain.deleteFornecedor(
      fornecedorNovo.fornecedor_id as number,
      1,
    );

    expect(fornecedorDeletado.code).toBe(200);
  });

  it('deve retornar erro ao atualizar fornecedor inexistente', async () => {
    const resultado = await fornecedorDomain.updateFornecedor({
      id: 999999,
      tenant_id: 1,
      nome: 'Fornecedor Teste',
      documento: '12345678900',
    });

    expect(resultado.code).toBe(400);
  });

  it('deve retornar erro ao deletar fornecedor inexistente', async () => {
    const resultado = await fornecedorDomain.deleteFornecedor(999999, 1);

    expect(resultado.code).toBe(400);
  });
});