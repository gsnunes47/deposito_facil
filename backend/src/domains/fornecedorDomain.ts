import prisma from '../repositories/db.js';

interface fornecedorInterface {
  id: number;
  nome: string;
  documento: string | null;
  tenant_id: number;
}

class FornecedorDomain {
  async createFornecedor(
    nome: string,
    tenant_id: number,
    documento?: string | null,
  ) {
    try {
      const fornecedor = await prisma.fornecedor.create({
        data: {
          nome,
          documento: documento ?? '',
          tenant_id,
        },
      });

      return {
        code: 200,
        message: 'Fornecedor created successfully',
        fornecedor_id: fornecedor.id,
      };
    } catch (error) {
      return {
        code: 400,
        message: 'Error creating fornecedor',
        error,
      };
    }
  }

  async getFornecedores(tenantId: number) {
    const fornecedores = await prisma.fornecedor.findMany({
      where: {
        tenant_id: tenantId,
      },
      select: {
        id: true,
        nome: true,
        documento: true,
      },
    });

    return fornecedores;
  }

  async getFornecedorById(fornecedorId: number, tenantId: number) {
    const fornecedor = await prisma.fornecedor.findFirst({
      where: {
        id: fornecedorId,
        tenant_id: tenantId,
      },
    });

    return fornecedor;
  }

  async deleteFornecedor(fornecedorId: number, tenantId: number) {
    const fornecedor = await this.getFornecedorById(fornecedorId, tenantId);

    if (!fornecedor) {
      return {
        code: 400,
        message: 'Fornecedor não encontrado',
      };
    }

    const delFornecedor = await prisma.fornecedor.delete({
      where: {
        id: fornecedorId,
        tenant_id: tenantId,
      },
    });

    return {
      code: 200,
      message: `Fornecedor ${delFornecedor.id} - ${delFornecedor.nome} deletado com sucesso`,
    };
  }

  async updateFornecedor(fornecedor: fornecedorInterface) {
    const existingFornecedor = await this.getFornecedorById(
      fornecedor.id,
      fornecedor.tenant_id,
    );

    if (!existingFornecedor) {
      return {
        code: 400,
        message: 'Fornecedor não encontrado',
      };
    }

    const updatedFornecedor = await prisma.fornecedor.update({
      where: {
        id: fornecedor.id,
        tenant_id: fornecedor.tenant_id,
      },
      data: {
        nome: fornecedor.nome,
        documento: fornecedor.documento,
      },
    });

    return {
      code: 200,
      message: 'Fornecedor atualizado com sucesso',
      fornecedor: updatedFornecedor as fornecedorInterface,
    };
  }
}

export default new FornecedorDomain();
export type { fornecedorInterface };
