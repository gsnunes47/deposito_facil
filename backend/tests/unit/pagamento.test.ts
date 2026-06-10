import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest';
import clienteDomain from '../../src/domains/clienteDomain.js';
import produtoDomain from '../../src/domains/produtoDomain.js';
import vendaDomain from '../../src/domains/vendaDomain.js';
import pagamentoDomain from '../../src/domains/pagamentoDomain.js';
import prisma from '../../src/repositories/db.js';

let pagamentoId: number = 0;
let cliente: any;
let produto: any;
let venda: any;

beforeAll(async () => {
  cliente = await clienteDomain.createCliente('Cliente Teste', 1);

  produto = await produtoDomain.createProduto('Produto Teste', 1);

  venda = await vendaDomain.createVenda(
    cliente.cliente_id,
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
    await pagamentoDomain.deletePagamento(pagamentoId, 1);
  }

  pagamentoId = 0;
});

afterAll(async () => {
  await prisma.venda.deleteMany({
    where: {
      id: venda.venda_id,
      tenant_id: 1,
    },
  });

  await prisma.cliente.deleteMany({
    where: {
      id: cliente.cliente_id,
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

describe('Pagamento Domain', () => {
  it('deve criar um pagamento', async () => {
    const pagamentoNovo = await pagamentoDomain.createPagamento(
      venda.venda_id,
      1,
      'PIX',
      500,
    );

    pagamentoId = pagamentoNovo.pagamento_id as number;

    expect(pagamentoNovo.code).toBe(200);
  });

  it('deve deletar um pagamento', async () => {
    const pagamentoNovo = await pagamentoDomain.createPagamento(
      venda.venda_id,
      1,
      'PIX',
      500,
    );
    pagamentoNovo;

    const pagamentoDeletado = await pagamentoDomain.deletePagamento(
      Number(pagamentoNovo.pagamento_id),
      1,
    );

    expect(pagamentoDeletado.code).toBe(200);
  });

  it('deve criar um pagamento que feche a venda', async () => {
    const pagamentoNovo = await pagamentoDomain.createPagamento(
      venda.venda_id,
      1,
      'PIX',
      2000,
    );

    pagamentoId = pagamentoNovo.pagamento_id as number;

    expect(!pagamentoNovo.venda).toBe(false);
  });

  it('deve falhar ao tentar criar um pagamento com forma de pagamento errada', async () => {
    const pagamentoNovo = await pagamentoDomain.createPagamento(
      venda.venda_id,
      1,
      'CREDITO' as any,
      500,
    );

    expect(pagamentoNovo.code).toBe(400);
  });
});
