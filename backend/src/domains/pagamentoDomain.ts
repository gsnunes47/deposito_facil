import prisma from '../repositories/db.js';
import type { FormaPagamento, Pagamento } from '@prisma/client';
import vendaDomain from './vendaDomain.js';

interface pagamentoInterface {
  id: number;
  tenant_id: number;
  venda_id: number;
  valor: number;
  forma_pagamento: FormaPagamento;
}

type ResultadoQuitacaoVendas =
  | {
      code: 200;
      message: string;
      quantidade: number;
      valor_total: number;
    }
  | {
      code: 400;
      message: string;
    };

class PagamentoDomain {
  async createPagamento(
    venda_id: number,
    tenant_id: number,
    forma_pagamento: FormaPagamento,
    valor: number,
  ) {
    try {
      let vendaDestino = await vendaDomain.getVendaPagamentos(venda_id, tenant_id);
      
      if (!vendaDestino || vendaDestino.pago === true || vendaDestino.debito == undefined) {
        return {
          code: 400,
          message: 'Impossível adicionar um pagamento para esta venda',
        };
      }

      const debito = vendaDestino.debito - valor;
      
      if (debito < 0) {
        return {
          code: 400,
          message:
            'O pagamento deve ser igual ou menor que o valor total da venda',
        };
      } else if (debito > 0) {
        const pagamento = await prisma.pagamento.create({
          data: {
            venda_id: venda_id,
            tenant_id: tenant_id,
            forma_pagamento: forma_pagamento,
            valor: valor,
          },
        });

        return {
          code: 200,
          message: 'Pagamento created successfully',
          pagamento_id: pagamento.id,
        };
      } else if (debito === 0) {
        const pagamento = await prisma.pagamento.create({
          data: {
            venda_id: venda_id,
            tenant_id: tenant_id,
            forma_pagamento: forma_pagamento,
            valor: valor,
          },
        });

        const vendaAtt = await vendaDomain.updateVenda(
          venda_id,
          tenant_id,
          true,
          new Date(),
        );

        return {
          code: 200,
          message: 'Pagamento created successfully',
          pagamento_id: pagamento.id,
          venda: `Venda ${vendaAtt.venda_id} fechada.`,
        };
      } else {
        return {
          code: 400,
          message: 'Error creating pagamento',
        };
      }
    } catch (error) {
      return {
        code: 400,
        message: 'Error creating pagamento',
        error: error,
      };
    }
  }

  async quitarVendas(
    vendaIds: number[],
    tenantId: number,
    formaPagamento: FormaPagamento,
  ): Promise<ResultadoQuitacaoVendas> {
    try {
      const idsUnicos = [...new Set(vendaIds)];

      const resultado = await prisma.$transaction(async (transaction) => {
        const vendas = await transaction.venda.findMany({
          where: {
            id: { in: idsUnicos },
            tenant_id: tenantId,
            pago: false,
          },
          include: {
            pagamentos: true,
          },
        });

        if (vendas.length !== idsUnicos.length) {
          throw new Error(
            'Uma ou mais vendas não existem, já foram pagas ou não pertencem a este tenant.',
          );
        }

        const dataQuitacao = new Date();
        let valorTotal = 0;

        for (const venda of vendas) {
          const totalPago = venda.pagamentos.reduce(
            (total, pagamento) => total + Number(pagamento.valor ?? 0),
            0,
          );
          const debito = venda.total - totalPago;

          if (debito <= 0) {
            throw new Error(`A venda ${venda.id} não possui débito em aberto.`);
          }

          await transaction.pagamento.create({
            data: {
              venda_id: venda.id,
              tenant_id: tenantId,
              forma_pagamento: formaPagamento,
              valor: debito,
            },
          });

          await transaction.venda.update({
            where: {
              id: venda.id,
              tenant_id: tenantId,
            },
            data: {
              pago: true,
              data_quitacao: dataQuitacao,
            },
          });

          valorTotal += debito;
        }

        return {
          quantidade: vendas.length,
          valor_total: valorTotal,
        };
      });

      return {
        code: 200,
        message:
          resultado.quantidade === 1
            ? 'Venda quitada com sucesso'
            : `${resultado.quantidade} vendas quitadas com sucesso`,
        ...resultado,
      };
    } catch (error) {
      return {
        code: 400,
        message:
          error instanceof Error
            ? error.message
            : 'Não foi possível quitar as vendas',
      };
    }
  }

  private async getPagamentoById(pagamentoId: number, tenantId: number) {
    const pagamento = await prisma.pagamento.findFirst({
      where: {
        id: pagamentoId,
        tenant_id: tenantId,
      },
    });

    return pagamento;
  }

  async deletePagamento(pagamentoId: number, tenantId: number) {
    const pagamento = await this.getPagamentoById(pagamentoId, tenantId);

    if (!pagamento) {
      return {
        code: 400,
        message: 'Pagamento não encontrado',
      };
    }

    const delPagamento = await prisma.pagamento.delete({
      where: {
        id: pagamentoId,
        tenant_id: tenantId,
      },
    });

    return {
      code: 200,
      message: `Pagamento ${delPagamento.id}} deletado com sucesso`,
    };
  }
}

export default new PagamentoDomain();
