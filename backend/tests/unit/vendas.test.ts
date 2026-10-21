import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest';
import vendaDomain from '../../src/domains/vendaDomain.js';
import clienteDomain from '../../src/domains/clienteDomain.js';
import produtoDomain from '../../src/domains/produtoDomain.js';
import prisma from '../../src/repositories/db.js';

let vendaId: number = 0;
let cliente: any;
let produto1: any;
let produto2: any;
const clientesCriadosNaVenda: number[] = [];

beforeAll(async () => {
  cliente = await clienteDomain.createCliente('Cliente Teste', 1);

  produto1 = await produtoDomain.createProduto('Produto Teste 1', 1);

  produto2 = await produtoDomain.createProduto('Produto Teste 2', 1);

  await produtoDomain.updateProduto({
    id: produto1.produto_id,
    tenant_id: 1,
    quantidade: 10,
  });
  await produtoDomain.updateProduto({
    id: produto2.produto_id,
    tenant_id: 1,
    quantidade: 10,
  });
});

afterEach(async () => {
  if (vendaId !== 0) {
    await vendaDomain.deleteVenda(vendaId, 1);
  }

  vendaId = 0;

  if (clientesCriadosNaVenda.length > 0) {
    await prisma.cliente.deleteMany({
      where: { id: { in: clientesCriadosNaVenda.splice(0) }, tenant_id: 1 },
    });
  }
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

  it('não deve duplicar um cliente existente', async () => {
    const quantidadeAntes = await prisma.cliente.count({
      where: { tenant_id: 1 },
    });

    const vendaNova = await vendaDomain.createVenda(
      { cliente_id: cliente.cliente_id },
      [{ id: produto1.produto_id, quantidade: 1, valor_unitario: 1000 }],
      1,
    );
    vendaId = vendaNova.venda_id as number;

    expect(vendaNova.code).toBe(200);
    expect(await prisma.cliente.count({ where: { tenant_id: 1 } })).toBe(
      quantidadeAntes,
    );
  });

  it('deve criar cliente e venda na mesma operação', async () => {
    const nome = `Cliente criado na venda ${Date.now()}`;
    const vendaNova = await vendaDomain.createVenda(
      { cliente_nome: nome },
      [{ id: produto1.produto_id, quantidade: 1, valor_unitario: 1000 }],
      1,
    );
    vendaId = vendaNova.venda_id as number;

    const clienteCriado = await prisma.cliente.findFirst({
      where: { nome, tenant_id: 1 },
    });
    if (clienteCriado) clientesCriadosNaVenda.push(clienteCriado.id);

    expect(vendaNova.code).toBe(200);
    expect(clienteCriado?.documento).toBeNull();
  });

  it('deve desfazer o cliente novo quando a venda falhar', async () => {
    const nome = `Cliente rollback ${Date.now()}`;
    const estoqueAntes = await produtoDomain.getProdutoById(
      produto1.produto_id,
      1,
    );
    const vendaNova = await vendaDomain.createVenda(
      { cliente_nome: nome },
      [
        { id: produto1.produto_id, quantidade: 1, valor_unitario: 1000 },
        { id: 999999, quantidade: 1, valor_unitario: 1000 },
      ],
      1,
    );
    const estoqueDepois = await produtoDomain.getProdutoById(
      produto1.produto_id,
      1,
    );

    expect(vendaNova.code).toBe(400);
    expect(
      await prisma.cliente.findFirst({ where: { nome, tenant_id: 1 } }),
    ).toBeNull();
    expect(estoqueDepois?.quantidade).toBe(estoqueAntes?.quantidade);
  });

  it('deve vender produto e serviço juntos sem movimentar o serviço', async () => {
    const servico = await produtoDomain.createProduto(
      `Serviço venda ${Date.now()}`,
      1,
      'SERVICO',
    );
    const servicoId = servico.produto_id as number;
    const quantidadeAntes = (await produtoDomain.getProdutoById(servicoId, 1))
      ?.quantidade;
    const estoqueProdutoAntes = await produtoDomain.getProdutoById(
      produto1.produto_id,
      1,
    );

    const vendaNova = await vendaDomain.createVenda(
      cliente.cliente_id,
      [
        { id: produto1.produto_id, quantidade: 1, valor_unitario: 1000 },
        { id: servicoId, quantidade: 2, valor_unitario: 1500 },
      ],
      1,
    );
    vendaId = vendaNova.venda_id as number;
    const quantidadeDepois = (await produtoDomain.getProdutoById(servicoId, 1))
      ?.quantidade;
    const estoqueProdutoDepois = await produtoDomain.getProdutoById(
      produto1.produto_id,
      1,
    );

    expect(vendaNova.code).toBe(200);
    expect(quantidadeDepois).toBe(quantidadeAntes);
    expect(estoqueProdutoDepois?.quantidade).toBe(
      Number(estoqueProdutoAntes?.quantidade) - 1,
    );
    await prisma.produto.delete({ where: { id: servicoId } });
  });

  it('deve criar a venda quitada com pagamento total', async () => {
    const vendaNova = await vendaDomain.createVenda(
      cliente.cliente_id,
      [{ id: produto1.produto_id, quantidade: 1, valor_unitario: 1000 }],
      1,
      undefined,
      { forma_pagamento: 'PIX', quitar: true },
    );
    vendaId = vendaNova.venda_id as number;

    const venda = await prisma.venda.findFirst({
      where: { id: vendaId, tenant_id: 1 },
      include: { pagamentos: true },
    });

    expect(vendaNova.code).toBe(200);
    expect(venda?.pago).toBe(true);
    expect(venda?.pagamentos).toHaveLength(1);
    expect(venda?.pagamentos[0]?.valor).toBe(1000);
    expect(venda?.pagamentos[0]?.forma_pagamento).toBe('PIX');
  });

  it('deve manter saldo aberto com pagamento parcial', async () => {
    const vendaNova = await vendaDomain.createVenda(
      cliente.cliente_id,
      [{ id: produto1.produto_id, quantidade: 1, valor_unitario: 1000 }],
      1,
      undefined,
      { forma_pagamento: 'DINHEIRO', valor: 500 },
    );
    vendaId = vendaNova.venda_id as number;

    const venda = await prisma.venda.findFirst({
      where: { id: vendaId, tenant_id: 1 },
      include: { pagamentos: true },
    });

    expect(vendaNova.code).toBe(200);
    expect(venda?.pago).toBe(false);
    expect(venda?.pagamentos[0]?.valor).toBe(500);
  });

  it('deve desfazer a venda quando o pagamento inicial exceder o total', async () => {
    const nome = `Cliente pagamento rollback ${Date.now()}`;
    const estoqueAntes = await produtoDomain.getProdutoById(
      produto1.produto_id,
      1,
    );

    const vendaNova = await vendaDomain.createVenda(
      { cliente_nome: nome },
      [{ id: produto1.produto_id, quantidade: 1, valor_unitario: 1000 }],
      1,
      undefined,
      { forma_pagamento: 'CARTAO_DEBITO', valor: 1500 },
    );
    const estoqueDepois = await produtoDomain.getProdutoById(
      produto1.produto_id,
      1,
    );

    expect(vendaNova.code).toBe(400);
    expect(
      await prisma.cliente.findFirst({ where: { nome, tenant_id: 1 } }),
    ).toBeNull();
    expect(estoqueDepois?.quantidade).toBe(estoqueAntes?.quantidade);
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
