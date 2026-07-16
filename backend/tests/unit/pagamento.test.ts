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

  it('deve quitar várias vendas em uma única operação', async () => {
    const primeiraVenda = await vendaDomain.createVenda(
      cliente.cliente_id,
      [{ id: produto.produto_id, quantidade: 1, valor_unitario: 700 }],
      1,
    );
    const segundaVenda = await vendaDomain.createVenda(
      cliente.cliente_id,
      [{ id: produto.produto_id, quantidade: 1, valor_unitario: 1300 }],
      1,
    );
    const vendaIds = [
      primeiraVenda.venda_id as number,
      segundaVenda.venda_id as number,
    ];

    try {
      await pagamentoDomain.createPagamento(vendaIds[0], 1, 'PIX', 200);

      const resultado = await pagamentoDomain.quitarVendas(
        vendaIds,
        1,
        'PIX',
      );
      const vendasQuitadas = await prisma.venda.findMany({
        where: { id: { in: vendaIds }, tenant_id: 1 },
        include: { pagamentos: true },
      });

      expect(resultado.code).toBe(200);
      expect(resultado.quantidade).toBe(2);
      expect(resultado.valor_total).toBe(1800);
      expect(vendasQuitadas.every((venda) => venda.pago)).toBe(true);
      expect(
        vendasQuitadas.every(
          (venda) =>
            venda.pagamentos.reduce(
              (total, pagamento) => total + Number(pagamento.valor),
              0,
            ) === venda.total,
        ),
      ).toBe(true);
    } finally {
      await prisma.pagamento.deleteMany({
        where: { venda_id: { in: vendaIds }, tenant_id: 1 },
      });
      await prisma.venda.deleteMany({
        where: { id: { in: vendaIds }, tenant_id: 1 },
      });
    }
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
