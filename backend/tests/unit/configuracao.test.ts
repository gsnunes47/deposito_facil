import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import * as controller from '../../src/controllers/configuracaoController.js';

const database = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update: vi.fn(),
}));

vi.mock('../../src/repositories/db.js', () => ({
  default: { tenants: database },
}));

function request(tenantId: number, body: unknown = {}) {
  return {
    user: { tenantId },
    body,
    params: { tenantId: '999' },
    query: { tenantId: '999' },
  } as unknown as Request;
}

function response() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

beforeEach(() => vi.resetAllMocks());

describe('Configurações por tenant', () => {
  it('consulta somente a configuração do tenant da sessão', async () => {
    database.findUnique.mockResolvedValue({ listar_produtos: false });
    const res = response();

    await controller.obter(request(42, { tenantId: 999 }), res);

    expect(database.findUnique).toHaveBeenCalledExactlyOnceWith({
      where: { id: 42 },
      select: { listar_produtos: true },
    });
    expect(res.json).toHaveBeenCalledWith({ listar_produtos: false });
  });

  it.each([true, false])(
    'salva %s sem aceitar outro tenant no payload',
    async (listarProdutos) => {
      database.update.mockResolvedValue({ listar_produtos: listarProdutos });
      const res = response();

      await controller.salvar(
        request(7, {
          tenantId: 999,
          tenant_id: 999,
          listar_produtos: listarProdutos,
          name: 'Não deve alterar o nome',
        }),
        res,
      );

      expect(database.update).toHaveBeenCalledExactlyOnceWith({
        where: { id: 7 },
        data: { listar_produtos: listarProdutos },
        select: { listar_produtos: true },
      });
      expect(res.json).toHaveBeenCalledWith({
        listar_produtos: listarProdutos,
      });
    },
  );

  it.each([
    undefined,
    null,
    {},
    { listar_produtos: 'false' },
    { listar_produtos: 1 },
  ])('rejeita configuração inválida: %j', async (body) => {
    const res = response();
    await controller.salvar(request(7, body), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(database.update).not.toHaveBeenCalled();
  });

  it('retorna 404 se o tenant da sessão não existir', async () => {
    database.findUnique.mockResolvedValue(null);
    const res = response();
    await controller.obter(request(42), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
