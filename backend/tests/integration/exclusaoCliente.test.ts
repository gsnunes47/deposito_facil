import { afterEach, describe, expect, it } from 'vitest';
import prisma from '../../src/repositories/db.js';
import clienteDomain from '../../src/domains/clienteDomain.js';

const tenantIds: number[] = [];

afterEach(async () => {
  await prisma.pagamento.deleteMany({
    where: { tenant_id: { in: tenantIds } },
  });
  await prisma.venda.deleteMany({ where: { tenant_id: { in: tenantIds } } });
  await prisma.cliente.deleteMany({ where: { tenant_id: { in: tenantIds } } });
  await prisma.tenants.deleteMany({ where: { id: { in: tenantIds } } });
  tenantIds.length = 0;
});

async function criarCliente() {
  const tenant = await prisma.tenants.create({
    data: { name: `Exclusão cliente ${crypto.randomUUID()}` },
  });
  tenantIds.push(tenant.id);
  return prisma.cliente.create({
    data: { nome: 'Cliente de teste', tenant_id: tenant.id },
  });
}

async function criarVenda(
  cliente: { id: number; tenant_id: number },
  pago = false,
) {
  return prisma.venda.create({
    data: {
      cliente_id: cliente.id,
      tenant_id: cliente.tenant_id,
      produtos: [],
      total: 1000,
      pago,
      pagamentos: {
        create: {
          tenant_id: cliente.tenant_id,
          valor: pago ? 1000 : 200,
          forma_pagamento: 'PIX',
        },
      },
    },
    include: { pagamentos: true },
  });
}

describe('Exclusão de cliente e histórico financeiro', () => {
  it('exclui vendas abertas, quitadas e pagamentos, preservando outros clientes e tenants', async () => {
    const cliente = await criarCliente();
    const outroTenant = await criarCliente();
    const outroCliente = await prisma.cliente.create({
      data: { nome: 'Outro cliente', tenant_id: cliente.tenant_id },
    });
    const aberta = await criarVenda(cliente);
    const quitada = await criarVenda(cliente, true);
    const protegidas = [
      await criarVenda(outroTenant),
      await criarVenda(outroCliente),
    ];

    expect(
      (await clienteDomain.deleteCliente(cliente.id, cliente.tenant_id)).code,
    ).toBe(200);
    expect(
      await prisma.cliente.findUnique({ where: { id: cliente.id } }),
    ).toBeNull();
    expect(
      await prisma.venda.count({ where: { cliente_id: cliente.id } }),
    ).toBe(0);
    expect(
      await prisma.pagamento.count({
        where: { venda_id: { in: [aberta.id, quitada.id] } },
      }),
    ).toBe(0);
    expect(
      await prisma.venda.count({
        where: { id: { in: protegidas.map((venda) => venda.id) } },
      }),
    ).toBe(2);
    expect(
      await prisma.pagamento.count({
        where: { venda_id: { in: protegidas.map((venda) => venda.id) } },
      }),
    ).toBe(2);
    expect(
      await prisma.cliente.count({
        where: { id: { in: [outroTenant.id, outroCliente.id] } },
      }),
    ).toBe(2);
  });

  it('não permite excluir cliente de outro tenant', async () => {
    const cliente = await criarCliente();
    const outro = await criarCliente();
    const venda = await criarVenda(cliente);

    expect(
      (await clienteDomain.deleteCliente(cliente.id, outro.tenant_id)).code,
    ).toBe(400);
    expect(
      await prisma.cliente.findUnique({ where: { id: cliente.id } }),
    ).not.toBeNull();
    expect(
      await prisma.venda.findUnique({ where: { id: venda.id } }),
    ).not.toBeNull();
    expect(
      await prisma.pagamento.count({ where: { venda_id: venda.id } }),
    ).toBe(1);
  });

  it('desfaz a exclusão dos pagamentos se a remoção das vendas falhar', async () => {
    const cliente = await criarCliente();
    const outro = await criarCliente();
    const venda = await criarVenda(cliente);
    // Simula um vínculo inconsistente que o filtro de tenant não deve remover.
    await prisma.pagamento.create({
      data: {
        venda_id: venda.id,
        tenant_id: outro.tenant_id,
        valor: 100,
        forma_pagamento: 'PIX',
      },
    });

    expect(
      (await clienteDomain.deleteCliente(cliente.id, cliente.tenant_id)).code,
    ).toBe(400);
    expect(
      await prisma.cliente.findUnique({ where: { id: cliente.id } }),
    ).not.toBeNull();
    expect(
      await prisma.venda.findUnique({ where: { id: venda.id } }),
    ).not.toBeNull();
    expect(
      await prisma.pagamento.count({ where: { venda_id: venda.id } }),
    ).toBe(2);
  });

  it('exclui também um cliente sem vendas', async () => {
    const cliente = await criarCliente();
    expect(
      (await clienteDomain.deleteCliente(cliente.id, cliente.tenant_id)).code,
    ).toBe(200);
    expect(
      await prisma.cliente.findUnique({ where: { id: cliente.id } }),
    ).toBeNull();
  });
});
