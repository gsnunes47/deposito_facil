import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import despesaDomain from '../../src/domains/despesaDomain.js';
import tipoDespesaDomain from '../../src/domains/tipoDespesaDomain.js';
import prisma from '../../src/repositories/db.js';

let tipoId = 0;
let despesaId = 0;
let tenantId = 0;
let outroTenantId = 0;

beforeAll(async () => {
  const identificador = `${Date.now()}-${Math.random()}`;
  const [tenant, outroTenant] = await Promise.all([
    prisma.tenants.create({
      data: { name: `Tipos de despesa ${identificador}` },
      select: { id: true },
    }),
    prisma.tenants.create({
      data: { name: `Outro tenant ${identificador}` },
      select: { id: true },
    }),
  ]);

  tenantId = tenant.id;
  outroTenantId = outroTenant.id;
});

afterEach(async () => {
  if (despesaId) {
    await prisma.despesa.deleteMany({
      where: { id: despesaId, tenant_id: tenantId },
    });
  }
  if (tipoId) {
    await prisma.tipoDespesa.deleteMany({
      where: { id: tipoId, tenant_id: tenantId },
    });
  }
  tipoId = 0;
  despesaId = 0;
});

afterAll(async () => {
  await prisma.despesa.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.tenants.deleteMany({
    where: { id: { in: [tenantId, outroTenantId] } },
  });
});

describe('TipoDespesa Domain', () => {
  it('deve inicializar os tipos padrão sem duplicar', async () => {
    await tipoDespesaDomain.inicializar(tenantId);
    await tipoDespesaDomain.inicializar(tenantId);

    const tipos = await tipoDespesaDomain.getTiposDespesa(tenantId);
    expect(
      tipos.filter((tipo) =>
        ['Salário', 'Manutenção', 'Imprevisto'].includes(tipo.nome),
      ),
    ).toHaveLength(3);
  });

  it('deve criar e consultar tipos apenas do tenant', async () => {
    const nome = `Tipo teste ${Date.now()}`;
    const criado = await tipoDespesaDomain.createTipoDespesa(nome, tenantId);
    tipoId = criado.tipo?.id ?? 0;

    const tipos = await tipoDespesaDomain.getTiposDespesa(tenantId);
    expect(criado.code).toBe(201);
    expect(tipos.some((tipo) => tipo.id === tipoId)).toBe(true);

    expect(
      (
        await tipoDespesaDomain.updateTipoDespesa(
          tipoId,
          'Outro nome',
          outroTenantId,
        )
      ).code,
    ).toBe(404);
    expect(
      (await tipoDespesaDomain.deleteTipoDespesa(tipoId, outroTenantId)).code,
    ).toBe(404);
  });

  it('deve preservar a despesa ao excluir seu tipo', async () => {
    const criado = await tipoDespesaDomain.createTipoDespesa(
      `Tipo removível ${Date.now()}`,
      tenantId,
    );
    tipoId = criado.tipo?.id ?? 0;
    const despesa = await despesaDomain.createDespesa(
      1000,
      'Despesa com tipo',
      tenantId,
      new Date(),
      tipoId,
    );
    despesaId = despesa.despesa_id ?? 0;

    const removido = await tipoDespesaDomain.deleteTipoDespesa(
      tipoId,
      tenantId,
    );
    tipoId = 0;
    const despesaPreservada = await prisma.despesa.findFirst({
      where: { id: despesaId, tenant_id: tenantId },
    });

    expect(removido.code).toBe(200);
    expect(despesaPreservada?.tipo_id).toBeNull();
  });
});
