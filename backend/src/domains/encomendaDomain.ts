import prisma from '../repositories/db.js';
import produtoDomain from './produtoDomain.js';

class EncomendaDomain {
  async createEncomenda(
    fornecedor_id: number,
    produtos: any,
    tenant_id: number,
  ) {
    try {
      let total = 0;

      for (const produto of produtos) {
        total += produto.quantidade * produto.valor_unitario;

        const produtoDb = await produtoDomain.getProdutoById(
          produto.id,
          tenant_id,
        );

        if (!produtoDb) {
          return {
            code: 400,
            message: 'Error creating encomenda',
            error: 'Produto inexistente',
          };
        }

        await produtoDomain.updateProduto({
          id: produto.id,
          tenant_id,
          nome: produtoDb.nome as string,
          quantidade: (produtoDb.quantidade as number) + produto.quantidade,
        });
      }

      const encomenda = await prisma.encomenda.create({
        data: {
          fornecedor_id,
          tenant_id,
          produtos,
          total,
        },
      });

      return {
        code: 200,
        message: 'Encomenda created successfully',
        encomenda_id: encomenda.id,
      };
    } catch (error) {
      return {
        code: 400,
        message: 'Error creating encomenda',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getEncomendasAbertas(tenantId: number) {
    return prisma.encomenda.findMany({
      where: {
        tenant_id: tenantId,
        pago: false,
      },
      select: {
        id: true,
        tenant_id: true,
        fornecedor_id: true,
        produtos: true,
        total: true,
        data: true,
        data_quitacao: true,
        pago: true,
        pagamentos: true,
      },
    });
  }

  async getEncomendasFechadas(tenantId: number) {
    return prisma.encomenda.findMany({
      where: {
        tenant_id: tenantId,
        pago: true,
      },
      select: {
        id: true,
        tenant_id: true,
        fornecedor_id: true,
        produtos: true,
        total: true,
        data: true,
        data_quitacao: true,
        pago: true,
        pagamentos: true,
      },
    });
  }

  async getEncomendaPagamentos(encomenda_id: number, tenantId: number) {
    const encomenda = await prisma.encomenda.findUnique({
      where: {
        id: encomenda_id,
        tenant_id: tenantId,
      },
      select: {
        id: true,
        total: true,
        pago: true,
        pagamentos: true,
      },
    });

    if (!encomenda) {
      return {
        code: 400,
        message: 'Encomenda não encontrada',
      };
    }

    let debito = encomenda.total;

    for (const pagamento of encomenda.pagamentos) {
      debito -= Number(pagamento.valor);
    }

    return {
      id: encomenda.id,
      total: encomenda.total,
      debito,
      pago: encomenda.pago,
      pagamentos: encomenda.pagamentos,
    };
  }

  private async getEncomendaById(encomendaId: number, tenantId: number) {
    return prisma.encomenda.findFirst({
      where: {
        id: encomendaId,
        tenant_id: tenantId,
      },
    });
  }

  async deleteEncomenda(encomendaId: number, tenantId: number) {
    const encomenda = await this.getEncomendaById(encomendaId, tenantId);

    if (!encomenda) {
      return {
        code: 400,
        message: 'Encomenda não encontrada',
      };
    }

    const delEncomenda = await prisma.encomenda.delete({
      where: {
        id: encomendaId,
        tenant_id: tenantId,
      },
    });

    return {
      code: 200,
      message: `Encomenda ${delEncomenda.id} deletada com sucesso`,
    };
  }

  async updateEncomenda(
    id: number,
    tenant_id: number,
    pago: boolean,
    data_quitacao: Date,
  ) {
    const existingEncomenda = await this.getEncomendaById(id, tenant_id);

    if (!existingEncomenda) {
      return {
        code: 400,
        message: 'Encomenda não encontrada',
      };
    }

    const updatedEncomenda = await prisma.encomenda.update({
      where: {
        id,
        tenant_id,
      },
      data: {
        pago: pago ?? existingEncomenda.pago,
        data_quitacao: data_quitacao ?? existingEncomenda.data_quitacao,
      },
    });

    return {
      code: 200,
      message: 'Encomenda atualizada com sucesso',
      encomenda_id: updatedEncomenda.id,
    };
  }
}

export default new EncomendaDomain();
