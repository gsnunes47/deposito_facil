import prisma from '../repositories/db.js';
import type { FormaPagamento } from '@prisma/client';
import encomendaDomain from './encomendaDomain.js';

class PagamentoEncomendaDomain {
  async createPagamentoEncomenda(
    encomenda_id: number,
    tenant_id: number,
    forma_pagamento: FormaPagamento,
    valor: number,
  ) {
    try {
      const encomendaDestino = await encomendaDomain.getEncomendaPagamentos(
        encomenda_id,
        tenant_id,
      );

      if (
        !encomendaDestino ||
        encomendaDestino.pago === true ||
        encomendaDestino.debito == undefined
      ) {
        return {
          code: 400,
          message: 'Impossível adicionar um pagamento para esta encomenda',
        };
      }

      const debito = encomendaDestino.debito - valor;

      if (debito < 0) {
        return {
          code: 400,
          message:
            'O pagamento deve ser igual ou menor que o valor total da encomenda',
        };
      }

      const pagamento = await prisma.pagamentoEncomenda.create({
        data: {
          encomenda_id,
          tenant_id,
          forma_pagamento,
          valor,
        },
      });

      if (debito === 0) {
        const encomendaAtt = await encomendaDomain.updateEncomenda(
          encomenda_id,
          tenant_id,
          true,
          new Date(),
        );

        return {
          code: 200,
          message: 'Pagamento criado com sucesso',
          pagamento_id: pagamento.id,
          encomenda: `Encomenda ${encomendaAtt.encomenda_id} fechada.`,
        };
      }

      return {
        code: 200,
        message: 'Pagamento criado com sucesso',
        pagamento_id: pagamento.id,
      };
    } catch (error) {
      return {
        code: 400,
        message: 'Error creating pagamento',
        error,
      };
    }
  }

  private async getPagamentoEncomendaById(
    pagamentoId: number,
    tenantId: number,
  ) {
    return prisma.pagamentoEncomenda.findFirst({
      where: {
        id: pagamentoId,
        tenant_id: tenantId,
      },
    });
  }

  async deletePagamentoEncomenda(pagamentoId: number, tenantId: number) {
    const pagamento = await this.getPagamentoEncomendaById(
      pagamentoId,
      tenantId,
    );

    if (!pagamento) {
      return {
        code: 400,
        message: 'Pagamento não encontrado',
      };
    }

    const delPagamento = await prisma.pagamentoEncomenda.delete({
      where: {
        id: pagamentoId,
        tenant_id: tenantId,
      },
    });

    return {
      code: 200,
      message: `Pagamento ${delPagamento.id} deletado com sucesso`,
    };
  }
}

export default new PagamentoEncomendaDomain();
