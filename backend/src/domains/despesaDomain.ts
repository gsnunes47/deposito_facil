import prisma from '../repositories/db.js';

interface despesaInterface {
  id: number;
  tenant_id: number;
  descricao: string;
  valor: number;
  data: Date;
  tipo_id?: number | null;
}

class DespesaDomain {
  async createDespesa(
    valor: number,
    descricao: string,
    tenant_id: number,
    data: Date = new Date(),
    tipo_id: number | null = null,
  ) {
    try {
      if (tipo_id !== null) {
        const tipo = await prisma.tipoDespesa.findFirst({
          where: { id: tipo_id, tenant_id },
        });
        if (!tipo) {
          return { code: 400, message: 'Tipo de despesa não encontrado' };
        }
      }

      const despesa = await prisma.despesa.create({
        data: {
          tenant_id: tenant_id,
          descricao: descricao,
          valor: valor,
          data,
          tipo_id,
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
        descricao: true,
        valor: true,
        data: true,
        tipo_id: true,
        tipo: {
          select: { id: true, nome: true },
        },
      },
      orderBy: {
        data: 'desc',
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

    if (despesa.tipo_id != null) {
      const tipo = await prisma.tipoDespesa.findFirst({
        where: { id: despesa.tipo_id, tenant_id: despesa.tenant_id },
      });
      if (!tipo) {
        return { code: 400, message: 'Tipo de despesa não encontrado' };
      }
    }

    const updatedDespesa = await prisma.despesa.update({
      where: {
        id: despesa.id,
        tenant_id: despesa.tenant_id,
      },
      data: {
        descricao: despesa.descricao,
        valor: despesa.valor,
        data: despesa.data,
        ...(despesa.tipo_id !== undefined && { tipo_id: despesa.tipo_id }),
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
