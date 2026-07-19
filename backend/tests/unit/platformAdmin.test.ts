import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import platformAdminMiddleware from '../../src/routing/middlewares/platformAdminMiddleware.js';

function responseMock() {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
  };

  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);

  return response;
}

describe('Platform admin middleware', () => {
  it('permite apenas o papel exclusivo da plataforma', () => {
    const request = {
      user: { accessLevel: 'platform_admin' },
    } as Request;
    const response = responseMock();
    const next = vi.fn();

    platformAdminMiddleware.verify(
      request,
      response as unknown as Response,
      next as NextFunction,
    );

    expect(next).toHaveBeenCalledOnce();
    expect(response.status).not.toHaveBeenCalled();
  });

  it('bloqueia o administrador de um tenant comum', () => {
    const request = {
      user: { accessLevel: 'admin' },
    } as Request;
    const response = responseMock();
    const next = vi.fn();

    platformAdminMiddleware.verify(
      request,
      response as unknown as Response,
      next as NextFunction,
    );

    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(403);
  });
});
