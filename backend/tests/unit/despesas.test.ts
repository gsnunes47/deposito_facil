import { describe, it, expect, afterEach } from 'vitest';
import despesaDomain from '../../src/domains/despesaDomain.js';
import prisma from '../../src/repositories/db.js';

let despesaId: number = 0;

afterEach(async () => {
  if (despesaId !== 0) {
    await prisma.despesa.deleteMany({
      where: {
        id: despesaId,
        tenant_id: 1,
      },
    });
  }

  despesaId = 0;
});

describe('Despesa Domain', () => {
  it('deve criar uma despesa', async () => {
    const despesaNovo = await despesaDomain.createDespesa(
      1000,
      'Despesa Teste',
      1,
    );

    despesaId = despesaNovo.despesa_id as number;

    expect(despesaNovo.code).toBe(200);
  });

  it('deve apagar uma despesa', async () => {
    const despesaNovo = await despesaDomain.createDespesa(
      1000,
      'Despesa Teste',
      1,
    );

    const despesaDeletado = await despesaDomain.deleteDespesa(
      despesaNovo.despesa_id as number,
      1,
    );

    expect(despesaDeletado.code).toBe(200);
  });

  it('deve retornar erro ao atualizar despesa inexistente', async () => {
    const resultado = await despesaDomain.updateDespesa({
      id: 999999,
      descricao: 'Teste',
      valor: 1,
      tenant_id: 1,
    });

    expect(resultado.code).toBe(400);
  });

  it('deve retornar erro ao deletar despesa inexistente', async () => {
    const resultado = await despesaDomain.deleteDespesa(999999, 1);

    expect(resultado.code).toBe(400);
  });

});
