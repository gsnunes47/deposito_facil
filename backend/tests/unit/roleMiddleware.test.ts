import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import roleMiddleware from '../../src/routing/middlewares/roleMiddleware.js';

function responseMock() {
  const response = { status: vi.fn(), json: vi.fn() };
  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);
  return response;
}

function executar(accessLevel?: string) {
  const request = (accessLevel ? { user: { accessLevel } } : {}) as Request;
  const response = responseMock();
  const next = vi.fn();

  roleMiddleware.allow('admin', 'gerente')(
    request,
    response as unknown as Response,
    next as NextFunction,
  );

  return { response, next };
}

describe('Role middleware', () => {
  it.each(['admin', 'gerente'])('permite o nível %s', (accessLevel) => {
    const { response, next } = executar(accessLevel);
    expect(next).toHaveBeenCalledOnce();
    expect(response.status).not.toHaveBeenCalled();
  });

  it('bloqueia o nível funcionario', () => {
    const { response, next } = executar('funcionario');
    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(403);
  });

  it('bloqueia uma requisição sem usuário autenticado', () => {
    const { response, next } = executar();
    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(401);
  });
});
