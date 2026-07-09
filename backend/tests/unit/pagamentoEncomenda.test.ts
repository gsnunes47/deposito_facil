import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest';
import fornecedorDomain from '../../src/domains/fornecedorDomain.js';
import produtoDomain from '../../src/domains/produtoDomain.js';
import encomendaDomain from '../../src/domains/encomendaDomain.js';
import pagamentoEncomendaDomain from '../../src/domains/pagamentoEncomendaDomain.js';
import prisma from '../../src/repositories/db.js';

let pagamentoId = 0;
let fornecedor: any;
let produto: any;
let encomenda: any;

beforeAll(async () => {
  fornecedor = await fornecedorDomain.createFornecedor(
    'Fornecedor Teste',
    1,
    '12345678900',
  );

  produto = await produtoDomain.createProduto('Produto Teste', 1);

  encomenda = await encomendaDomain.createEncomenda(
    fornecedor.fornecedor_id,
    [
      {
        id: produto.produto_id,
        quantidade: 2,
        valor_unitario: 1000,
      },
    ],
    1,
  );
});

afterEach(async () => {
  if (pagamentoId !== 0) {
    await pagamentoEncomendaDomain.deletePagamentoEncomenda(
      pagamentoId,
      1,
    );
  }

  pagamentoId = 0;
});

afterAll(async () => {
  await prisma.encomenda.deleteMany({
    where: {
      id: encomenda.encomenda_id,
      tenant_id: 1,
    },
  });

  await prisma.fornecedor.deleteMany({
    where: {
      id: fornecedor.fornecedor_id,
      tenant_id: 1,
    },
  });

  await prisma.produto.deleteMany({
    where: {
      id: produto.produto_id,
      tenant_id: 1,
    },
  });
});

describe('Pagamento Encomenda Domain', () => {
  it('deve criar um pagamento', async () => {
    const pagamentoNovo =
      await pagamentoEncomendaDomain.createPagamentoEncomenda(
        encomenda.encomenda_id,
        1,
        'PIX',
        500,
      );

    pagamentoId = pagamentoNovo.pagamento_id as number;

    expect(pagamentoNovo.code).toBe(200);
  });

  it('deve deletar um pagamento', async () => {
    const pagamentoNovo =
      await pagamentoEncomendaDomain.createPagamentoEncomenda(
        encomenda.encomenda_id,
        1,
        'PIX',
        500,
      );

    const pagamentoDeletado =
      await pagamentoEncomendaDomain.deletePagamentoEncomenda(
        Number(pagamentoNovo.pagamento_id),
        1,
      );

    expect(pagamentoDeletado.code).toBe(200);
  });

  it('deve criar um pagamento que feche a encomenda', async () => {
    const pagamentoNovo =
      await pagamentoEncomendaDomain.createPagamentoEncomenda(
        encomenda.encomenda_id,
        1,
        'PIX',
        2000,
      );

    pagamentoId = pagamentoNovo.pagamento_id as number;

    expect(!pagamentoNovo.encomenda).toBe(false);
  });

  it('deve falhar ao tentar criar um pagamento com forma de pagamento errada', async () => {
    const pagamentoNovo =
      await pagamentoEncomendaDomain.createPagamentoEncomenda(
        encomenda.encomenda_id,
        1,
        'CREDITO' as any,
        500,
      );

    expect(pagamentoNovo.code).toBe(400);
  });
});