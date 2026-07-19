import prisma from '../repositories/db.js';
import bcrypt from 'bcrypt';

const MIN_PASSWORD_LENGTH = 8;

class TenantDomain {
  async getTenants() {
    return prisma.tenants.findMany({
      select: {
        id: true,
        name: true,
        created_at: true,
        users: {
          select: {
            id: true,
            name: true,
            access_level: true,
            created_at: true,
          },
          orderBy: { created_at: 'asc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async createTenant(
    name: string,
    adminLogin?: string,
    adminPassword?: string,
  ) {
    const normalizedName = name?.trim();
    const normalizedLogin = (adminLogin ?? 'admin').trim();
    const password =
      adminPassword || process.env.TENANT_ADMIN_DEFAULT_PASSWORD || '';

    if (!normalizedName) {
      return { code: 400, message: 'Informe o nome do tenant' };
    }

    if (!normalizedLogin) {
      return { code: 400, message: 'Informe o login do administrador' };
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return {
        code: 400,
        message: `A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres`,
      };
    }

    try {
      const tenant = await prisma.$transaction(async (transaction) => {
        const createdTenant = await transaction.tenants.create({
          data: { name: normalizedName },
        });

        await transaction.user.create({
          data: {
            name: normalizedLogin,
            password: await bcrypt.hash(password, 10),
            access_level: 'admin',
            tenant_id: createdTenant.id,
          },
        });

        return createdTenant;
      });

      return {
        code: 201,
        message: 'Tenant criado com sucesso',
        tenant_id: tenant.id,
      };
    } catch (_error) {
      return {
        code: 400,
        message:
          'Não foi possível criar o tenant. Verifique se o nome já existe.',
      };
    }
  }
}

export default new TenantDomain();
