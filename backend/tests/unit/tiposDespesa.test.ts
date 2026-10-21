import { afterEach, describe, expect, it } from 'vitest';
import despesaDomain from '../../src/domains/despesaDomain.js';
import tipoDespesaDomain from '../../src/domains/tipoDespesaDomain.js';
import prisma from '../../src/repositories/db.js';

let tipoId = 0;
let despesaId = 0;

afterEach(async () => {
  if (despesaId) {
    await prisma.despesa.deleteMany({ where: { id: despesaId, tenant_id: 1 } });
  }
  if (tipoId) {
    await prisma.tipoDespesa.deleteMany({
      where: { id: tipoId, tenant_id: 1 },
    });
  }
  tipoId = 0;
  despesaId = 0;
});

describe('TipoDespesa Domain', () => {
  it('deve inicializar os tipos padrão sem duplicar', async () => {
    await tipoDespesaDomain.inicializar(1);
    await tipoDespesaDomain.inicializar(1);

    const tipos = await tipoDespesaDomain.getTiposDespesa(1);
    expect(
      tipos.filter((tipo) =>
        ['Salário', 'Manutenção', 'Imprevisto'].includes(tipo.nome),
      ),
    ).toHaveLength(3);
  });

  it('deve criar e consultar tipos apenas do tenant', async () => {
    const nome = `Tipo teste ${Date.now()}`;
    const criado = await tipoDespesaDomain.createTipoDespesa(nome, 1);
    tipoId = criado.tipo?.id ?? 0;

    const tipos = await tipoDespesaDomain.getTiposDespesa(1);
    expect(criado.code).toBe(201);
    expect(tipos.some((tipo) => tipo.id === tipoId)).toBe(true);

    expect(
      (await tipoDespesaDomain.updateTipoDespesa(tipoId, 'Outro nome', 2)).code,
    ).toBe(404);
    expect((await tipoDespesaDomain.deleteTipoDespesa(tipoId, 2)).code).toBe(
      404,
    );
  });

  it('deve preservar a despesa ao excluir seu tipo', async () => {
    const criado = await tipoDespesaDomain.createTipoDespesa(
      `Tipo removível ${Date.now()}`,
      1,
    );
    tipoId = criado.tipo?.id ?? 0;
    const despesa = await despesaDomain.createDespesa(
      1000,
      'Despesa com tipo',
      1,
      new Date(),
      tipoId,
    );
    despesaId = despesa.despesa_id ?? 0;

    const removido = await tipoDespesaDomain.deleteTipoDespesa(tipoId, 1);
    tipoId = 0;
    const despesaPreservada = await prisma.despesa.findFirst({
      where: { id: despesaId, tenant_id: 1 },
    });

    expect(removido.code).toBe(200);
    expect(despesaPreservada?.tipo_id).toBeNull();
  });
});
