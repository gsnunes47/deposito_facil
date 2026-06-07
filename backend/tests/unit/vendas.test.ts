import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest'
import vendaDomain from '../../src/domains/vendaDomain.js'
import prisma from "../../src/repositories/db.js";

let vendaId: number = 0
let cliente: any
let produto1: any
let produto2: any

beforeAll(async () => {

    cliente = await prisma.cliente.create({
        data: {
            nome: "Cliente Teste",
            tenant_id: 1
        }
    })

    produto1 = await prisma.produto.create({
        data: {
            nome: "Produto Teste 1",
            tenant_id: 1
        }
    })

    produto2 = await prisma.produto.create({
        data: {
            nome: "Produto Teste 2",
            tenant_id: 1
        }
    })
    
})

afterEach(async () => {

    if (vendaId !== 0) {
        await prisma.venda.delete({
            where: {
                id: vendaId,
                tenant_id: 1
            }
        })
    }
    
    vendaId = 0
})

afterAll(async () => {

    cliente = await prisma.cliente.delete({
        where: {
            id: cliente.id,
            tenant_id: 1
        }
    })

    produto1 = await prisma.produto.delete({
        where: {
            id: produto1.id,
            tenant_id: 1
        }
    })

    produto2 = await prisma.produto.delete({
        where: {
            id: produto2.id,
            tenant_id: 1
        }
    })

})

describe('Venda Domain', () => {
   
    it('deve criar uma venda', async () => {

        const vendaNovo = await vendaDomain.createVenda(
            cliente.id,
            [
                {
                    produto_id: produto1.id,
                    quantidade: 2,
                    valor_unitario: 1000
                },
                {
                    produto_id: produto2.id,
                    quantidade: 3,
                    valor_unitario: 1500
                },
            ],
            1
        )

        vendaId = vendaNovo.venda_id as number
        
        expect(vendaNovo.code).toBe(200)
    })

    it('deve fechar uma venda', async () => {

        const vendaNovo = await vendaDomain.createVenda(
            cliente.id,
            [
                {
                    produto_id: produto1.id,
                    quantidade: 2,
                    valor_unitario: 1000
                },
                {
                    produto_id: produto2.id,
                    quantidade: 3,
                    valor_unitario: 1500
                },
            ],
            1
        )

        vendaId = vendaNovo.venda_id as number

        const vendaFechada = await vendaDomain.updateVenda(
            vendaNovo.venda_id as number,
            1,
            true,
            new Date()
        )

        if (!vendaFechada.venda) {
            throw new Error('Venda não foi atualizada')
        }
        
        expect(vendaFechada.venda.pago).toBe(true)
    })

})
