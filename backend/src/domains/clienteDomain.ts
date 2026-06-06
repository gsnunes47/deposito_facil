import prisma from "../repositories/db.js";
import type { Cliente } from '@prisma/client'

class ClienteDomain {

    async createCliente(name: string, tenant_id: number, documento?: string | null) {

        try {

            const cliente = await prisma.cliente.create({
                data: {
                    nome: name,
                    documento: documento ?? "",
                    tenant_id: tenant_id
                }
            })
            
            return {
                "code": 200,
                "message": "Cliente created successfully",
                "cliente_id": cliente.id
            }

        } catch (error) {

            return {
                "code": 400,
                "message": "Error creating cliente",
                "error": error
            }

        }

    }

    async getClientes(tenantId: number) {

        const clientes = await prisma.cliente.findMany({
            where: {
                tenant_id: tenantId
            }
        })
        
        return clientes
    }

    async getClienteById(clienteId: number,tenantId: number) {

        const cliente = await prisma.cliente.findFirst({
            where: {
                id: clienteId,
                tenant_id: tenantId
            }
        })
        
        return cliente
    }

    async deleteCliente(clienteId: number, tenantId: number) {

        const cliente = await this.getClienteById(clienteId, tenantId)

        if (!cliente) {
            return {
                "code": 400,
                "message": "Cliente não encontrado"
            }
        }

        const delCliente = await prisma.cliente.delete({
            where: {
                id: clienteId,
                tenant_id: tenantId
            }
        })

        return {
            "code": 200,
            "message": `Cliente ${delCliente.id} - ${delCliente.nome} deletado com sucesso`
        }
    }

    async updateCliente(cliente: Cliente) {

        const existingCliente = await this.getClienteById(cliente.id, cliente.tenant_id)

        if (!existingCliente) {
            return {
                "code": 400,
                "message": "Cliente não encontrado"
            }
        }

        const updatedCliente = await prisma.cliente.update({
            where: {
                id: cliente.id,
                tenant_id: cliente.tenant_id
            },
            data: {
                nome: cliente.nome ?? existingCliente.nome,
                documento: cliente.documento ?? existingCliente.documento
            }
        })

        return {
            "code": 200,
            "message": "Cliente atualizado com sucesso",
            "cliente": updatedCliente as Cliente
        }

    }
}

export default new ClienteDomain()
