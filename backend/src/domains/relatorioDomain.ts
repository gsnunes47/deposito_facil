import prisma from '../repositories/db.js';

interface PeriodoRelatorio {
  inicio: Date;
  fimExclusivo: Date;
}

function intervaloData(periodo: PeriodoRelatorio) {
  return {
    gte: periodo.inicio,
    lt: periodo.fimExclusivo,
  };
}

class RelatorioDomain {
  async getContasAbertas(
    tenantId: number,
    periodo: PeriodoRelatorio,
    clienteId?: number,
  ) {
    const vendas = await prisma.venda.findMany({
      where: {
        tenant_id: tenantId,
        pago: false,
        data: intervaloData(periodo),
        ...(clienteId && { cliente_id: clienteId }),
      },
      select: {
        id: true,
        data: true,
        total: true,
        cliente: {
          select: {
            id: true,
            nome: true,
          },
        },
        pagamentos: {
          select: {
            valor: true,
          },
        },
      },
      orderBy: {
        data: 'asc',
      },
    });

    const registros = vendas.map((venda) => {
      const totalPago = venda.pagamentos.reduce(
        (total, pagamento) => total + Number(pagamento.valor ?? 0),
        0,
      );

      return {
        venda_id: venda.id,
        data: venda.data,
        cliente_id: venda.cliente.id,
        cliente: venda.cliente.nome ?? `Cliente #${venda.cliente.id}`,
        total: venda.total,
        total_pago: totalPago,
        saldo: venda.total - totalPago,
      };
    });

    return {
      resumo: {
        quantidade: registros.length,
        total: registros.reduce((soma, registro) => soma + registro.total, 0),
        total_pago: registros.reduce(
          (soma, registro) => soma + registro.total_pago,
          0,
        ),
        saldo: registros.reduce((soma, registro) => soma + registro.saldo, 0),
      },
      registros,
    };
  }

  async getLucro(tenantId: number, periodo: PeriodoRelatorio) {
    const data = intervaloData(periodo);
    const [vendas, despesas, encomendas] = await Promise.all([
      prisma.venda.aggregate({
        where: {
          tenant_id: tenantId,
          pago: true,
          data,
        },
        _sum: {
          total: true,
        },
      }),
      prisma.despesa.aggregate({
        where: {
          tenant_id: tenantId,
          data,
        },
        _sum: {
          valor: true,
        },
      }),
      prisma.encomenda.aggregate({
        where: {
          tenant_id: tenantId,
          data,
        },
        _sum: {
          total: true,
        },
      }),
    ]);

    const totalVendas = vendas._sum.total ?? 0;
    const totalDespesas = despesas._sum.valor ?? 0;
    const totalEncomendas = encomendas._sum.total ?? 0;

    return {
      total_vendas_faturadas: totalVendas,
      total_despesas: totalDespesas,
      total_encomendas: totalEncomendas,
      lucro_liquido: totalVendas - totalDespesas - totalEncomendas,
    };
  }

  async getResumoVendas(tenantId: number, periodo: PeriodoRelatorio) {
    const data = intervaloData(periodo);
    const [todas, faturadas, abertas] = await Promise.all([
      prisma.venda.aggregate({
        where: {
          tenant_id: tenantId,
          data,
        },
        _sum: { total: true },
        _count: true,
      }),
      prisma.venda.aggregate({
        where: {
          tenant_id: tenantId,
          pago: true,
          data,
        },
        _sum: { total: true },
        _count: true,
      }),
      prisma.venda.aggregate({
        where: {
          tenant_id: tenantId,
          pago: false,
          data,
        },
        _sum: { total: true },
        _count: true,
      }),
    ]);

    return {
      total_vendas: todas._sum.total ?? 0,
      quantidade_vendas: todas._count,
      total_faturado: faturadas._sum.total ?? 0,
      quantidade_faturadas: faturadas._count,
      total_nao_faturado: abertas._sum.total ?? 0,
      quantidade_abertas: abertas._count,
    };
  }

  async getFormasPagamento(
    tenantId: number,
    periodo: PeriodoRelatorio,
    formaPagamento?: string,
  ) {
    const pagamentos = await prisma.pagamento.groupBy({
      by: ['forma_pagamento'],
      where: {
        tenant_id: tenantId,
        data_pagamento: intervaloData(periodo),
        ...(formaPagamento && {
          forma_pagamento: formaPagamento as
            | 'DINHEIRO'
            | 'PIX'
            | 'CARTAO_CREDITO'
            | 'CARTAO_DEBITO',
        }),
      },
      _sum: {
        valor: true,
      },
      _count: true,
      orderBy: {
        forma_pagamento: 'asc',
      },
    });

    const registros = pagamentos.map((pagamento) => ({
      forma_pagamento: pagamento.forma_pagamento,
      quantidade: pagamento._count,
      total: pagamento._sum.valor ?? 0,
    }));

    return {
      resumo: {
        quantidade: registros.reduce(
          (total, registro) => total + registro.quantidade,
          0,
        ),
        total: registros.reduce((total, registro) => total + registro.total, 0),
      },
      registros,
    };
  }
}

export default new RelatorioDomain();
export type { PeriodoRelatorio };
