import prisma from '../repositories/db.js';

export const TIPOS_DESPESA_INICIAIS = ['Salário', 'Manutenção', 'Imprevisto'];

class TipoDespesaDomain {
  async inicializar(tenantId: number, transaction = prisma) {
    await transaction.tipoDespesa.createMany({
      data: TIPOS_DESPESA_INICIAIS.map((nome) => ({
        nome,
        tenant_id: tenantId,
      })),
      skipDuplicates: true,
    });
  }

  async createTipoDespesa(nome: string, tenantId: number) {
    try {
      const tipo = await prisma.tipoDespesa.create({
        data: { nome: nome.trim(), tenant_id: tenantId },
        select: { id: true, nome: true },
      });
      return { code: 201, message: 'Tipo de despesa criado com sucesso', tipo };
    } catch (_error) {
      return {
        code: 400,
        message:
          'Não foi possível criar o tipo de despesa. Verifique se o nome já existe.',
      };
    }
  }

  async getTiposDespesa(tenantId: number) {
    return prisma.tipoDespesa.findMany({
      where: { tenant_id: tenantId },
      select: { id: true, nome: true },
      orderBy: { nome: 'asc' },
    });
  }

  async updateTipoDespesa(id: number, nome: string, tenantId: number) {
    const existente = await prisma.tipoDespesa.findFirst({
      where: { id, tenant_id: tenantId },
    });
    if (!existente)
      return { code: 404, message: 'Tipo de despesa não encontrado' };

    try {
      const tipo = await prisma.tipoDespesa.update({
        where: { id },
        data: { nome: nome.trim() },
        select: { id: true, nome: true },
      });
      return {
        code: 200,
        message: 'Tipo de despesa atualizado com sucesso',
        tipo,
      };
    } catch (_error) {
      return {
        code: 400,
        message:
          'Não foi possível atualizar o tipo de despesa. Verifique se o nome já existe.',
      };
    }
  }

  async deleteTipoDespesa(id: number, tenantId: number) {
    const existente = await prisma.tipoDespesa.findFirst({
      where: { id, tenant_id: tenantId },
    });
    if (!existente)
      return { code: 404, message: 'Tipo de despesa não encontrado' };

    await prisma.tipoDespesa.delete({ where: { id } });
    return {
      code: 200,
      message:
        'Tipo de despesa excluído; despesas existentes foram preservadas sem tipo.',
    };
  }
}

export default new TipoDespesaDomain();
