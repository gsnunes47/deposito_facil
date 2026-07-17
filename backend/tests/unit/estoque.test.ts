import { describe, expect, it } from 'vitest';
import estoqueDomain from '../../src/domains/estoqueDomain.js';

describe('Estoque Domain', () => {
  it('deve retornar saldo, resumo e últimas movimentações', async () => {
    const estoque = await estoqueDomain.getVisaoEstoque(1);

    expect(estoque.resumo.produtos_cadastrados).toBe(estoque.produtos.length);
    expect(estoque.resumo.total_unidades).toBe(
      estoque.produtos.reduce(
        (total, produto) => total + produto.quantidade,
        0,
      ),
    );
    expect(estoque.resumo.produtos_esgotados).toBe(
      estoque.produtos.filter((produto) => produto.quantidade <= 0).length,
    );
    expect(estoque.entradas.length).toBeLessThanOrEqual(10);
    expect(estoque.saidas.length).toBeLessThanOrEqual(10);

    for (const movimentacao of [...estoque.entradas, ...estoque.saidas]) {
      for (const item of movimentacao.itens) {
        expect(item.total_item).toBe(item.quantidade * item.valor_unitario);
      }
    }
  });
});
