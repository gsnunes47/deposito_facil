import type { Request, Response } from 'express';
import prisma from '../repositories/db.js';
import tenantDomain from '../domains/tenantDomain.js';

export async function createTenant(request: Request, response: Response) {
  const tenant = await tenantDomain.createTenant(request.body.name);

  if (tenant.code === '400') {
    return response.status(400).send(tenant);
  } else if (tenant.code === '200') {
    return response.status(200).send(tenant);
  }
}
