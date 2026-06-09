import prisma from '../repositories/db.js';
import userDomain from './userDomain.js';

class TenantDomain {
  async createTenant(name: string) {
    try {
      const tenant = await prisma.tenants.create({
        data: {
          name: name,
        },
      });

      const adminUser = await userDomain.createUser({
        name: 'admin',
        password: 'gnsf@2026!',
        access_level: 'admin',
        tenant: {
          connect: { id: tenant.id },
        },
      });

      return {
        code: '200',
        message: 'Tenant created successfully',
        tenant_id: tenant.id,
      };
    } catch (error) {
      return {
        code: '400',
        message: 'Error creating tenant',
        error: error,
      };
    }
  }
}

export default new TenantDomain();
