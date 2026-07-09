import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest';
import encomendaDomain from '../../src/domains/encomendaDomain.js';
import fornecedorDomain from '../../src/domains/fornecedorDomain.js';
import produtoDomain from '../../src/domains/produtoDomain.js';
import prisma from '../../src/repositories/db.js';

let encomendaId = 0;
let fornecedor: any;
let produto1: any;
let produto2: any;

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
});
