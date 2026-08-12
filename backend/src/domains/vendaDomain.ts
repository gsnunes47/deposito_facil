import prisma from '../repositories/db.js';
import produtoDomain from './produtoDomain.js';
import type { Venda } from '@prisma/client';
import { obterConfiguracaoComprovante } from '../config/comprovantes.js';

interface clienteInterface {
  tenant_id: number;
  documento: any;
  nome: any;
  id: number;
}

class VendaDomain {
  async createVenda(
    cliente_id: number,
    produtos: any,
    tenant_id: number,
    data?: Date,
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
            message: 'Error creating venda',
            error: 'Produto inexistente',
          };
        }

        await produtoDomain.updateProduto({
          id: produto.id,
          tenant_id: tenant_id,
          quantidade: (produtoDb.quantidade as number) - produto.quantidade,
        });
      }

      const venda = await prisma.venda.create({
        data: {
          cliente_id: cliente_id,
          tenant_id: tenant_id,
          produtos: produtos,
          total: total,
          ...(data && { data }),
        },
      });

      return {
        code: 200,
        message: 'Venda created successfully',
        venda_id: venda.id,
      };
    } catch (error) {
      return {
        code: 400,
        message: 'Error creating venda',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getVendasAbertas(tenantId: number) {
    const vendas = await prisma.venda.findMany({
      where: {
        tenant_id: tenantId,
        pago: false,
      },
      select: {
        id: true,
        tenant_id: true,
        cliente_id: true,
        produtos: true,
        total: true,
        data: true,
        data_quitacao: true,
        pago: true,
        pagamentos: true,
      },
    });

    return vendas;
  }

  async getVendasFechadas(tenantId: number) {
    const vendas = await prisma.venda.findMany({
      where: {
        tenant_id: tenantId,
        pago: true,
      },
      select: {
        id: true,
        tenant_id: true,
        cliente_id: true,
        produtos: true,
        total: true,
        data: true,
        data_quitacao: true,
        pago: true,
        pagamentos: true,
      },
    });

    return vendas;
  }

  async getComprovanteVenda(vendaId: number, tenantId: number) {
    const configuracao = obterConfiguracaoComprovante(tenantId);

    if (!configuracao) return null;

    const venda = await prisma.venda.findFirst({
      where: {
        id: vendaId,
        tenant_id: tenantId,
      },
      select: {
        id: true,
        data: true,
        total: true,
        produtos: true,
        cliente: {
          select: {
            nome: true,
          },
        },
      },
    });

    if (!venda) return null;

    const itensVenda = Array.isArray(venda.produtos) ? venda.produtos : [];
    const produtoIds = itensVenda
      .map((item: any) => Number(item.id))
      .filter(Number.isInteger);
    const produtos = await prisma.produto.findMany({
      where: {
        id: { in: produtoIds },
        tenant_id: tenantId,
      },
      select: {
        id: true,
        nome: true,
      },
    });
    const nomesPorId = new Map(
      produtos.map((produto) => [produto.id, produto.nome]),
    );

    return {
      configuracao,
      venda: {
        id: venda.id,
        data: venda.data,
        cliente: venda.cliente.nome ?? 'Cliente não informado',
        itens: itensVenda.map((item: any) => ({
          produtoId: Number(item.id),
          nome: nomesPorId.get(Number(item.id)) ?? `Produto #${item.id}`,
          quantidade: Number(item.quantidade),
          valorUnitario: Number(item.valor_unitario),
          subtotal: Number(item.quantidade) * Number(item.valor_unitario),
        })),
        total: venda.total,
      },
    };
  }

  async getComprovantesVendas(vendaIds: number[], tenantId: number) {
    const comprovantes = await Promise.all(
      vendaIds.map((vendaId) => this.getComprovanteVenda(vendaId, tenantId)),
    );

    if (comprovantes.some((comprovante) => !comprovante)) return null;

    const vendas = comprovantes.map((comprovante) => comprovante!.venda);

    return {
      configuracao: comprovantes[0]!.configuracao,
      vendas,
      totalGeral: vendas.reduce(
        (total, venda) => total + Number(venda.total),
        0,
      ),
    };
  }

  async getVendaPagamentos(venda_id: number, tenantId: number) {
    const venda = await prisma.venda.findUnique({
      where: {
        id: venda_id,
        tenant_id: tenantId,
      },
      select: {
        id: true,
        total: true,
        pago: true,
        pagamentos: true,
      },
    });

    if (!venda) {
      return {
        code: 400,
        message: 'Venda não encontrado',
      };
    }

    let debito = venda.total;

    for (const pagamento of venda.pagamentos) {
      debito -= Number(pagamento.valor);
    }

    return {
      id: venda.id,
      total: venda.total,
      debito: debito,
      pago: venda.pago,
      pagamentos: venda.pagamentos,
    };
  }

  private async getVendaById(vendaId: number, tenantId: number) {
    const venda = await prisma.venda.findFirst({
      where: {
        id: vendaId,
        tenant_id: tenantId,
      },
    });

    return venda;
  }

  async deleteVenda(vendaId: number, tenantId: number) {
    const venda = await this.getVendaById(vendaId, tenantId);

    if (!venda) {
      return {
        code: 400,
        message: 'Venda não encontrado',
      };
    }

    await prisma.$transaction([
      prisma.pagamento.deleteMany({
        where: {
          venda_id: vendaId,
          tenant_id: tenantId,
        },
      }),
      prisma.venda.delete({
        where: {
          id: vendaId,
          tenant_id: tenantId,
        },
      }),
    ]);

    return {
      code: 200,
      message: 'Venda ' + venda.id + ' deletada com sucesso',
    };
  }

  async updateVenda(
    id: number,
    tenant_id: number,
    pago: boolean,
    data_quitacao: Date,
  ) {
    const existingVenda = await this.getVendaById(id, tenant_id);

    if (!existingVenda) {
      return {
        code: 400,
        message: 'Venda não encontrada',
      };
    }

    const updatedVenda = await prisma.venda.update({
      where: {
        id: id,
        tenant_id: tenant_id,
      },
      data: {
        pago: pago ?? existingVenda.pago,
        data_quitacao: data_quitacao ?? existingVenda.data_quitacao,
      },
    });

    return {
      code: 200,
      message: 'Venda atualizada com sucesso',
      venda_id: updatedVenda.id,
    };
  }
}

export default new VendaDomain();
