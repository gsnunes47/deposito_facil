import prisma from "../repositories/db.js";
import type { Venda } from '@prisma/client'

class VendaDomain {

    async createVenda(cliente_id: number, produtos: any, tenant_id: number) {

        try {

            let total = 0

            for (const produto of produtos) {
                total += produto.quantidade * produto.valor_unitario
            }
            
            const venda = await prisma.venda.create({
                data: {
                    cliente_id: cliente_id,
                    tenant_id: tenant_id,
                    produtos: produtos,
                    total: total
                }
            })

            return {
                "code": 200,
                "message": "Venda created successfully",
                "venda_id": venda.id
            }

        } catch (error) {

            return {
                "code": 400,
                "message": "Error creating venda",
                "error": error instanceof Error ? error.message : String(error)
            }

        }

    }

    async getVendasAbertas(tenantId: number) {

        const vendas = await prisma.venda.findMany({
            where: {
                tenant_id: tenantId,
                pago: false
            }
        })
        
        return vendas
    }

    async getVendasFechadas(tenantId: number) {

        const vendas = await prisma.venda.findMany({
            where: {
                tenant_id: tenantId,
                pago: true
            }
        })
        
        return vendas
    }

    async getVendaById(vendaId: number,tenantId: number) {

        const venda = await prisma.venda.findFirst({
            where: {
                id: vendaId,
                tenant_id: tenantId
            }
        })
        
        return venda
    }

    // async deleteVenda(vendaId: number, tenantId: number) {

    //     const venda = await this.getVendaById(vendaId, tenantId)

    //     if (!venda) {
    //         return {
    //             "code": 400,
    //             "message": "Venda não encontrado"
    //         }
    //     }

    //     const delVenda = await prisma.venda.delete({
    //         where: {
    //             id: vendaId,
    //             tenant_id: tenantId
    //         }
    //     })

    //     return {
    //         "code": 200,
    //         "message": `Venda ${delVenda.id} deletado com sucesso`
    //     }
    // }

    async updateVenda(id: number, tenant_id: number, pago: boolean, data_quitacao: Date) {

        const existingVenda = await this.getVendaById(id, tenant_id)

        if (!existingVenda) {
            return {
                "code": 400,
                "message": "Venda não encontrada"
            }
        }

        const updatedVenda = await prisma.venda.update({
            where: {
                id: id,
                tenant_id: tenant_id
            },
            data: {
                pago: pago ?? existingVenda.pago,
                data_quitacao: data_quitacao ?? existingVenda.data_quitacao
            }
        })

        return {
            "code": 200,
            "message": "Venda atualizado com sucesso",
            "venda": updatedVenda as Venda
        }

    }
    
}

export default new VendaDomain()
