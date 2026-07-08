import prisma from '../repositories/db.js';
import { getNextTenantId } from '../helpers/globalIdHelper.js';

interface despesaInterface {
  id: number;
  tenant_id: number;
  descricao: string;
  valor: number;
}

class DespesaDomain {
  async createDespesa(valor: number, descricao: string, tenant_id: number) {
    try {
      const despesa = await prisma.despesa.create({
        data: {
          tenant_id: tenant_id,
          descricao: descricao,
          valor: valor,
        },
      });

      return {
        code: 200,
        message: 'Despesa created successfully',
        despesa_id: despesa.id,
      };
    } catch (error) {
      return {
        code: 400,
        message: 'Error creating despesa',
        error: error,
      };
    }
  }

  async getDespesas(tenantId: number) {
    const despesas = await prisma.despesa.findMany({
      where: {
        tenant_id: tenantId,
      },
      select: {
        id: true,
        nome: true,
        quantidade: true,
      },
    });

    return despesas;
  }

  async getDespesaById(despesaId: number, tenantId: number) {
    const despesa = await prisma.despesa.findFirst({
        where: {
        id: despesaId,
        tenant_id: tenantId,
      },
    });

    return despesa;
  }

  async deleteDespesa(despesaId: number, tenantId: number) {
    const despesa = await this.getDespesaById(despesaId, tenantId);

    if (!despesa) {
      return {
        code: 400,
        message: 'Despesa não encontrado',
      };
    }

    const delDespesa = await prisma.despesa.delete({
      where: {
        id: despesaId,
        tenant_id: tenantId,
      },
    });

    return {
      code: 200,
      message: `Despesa ${delDespesa.id} - ${delDespesa.descricao} deletado com sucesso`,
    };
  }

  async updateDespesa(despesa: despesaInterface) {
    const existingDespesa = await this.getDespesaById(
      despesa.id,
      despesa.tenant_id,
    );

    if (!existingDespesa) {
      return {
        code: 400,
        message: 'Despesa não encontrado',
      };
    }

    const updatedDespesa = await prisma.despesa.update({
      where: {
        id: despesa.id,
        tenant_id: despesa.tenant_id,
      },
      data: {
        descricao: despesa.descricao,
        valor: despesa.valor,
      },
    });

    return {
      code: 200,
      message: 'Despesa atualizado com sucesso',
      despesa: updatedDespesa as despesaInterface,
    };
  }
}

export default new DespesaDomain();
export type { despesaInterface };
