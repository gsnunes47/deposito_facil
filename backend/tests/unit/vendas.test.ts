import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest';
import vendaDomain from '../../src/domains/vendaDomain.js';
import clienteDomain from '../../src/domains/clienteDomain.js';
import produtoDomain from '../../src/domains/produtoDomain.js';
import prisma from '../../src/repositories/db.js';

let vendaId: number = 0;
let cliente: any;
let produto1: any;
let produto2: any;

beforeAll(async () => {
  cliente = await clienteDomain.createCliente('Cliente Teste', 1);

  produto1 = await produtoDomain.createProduto('Produto Teste 1', 1);

  produto2 = await produtoDomain.createProduto('Produto Teste 2', 1);
});

afterEach(async () => {
  if (vendaId !== 0) {
    await vendaDomain.deleteVenda(vendaId, 1);
  }

  vendaId = 0;
});

afterAll(async () => {
  await prisma.cliente.deleteMany({
    where: {
      id: cliente.cliente_id,
      tenant_id: 1,
    },
  });

  await prisma.produto.deleteMany({
    where: {
      id: produto1.produto_id,
      tenant_id: 1,
    },
  });

  await prisma.produto.deleteMany({
    where: {
      id: produto2.produto_id,
      tenant_id: 1,
    },
  });
});

describe('Venda Domain', () => {
  it('deve criar uma venda', async () => {
    const vendaNovo = await vendaDomain.createVenda(
      cliente.cliente_id,
      [
        {
          id: produto1.produto_id,
          quantidade: 2,
          valor_unitario: 1000,
        },
        {
          id: produto2.produto_id,
          quantidade: 3,
          valor_unitario: 1500,
        },
      ],
      1,
    );

    vendaId = vendaNovo.venda_id as number;

    expect(vendaNovo.code).toBe(200);
  });

  it('ao criar uma venda deve deduzir a quantidade do produto', async () => {
    const produto1PreVenda = await produtoDomain.getProdutoById(
      produto1.produto_id,
      1,
    );


    if (!produto1PreVenda?.quantidade) {
      throw Error;
    }

    const vendaNovo = await vendaDomain.createVenda(
      cliente.cliente_id,
      [
        {
          id: produto1.produto_id,
          quantidade: 2,
          valor_unitario: 1000,
        },
        {
          id: produto2.produto_id,
          quantidade: 3,
          valor_unitario: 1500,
        },
      ],
      1,
    );

    vendaId = vendaNovo.venda_id as number;

    const produto1PosVenda = await produtoDomain.getProdutoById(
      produto1.produto_id,
      1,
    );

    if (!produto1PosVenda) {
      throw Error;
    }

    expect(produto1PosVenda.quantidade).toBe(produto1PreVenda.quantidade - 2); //passou por 2 vendas
  });

  // it('deve fechar uma venda', async () => {

  //     const vendaNovo = await vendaDomain.createVenda(
  //         cliente.id,
  //         [
  //             {
  //                 produto_id: produto1.id,
  //                 quantidade: 2,
  //                 valor_unitario: 1000
  //             },
  //             {
  //                 produto_id: produto2.id,
  //                 quantidade: 3,
  //                 valor_unitario: 1500
  //             },
  //         ],
  //         1
  //     )

  //     vendaId = vendaNovo.venda_id as number

  //     const vendaFechada = await vendaDomain.updateVenda(
  //         vendaNovo.venda_id as number,
  //         1,
  //         true,
  //         new Date()
  //     )

  //     if (!vendaFechada.venda) {
  //         throw new Error('Venda não foi atualizada')
  //     }

  //     expect(vendaFechada.venda.pago).toBe(true)
  // })
});
