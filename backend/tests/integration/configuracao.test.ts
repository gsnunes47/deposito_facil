import { afterAll, describe, expect, it } from 'vitest';
import prisma from '../../src/repositories/db.js';
import configuracaoDomain from '../../src/domains/configuracaoDomain.js';

const tenantIds: number[] = [];

afterAll(async () => {
  if (tenantIds.length) {
    await prisma.tenants.deleteMany({ where: { id: { in: tenantIds } } });
  }
  await prisma.$disconnect();
});

describe('Persistência das configurações', () => {
  it('mantém a lista como padrão e persiste o seletor sem alterar outro tenant', async () => {
    for (const nome of ['Configuração A', 'Configuração B']) {
      const tenant = await prisma.tenants.create({
        data: { name: `${nome} ${crypto.randomUUID()}` },
      });
      tenantIds.push(tenant.id);
    }
    const [tenantA, tenantB] = tenantIds as [number, number];

    expect(await configuracaoDomain.obter(tenantA)).toEqual({
      listar_produtos: true,
    });
    await configuracaoDomain.salvar(tenantA, false);
    expect(await configuracaoDomain.obter(tenantA)).toEqual({
      listar_produtos: false,
    });
    expect(await configuracaoDomain.obter(tenantB)).toEqual({
      listar_produtos: true,
    });

    await configuracaoDomain.salvar(tenantB, false);
    await configuracaoDomain.salvar(tenantA, true);
    expect(await configuracaoDomain.obter(tenantA)).toEqual({
      listar_produtos: true,
    });
    expect(await configuracaoDomain.obter(tenantB)).toEqual({
      listar_produtos: false,
    });
  });
});
