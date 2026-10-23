import prisma from '../repositories/db.js';
import type { Cliente } from '@prisma/client';
import { getNextTenantId } from '../helpers/globalIdHelper.js';

interface clienteInterface {
  tenant_id: number;
  documento: any;
  nome: any;
  id: number;
}

class ClienteDomain {
  async createCliente(
    name: string,
    tenant_id: number,
    documento?: string | null,
  ) {
    try {
      const cliente = await prisma.cliente.create({
        data: {
          nome: name,
          documento: documento ?? '',
          tenant_id: tenant_id,
        },
      });

      return {
        code: 200,
        message: 'Cliente created successfully',
        cliente_id: cliente.id,
      };
    } catch (error) {
      return {
        code: 400,
        message: 'Error creating cliente',
        error: error,
      };
    }
  }

  async getClientes(tenantId: number) {
    const clientes = await prisma.cliente.findMany({
      where: {
        tenant_id: tenantId,
      },
      select: {
        id: true,
        nome: true,
        documento: true,
      },
    });

    return clientes;
  }

  private async getClienteById(clienteId: number, tenantId: number) {
    const cliente = await prisma.cliente.findFirst({
      where: {
        id: clienteId,
        tenant_id: tenantId,
      },
    });

    return cliente;
  }

  async deleteCliente(clienteId: number, tenantId: number) {
    try {
      return await prisma.$transaction(async (transaction) => {
        const cliente = await transaction.cliente.findFirst({
          where: { id: clienteId, tenant_id: tenantId },
        });

        if (!cliente) {
          return { code: 400, message: 'Cliente não encontrado' };
        }

        await transaction.pagamento.deleteMany({
          where: {
            tenant_id: tenantId,
            venda: { cliente_id: clienteId, tenant_id: tenantId },
          },
        });
        await transaction.venda.deleteMany({
          where: { cliente_id: clienteId, tenant_id: tenantId },
        });
        await transaction.cliente.delete({
          where: { id: clienteId, tenant_id: tenantId },
        });

        return {
          code: 200,
          message: `Cliente ${cliente.id} - ${cliente.nome}, suas vendas e pagamentos excluídos com sucesso`,
        };
      });
    } catch (_error) {
      return {
        code: 400,
        message:
          'Não foi possível excluir o cliente e suas vendas. Nenhuma alteração foi salva.',
      };
    }
  }

  async updateCliente(cliente: clienteInterface) {
    const existingCliente = await this.getClienteById(
      cliente.id,
      cliente.tenant_id,
    );

    if (!existingCliente) {
      return {
        code: 400,
        message: 'Cliente não encontrado',
      };
    }

    const updatedCliente = await prisma.cliente.update({
      where: {
        id: cliente.id,
        tenant_id: cliente.tenant_id,
      },
      data: {
        nome: cliente.nome ?? existingCliente.nome,
        documento: cliente.documento ?? existingCliente.documento,
      },
    });

    return {
      code: 200,
      message: 'Cliente atualizado com sucesso',
      cliente: updatedCliente as Cliente,
    };
  }
}

export default new ClienteDomain();
