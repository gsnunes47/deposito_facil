import prisma from "../repositories/db.js";

export async function getNextTenantId(
    model: any,
    tenant_id: number
): Promise<number> {

    const ultimoRegistro = await model.findFirst({
        where: {
            tenant_id
        },
        orderBy: {
            id: 'desc'
        },
        select: {
            id: true
        }
    })

    return (ultimoRegistro?.id ?? 0) + 1
}

export async function receiveGlobalId(
    model: any,
    id: number,
    tenant_id: number
): Promise<number> {

    const global = await model.findFirst({
        where: {
            id,
            tenant_id
        },
        select: {
            global_id: true
        }
    })

    return global.global_id
}