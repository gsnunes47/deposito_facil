import type { Request, Response } from 'express';
import tenantDomain from '../domains/tenantDomain.js';
import tenantUserDomain from '../domains/tenantUserDomain.js';

export async function getTenants(_request: Request, response: Response) {
  const tenants = await tenantDomain.getTenants();
  return response.status(200).json(tenants);
}

export async function createTenant(request: Request, response: Response) {
  const tenant = await tenantDomain.createTenant(
    request.body.name,
    request.body.admin_login,
    request.body.admin_password,
  );

  return response.status(tenant.code).send(tenant);
}

export async function createTenantUser(request: Request, response: Response) {
  const result = await tenantUserDomain.createUser(
    Number(request.params.id),
    request.body.login,
    request.body.password,
    request.body.access_level,
  );

  return response.status(result.code).send(result);
}

export async function updateTenantUser(request: Request, response: Response) {
  const result = await tenantUserDomain.updateUser(
    Number(request.params.id),
    Number(request.params.userId),
    request.body.login,
    request.body.password,
    request.body.access_level,
  );

  return response.status(result.code).send(result);
}

export async function deleteTenantUser(request: Request, response: Response) {
  const result = await tenantUserDomain.deleteUser(
    Number(request.params.id),
    Number(request.params.userId),
  );

  return response.status(result.code).send(result);
}
