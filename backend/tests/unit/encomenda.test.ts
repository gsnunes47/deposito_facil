import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest';
import encomendaDomain from '../../src/domains/encomendaDomain.js';
import fornecedorDomain from '../../src/domains/fornecedorDomain.js';
import produtoDomain from '../../src/domains/produtoDomain.js';
import prisma from '../../src/repositories/db.js';

let encomendaId = 0;
let fornecedor: any;
let produto1: any;
let produto2: any;
const fornecedoresCriadosNaEntrada: number[] = [];

beforeAll(async () => {
  fornecedor = await fornecedorDomain.createFornecedor(
    'Fornecedor Teste',
    1,
    '12345678900',
  );

  produto1 = await produtoDomain.createProduto('Produto Teste 1', 1);

  produto2 = await produtoDomain.createProduto('Produto Teste 2', 1);
});

afterEach(async () => {
  if (encomendaId !== 0) {
    await encomendaDomain.deleteEncomenda(encomendaId, 1);
  }

  encomendaId = 0;

  if (fornecedoresCriadosNaEntrada.length > 0) {
    await prisma.fornecedor.deleteMany({
      where: {
        id: { in: fornecedoresCriadosNaEntrada.splice(0) },
        tenant_id: 1,
      },
    });
  }
});

afterAll(async () => {
  await prisma.fornecedor.deleteMany({
    where: {
      id: fornecedor.fornecedor_id,
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

describe('Encomenda Domain', () => {
  it('deve criar uma encomenda', async () => {
    const encomendaNova = await encomendaDomain.createEncomenda(
      fornecedor.fornecedor_id,
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

    encomendaId = encomendaNova.encomenda_id as number;

    expect(encomendaNova.code).toBe(200);
  });

  it('ao criar uma encomenda deve aumentar a quantidade do produto', async () => {
    const produto1PreEncomenda = await produtoDomain.getProdutoById(
      produto1.produto_id,
      1,
    );

    if (!produto1PreEncomenda?.quantidade) {
      throw Error;
    }

    const encomendaNova = await encomendaDomain.createEncomenda(
      fornecedor.fornecedor_id,
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

    encomendaId = encomendaNova.encomenda_id as number;

    const produto1PosEncomenda = await produtoDomain.getProdutoById(
      produto1.produto_id,
      1,
    );

    if (!produto1PosEncomenda) {
      throw Error;
    }

    expect(produto1PosEncomenda.quantidade).toBe(
      produto1PreEncomenda.quantidade + 2,
    );
  });

  it('não deve duplicar um fornecedor existente', async () => {
    const quantidadeAntes = await prisma.fornecedor.count({
      where: { tenant_id: 1 },
    });

    const encomendaNova = await encomendaDomain.createEncomenda(
      { fornecedor_id: fornecedor.fornecedor_id },
      [{ id: produto1.produto_id, quantidade: 1, valor_unitario: 1000 }],
      1,
    );
    encomendaId = encomendaNova.encomenda_id as number;

    expect(encomendaNova.code).toBe(200);
    expect(await prisma.fornecedor.count({ where: { tenant_id: 1 } })).toBe(
      quantidadeAntes,
    );
  });

  it('deve criar fornecedor junto com a encomenda', async () => {
    const nome = `Fornecedor criado na entrada ${Date.now()}`;
    const encomendaNova = await encomendaDomain.createEncomenda(
      { fornecedor_nome: nome },
      [{ id: produto1.produto_id, quantidade: 1, valor_unitario: 1000 }],
      1,
    );
    encomendaId = encomendaNova.encomenda_id as number;

    const fornecedorCriado = await prisma.fornecedor.findFirst({
      where: { nome, tenant_id: 1 },
    });
    if (fornecedorCriado) {
      fornecedoresCriadosNaEntrada.push(fornecedorCriado.id);
    }

    expect(encomendaNova.code).toBe(200);
    expect(fornecedorCriado?.documento).toBeNull();
  });

  it('deve desfazer fornecedor e estoque quando a encomenda falhar', async () => {
    const nome = `Fornecedor rollback ${Date.now()}`;
    const estoqueAntes = await produtoDomain.getProdutoById(
      produto1.produto_id,
      1,
    );

    const encomendaNova = await encomendaDomain.createEncomenda(
      { fornecedor_nome: nome },
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

    expect(encomendaNova.code).toBe(400);
    expect(
      await prisma.fornecedor.findFirst({ where: { nome, tenant_id: 1 } }),
    ).toBeNull();
    expect(estoqueDepois?.quantidade).toBe(estoqueAntes?.quantidade);
  });

  it('deve rejeitar serviço na entrada', async () => {
    const servico = await produtoDomain.createProduto(
      `Serviço entrada ${Date.now()}`,
      1,
      'SERVICO',
    );
    const servicoId = servico.produto_id as number;

    const encomendaNova = await encomendaDomain.createEncomenda(
      fornecedor.fornecedor_id,
      [{ id: servicoId, quantidade: 1, valor_unitario: 1000 }],
      1,
    );

    expect(encomendaNova.code).toBe(400);
    await prisma.produto.delete({ where: { id: servicoId } });
  });
});
