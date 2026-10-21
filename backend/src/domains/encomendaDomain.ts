import prisma from '../repositories/db.js';

type FornecedorEncomenda =
  | number
  | { fornecedor_id?: number; fornecedor_nome?: string };

class EncomendaInvalidaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EncomendaInvalidaError';
  }
}

class EncomendaDomain {
  async createEncomenda(
    fornecedor: FornecedorEncomenda,
    produtos: any,
    tenant_id: number,
  ) {
    try {
      const encomenda = await prisma.$transaction(async (transaction) => {
        const fornecedorIdInformado =
          typeof fornecedor === 'number'
            ? fornecedor
            : fornecedor.fornecedor_id;
        const fornecedorNome =
          typeof fornecedor === 'number'
            ? undefined
            : fornecedor.fornecedor_nome?.trim();

        let fornecedorId: number;

        if (fornecedorIdInformado) {
          const fornecedorExistente = await transaction.fornecedor.findFirst({
            where: { id: fornecedorIdInformado, tenant_id },
            select: { id: true },
          });

          if (!fornecedorExistente) {
            throw new EncomendaInvalidaError('Fornecedor inexistente');
          }

          fornecedorId = fornecedorExistente.id;
        } else if (fornecedorNome) {
          const novoFornecedor = await transaction.fornecedor.create({
            data: {
              nome: fornecedorNome,
              documento: null,
              tenant_id,
            },
          });
          fornecedorId = novoFornecedor.id;
        } else {
          throw new EncomendaInvalidaError('Informe um fornecedor válido');
        }

        let total = 0;
        const itensEncomenda = [];

        for (const item of produtos) {
          const produtoDb = await transaction.produto.findFirst({
            where: { id: item.id, tenant_id },
          });

          if (!produtoDb) {
            throw new EncomendaInvalidaError('Produto inexistente');
          }

          if (produtoDb.tipo === 'SERVICO') {
            throw new EncomendaInvalidaError(
              'Serviços não podem movimentar estoque',
            );
          }

          total += item.quantidade * item.valor_unitario;
          itensEncomenda.push({
            id: produtoDb.id,
            nome: produtoDb.nome,
            tipo: produtoDb.tipo,
            quantidade: item.quantidade,
            valor_unitario: item.valor_unitario,
          });

          await transaction.produto.update({
            where: { id: produtoDb.id },
            data: { quantidade: { increment: item.quantidade } },
          });
        }

        return transaction.encomenda.create({
          data: {
            fornecedor_id: fornecedorId,
            tenant_id,
            produtos: itensEncomenda,
            total,
          },
        });
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
