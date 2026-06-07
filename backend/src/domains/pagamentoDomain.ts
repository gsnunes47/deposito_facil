import prisma from "../repositories/db.js";
import type { FormaPagamento, Pagamento } from '@prisma/client'
import {getNextTenantId, getGlobalId} from '../helpers/globalIdHelper.js'


interface pagamentoInterface {
    id: number
    tenant_id: number,
    venda_id: number,
    valor: number,
    forma_pagamento: FormaPagamento
}

class PagamentoDomain {

    async createPagamento(venda_id: number, tenant_id: number, forma_pagamento: FormaPagamento, valor: number) {

        try {

            const novoId = await getNextTenantId(
                prisma.pagamento,
                tenant_id
            )

            const vendaId = await getGlobalId(
                prisma.venda,
                venda_id,
                tenant_id
            )

            const pagamento = await prisma.pagamento.create({
                data: {
                    id: novoId,
                    venda_id: vendaId,
                    tenant_id: tenant_id,
                    forma_pagamento: forma_pagamento,
                    valor: valor
                }
            })
            
            return {
                "code": 200,
                "message": "Pagamento created successfully",
                "pagamento_id": pagamento.id
            }

        } catch (error) {

            return {
                "code": 400,
                "message": "Error creating pagamento",
                "error": error
            }

        }

    }

    private async getPagamentoById(pagamentoId: number ,tenantId: number) {

        const pagamento = await prisma.pagamento.findFirst({
            where: {
                id: pagamentoId,
                tenant_id: tenantId
            }
        })

        return pagamento
    }

    async deletePagamento(pagamentoId: number, tenantId: number) {

        const pagamento = await this.getPagamentoById(pagamentoId, tenantId)

        if (!pagamento) {
            return {
                "code": 400,
                "message": "Pagamento não encontrado"
            }
        }

        const delPagamento = await prisma.pagamento.delete({
            where: {
                global_id: pagamento.global_id,
                id: pagamentoId,
                tenant_id: tenantId
            }
        })

        return {
            "code": 200,
            "message": `Pagamento ${delPagamento.id}} deletado com sucesso`
        }
    }

}

export default new PagamentoDomain()
