import { describe, it, expect, afterEach } from 'vitest';
import produtoDomain from '../../src/domains/produtoDomain.js';
import prisma from '../../src/repositories/db.js';

let produtoId: number = 0;

afterEach(async () => {
  if (produtoId !== 0) {
    await prisma.produto.deleteMany({
      where: {
        id: produtoId,
        tenant_id: 1,
      },
    });
  }

  produtoId = 0;
});

describe('Produto Domain', () => {
  it('deve criar um produto', async () => {
    const produtoNovo = await produtoDomain.createProduto('Produto Teste', 1);

    produtoId = produtoNovo.produto_id as number;

    expect(produtoNovo.code).toBe(200);

    const produtoCriado = await produtoDomain.getProdutoById(produtoId, 1);
    expect(produtoCriado?.tipo).toBe('PRODUTO');
    expect(produtoCriado?.preco_padrao).toBeNull();
  });

  it('deve cadastrar preço padrão em centavos', async () => {
    const produtoNovo = await produtoDomain.createProduto(
      'Produto com preço',
      1,
      'PRODUTO',
      2590,
    );
    produtoId = produtoNovo.produto_id as number;

    const produtoCriado = await produtoDomain.getProdutoById(produtoId, 1);
    expect(produtoCriado?.preco_padrao).toBe(2590);
  });

  it('deve criar um serviço sem alterar o padrão dos produtos', async () => {
    const servicoNovo = await produtoDomain.createProduto(
      'Serviço Teste',
      1,
      'SERVICO',
    );
    produtoId = servicoNovo.produto_id as number;

    const servico = await produtoDomain.getProdutoById(produtoId, 1);
    expect(servico?.tipo).toBe('SERVICO');
  });

  it('deve apagar um produto', async () => {
    const produtoNovo = await produtoDomain.createProduto('Produto Teste', 1);

    const produtoDeletado = await produtoDomain.deleteProduto(
      produtoNovo.produto_id as number,
      1,
    );

    expect(produtoDeletado.code).toBe(200);
  });

  it('deve aumentar a quantidade de um produto', async () => {
    const produtoNovo = await produtoDomain.createProduto('Produto Teste', 1);

    const produtoAtualizado = await produtoDomain.updateProduto({
      tenant_id: 1,
      quantidade: 1,
      nome: 'Produto Teste att',
      id: produtoNovo.produto_id as number,
    });

    if (!produtoAtualizado.produto) {
      throw new Error('Produto não foi atualizado');
    }

    produtoId = produtoNovo.produto_id as number;

    expect(produtoAtualizado.produto.quantidade).toBe(1);
  });

  it('deve diminuir a quantidade de um produto', async () => {
    const produtoNovo = await produtoDomain.createProduto('Produto Teste', 1);

    const produtoAtualizado = await produtoDomain.updateProduto({
      tenant_id: 1,
      quantidade: -1,
      nome: 'Produto Teste att',
      id: produtoNovo.produto_id as number,
    });

    if (!produtoAtualizado.produto) {
      throw new Error('Produto não foi atualizado');
    }

    produtoId = produtoNovo.produto_id as number;

    expect(produtoAtualizado.produto.quantidade).toBe(-1);
  });

  it('deve retornar erro ao atualizar produto inexistente', async () => {
    const resultado = await produtoDomain.updateProduto({
      id: 999999,
      nome: 'Teste',
      quantidade: 1,
      tenant_id: 1,
    });

    expect(resultado.code).toBe(400);
  });

  it('deve retornar erro ao deletar produto inexistente', async () => {
    const resultado = await produtoDomain.deleteProduto(999999, 1);

    expect(resultado.code).toBe(400);
  });

  it('deve ler os dados de um produto sem expor seu global_id', async () => {
    const produtoNovo = await produtoDomain.createProduto('Produto Teste', 1);

    produtoId = produtoNovo.produto_id as number;

    const consultaProduto = await produtoDomain.getProdutos(1);

    expect('global_id' in consultaProduto[0]).toBe(false);
  });
});
