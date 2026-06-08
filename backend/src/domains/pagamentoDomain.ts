import prisma from "../repositories/db.js";
import type { FormaPagamento, Pagamento } from '@prisma/client'
import {getNextTenantId, getGlobalId} from '../helpers/globalIdHelper.js'
import vendaDomain from './vendaDomain.js'

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

            let vendas = await vendaDomain.getVendasAbertas(tenant_id)
            const vendaDestino = vendas.find((venda) => venda.id === venda_id)

            if (!vendaDestino) {
                return {
                    "code": 400,
                    "message": "Impossível adicionar um pagamento para esta venda"
                }
            }
            
            if (vendaDestino.total - valor < 0){
                return {
                    "code": 400,
                    "message": "O pagamento deve ser igual ou menor que o valor total da venda"
                }
            } else if (vendaDestino.total - valor > 0) {
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
            }

            const pagamento = await prisma.pagamento.create({
                data: {
                    id: novoId,
                    venda_id: vendaId,
                    tenant_id: tenant_id,
                    forma_pagamento: forma_pagamento,
                    valor: valor
                }
            })

            const vendaAtt = await vendaDomain.updateVenda(venda_id, tenant_id, true, new Date())
            
            return {
                "code": 200,
                "message": "Pagamento created successfully",
                "pagamento_id": pagamento.id,
                "venda": `Venda ${vendaAtt.venda_id} fechada.`
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
