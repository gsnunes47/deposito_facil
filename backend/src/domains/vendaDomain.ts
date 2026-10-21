import prisma from '../repositories/db.js';
import { obterConfiguracaoComprovante } from '../config/comprovantes.js';
import type { FormaPagamento } from '@prisma/client';

type ClienteVenda = number | { cliente_id?: number; cliente_nome?: string };

interface PagamentoInicial {
  forma_pagamento: FormaPagamento;
  valor?: number;
  quitar?: boolean;
}

class VendaInvalidaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VendaInvalidaError';
  }
}

class VendaDomain {
  async createVenda(
    cliente: ClienteVenda,
    produtos: any,
    tenant_id: number,
    data?: Date,
    pagamentoInicial?: PagamentoInicial,
  ) {
    try {
      const venda = await prisma.$transaction(async (transaction) => {
        const clienteIdInformado =
          typeof cliente === 'number' ? cliente : cliente.cliente_id;
        const clienteNome =
          typeof cliente === 'number'
            ? undefined
            : cliente.cliente_nome?.trim();

        let clienteId: number;

        if (clienteIdInformado) {
          const clienteExistente = await transaction.cliente.findFirst({
            where: { id: clienteIdInformado, tenant_id },
            select: { id: true },
          });

          if (!clienteExistente) {
            throw new VendaInvalidaError('Cliente inexistente');
          }

          clienteId = clienteExistente.id;
        } else if (clienteNome) {
          const novoCliente = await transaction.cliente.create({
            data: {
              nome: clienteNome,
              documento: null,
              tenant_id,
            },
          });
          clienteId = novoCliente.id;
        } else {
          throw new VendaInvalidaError('Informe um cliente válido');
        }

        let total = 0;
        const itensVenda = [];

        for (const item of produtos) {
          const itemDb = await transaction.produto.findFirst({
            where: { id: item.id, tenant_id },
          });

          if (!itemDb) {
            throw new VendaInvalidaError('Produto ou serviço inexistente');
          }

          total += item.quantidade * item.valor_unitario;
          itensVenda.push({
            id: itemDb.id,
            nome: itemDb.nome,
            tipo: itemDb.tipo,
            quantidade: item.quantidade,
            valor_unitario: item.valor_unitario,
          });

          if (itemDb.tipo === 'PRODUTO') {
            await transaction.produto.update({
              where: { id: itemDb.id },
              data: { quantidade: { decrement: item.quantidade } },
            });
          }
        }

        const valorPagamento = pagamentoInicial
          ? pagamentoInicial.quitar
            ? total
            : pagamentoInicial.valor
          : undefined;

        if (pagamentoInicial && valorPagamento === undefined) {
          throw new VendaInvalidaError('Informe o valor do pagamento');
        }

        if (
          valorPagamento !== undefined &&
          (!Number.isInteger(valorPagamento) ||
            valorPagamento <= 0 ||
            valorPagamento > total)
        ) {
          throw new VendaInvalidaError(
            'O pagamento deve ser maior que zero e igual ou menor que o total da venda',
          );
        }

        const vendaQuitada = valorPagamento === total;
        const venda = await transaction.venda.create({
          data: {
            cliente_id: clienteId,
            tenant_id,
            produtos: itensVenda,
            total,
            ...(data && { data }),
            ...(vendaQuitada && {
              pago: true,
              data_quitacao: new Date(),
            }),
          },
        });

        if (pagamentoInicial && valorPagamento !== undefined) {
          await transaction.pagamento.create({
            data: {
              venda_id: venda.id,
              tenant_id,
              forma_pagamento: pagamentoInicial.forma_pagamento,
              valor: valorPagamento,
            },
          });
        }

        return venda;
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
          nome:
            nomesPorId.get(Number(item.id)) ??
            (typeof item.nome === 'string' ? item.nome : `Produto #${item.id}`),
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
