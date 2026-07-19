import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  tenantFindUnique: vi.fn(),
  userFindFirst: vi.fn(),
  userCreate: vi.fn(),
  userUpdate: vi.fn(),
  userDelete: vi.fn(),
  userCount: vi.fn(),
  hash: vi.fn(),
}));

vi.mock('../../src/repositories/db.js', () => ({
  default: {
    tenants: {
      findUnique: mocks.tenantFindUnique,
    },
    user: {
      findFirst: mocks.userFindFirst,
      create: mocks.userCreate,
      update: mocks.userUpdate,
      delete: mocks.userDelete,
      count: mocks.userCount,
    },
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: mocks.hash,
  },
}));

import tenantUserDomain from '../../src/domains/tenantUserDomain.js';

describe('Usuários dos tenants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('recusa um nível de acesso desconhecido', async () => {
    const result = await tenantUserDomain.createUser(
      1,
      'operador',
      'senha-segura',
      'superuser',
    );

    expect(result.code).toBe(400);
    expect(mocks.tenantFindUnique).not.toHaveBeenCalled();
  });

  it('cria usuário armazenando somente o hash da senha', async () => {
    mocks.tenantFindUnique.mockResolvedValue({ id: 1 });
    mocks.userFindFirst.mockResolvedValue(null);
    mocks.hash.mockResolvedValue('senha-hasheada');
    mocks.userCreate.mockResolvedValue({
      id: 20,
      name: 'operador',
      access_level: 'funcionario',
    });

    const result = await tenantUserDomain.createUser(
      1,
      'operador',
      'senha-segura',
      'funcionario',
    );

    expect(result.code).toBe(201);
    expect(mocks.hash).toHaveBeenCalledWith('senha-segura', 10);
    expect(mocks.userCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          tenant_id: 1,
          name: 'operador',
          password: 'senha-hasheada',
          access_level: 'funcionario',
        },
      }),
    );
  });

  it('permite alterar login e nível sem trocar a senha', async () => {
    mocks.userFindFirst
      .mockResolvedValueOnce({
        id: 10,
        tenant_id: 1,
        name: 'operador',
        access_level: 'funcionario',
      })
      .mockResolvedValueOnce(null);
    mocks.userUpdate.mockResolvedValue({
      id: 10,
      name: 'gerente',
      access_level: 'admin',
    });

    const result = await tenantUserDomain.updateUser(
      1,
      10,
      'gerente',
      undefined,
      'admin',
    );

    expect(result.code).toBe(200);
    expect(mocks.hash).not.toHaveBeenCalled();
    expect(mocks.userUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { name: 'gerente', access_level: 'admin' },
      }),
    );
  });

  it('não permite rebaixar o único administrador', async () => {
    mocks.userFindFirst
      .mockResolvedValueOnce({
        id: 10,
        tenant_id: 1,
        name: 'admin',
        access_level: 'admin',
      })
      .mockResolvedValueOnce(null);
    mocks.userCount.mockResolvedValue(1);

    const result = await tenantUserDomain.updateUser(
      1,
      10,
      'admin',
      undefined,
      'funcionario',
    );

    expect(result.code).toBe(400);
    expect(mocks.userUpdate).not.toHaveBeenCalled();
  });

  it('não permite excluir o único administrador', async () => {
    mocks.userFindFirst.mockResolvedValue({
      id: 10,
      tenant_id: 1,
      access_level: 'admin',
    });
    mocks.userCount.mockResolvedValue(1);

    const result = await tenantUserDomain.deleteUser(1, 10);

    expect(result.code).toBe(400);
    expect(mocks.userDelete).not.toHaveBeenCalled();
  });
});
