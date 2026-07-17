import { describe, expect, it } from 'vitest';
import relatorioDomain from '../../src/domains/relatorioDomain.js';

const periodoCompleto = {
  inicio: new Date('1970-01-01T00:00:00.000Z'),
  fimExclusivo: new Date('2100-01-01T00:00:00.000Z'),
};

describe('Relatorio Domain', () => {
  it('deve calcular contas abertas e seus saldos', async () => {
    const resultado = await relatorioDomain.getContasAbertas(
      1,
      periodoCompleto,
    );

    expect(resultado.resumo.quantidade).toBe(resultado.registros.length);
    expect(resultado.resumo.saldo).toBe(
      resultado.resumo.total - resultado.resumo.total_pago,
    );
  });

  it('deve calcular o resultado líquido do período', async () => {
    const resultado = await relatorioDomain.getLucro(1, periodoCompleto);

    expect(resultado.lucro_liquido).toBe(
      resultado.total_vendas_faturadas -
        resultado.total_despesas -
        resultado.total_encomendas,
    );
  });

  it('deve separar vendas faturadas e abertas', async () => {
    const resultado = await relatorioDomain.getResumoVendas(1, periodoCompleto);

    expect(resultado.total_vendas).toBe(
      resultado.total_faturado + resultado.total_nao_faturado,
    );
    expect(resultado.quantidade_vendas).toBe(
      resultado.quantidade_faturadas + resultado.quantidade_abertas,
    );
  });

  it('deve agrupar recebimentos por forma de pagamento', async () => {
    const resultado = await relatorioDomain.getFormasPagamento(
      1,
      periodoCompleto,
    );

    expect(resultado.resumo.quantidade).toBe(
      resultado.registros.reduce(
        (total, registro) => total + registro.quantidade,
        0,
      ),
    );
    expect(resultado.resumo.total).toBe(
      resultado.registros.reduce(
        (total, registro) => total + registro.total,
        0,
      ),
    );
  });
});
