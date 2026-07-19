import prisma from '../repositories/db.js';
import bcrypt from 'bcrypt';

export const TENANT_ACCESS_LEVELS = [
  'admin',
  'gerente',
  'funcionario',
] as const;
type TenantAccessLevel = (typeof TENANT_ACCESS_LEVELS)[number];

const MIN_PASSWORD_LENGTH = 8;

function validAccessLevel(value: string): value is TenantAccessLevel {
  return TENANT_ACCESS_LEVELS.includes(value as TenantAccessLevel);
}

function validateTenantId(tenantId: number) {
  return Number.isInteger(tenantId) && tenantId > 0;
}

class TenantUserDomain {
  async createUser(
    tenantId: number,
    login: string,
    password: string,
    accessLevel: string,
  ) {
    const normalizedLogin = login?.trim();

    if (!validateTenantId(tenantId)) {
      return { code: 400, message: 'Tenant inválido' };
    }
    if (!normalizedLogin) {
      return { code: 400, message: 'Informe o login' };
    }
    if (!validAccessLevel(accessLevel)) {
      return { code: 400, message: 'Nível de acesso inválido' };
    }
    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
      return {
        code: 400,
        message: `A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres`,
      };
    }

    const tenant = await prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { id: true },
    });
    if (!tenant) {
      return { code: 404, message: 'Tenant não encontrado' };
    }

    const duplicatedLogin = await prisma.user.findFirst({
      where: { tenant_id: tenantId, name: normalizedLogin },
      select: { id: true },
    });
    if (duplicatedLogin) {
      return { code: 400, message: 'Este login já está em uso neste tenant' };
    }

    const user = await prisma.user.create({
      data: {
        tenant_id: tenantId,
        name: normalizedLogin,
        password: await bcrypt.hash(password, 10),
        access_level: accessLevel,
      },
      select: {
        id: true,
        name: true,
        access_level: true,
        created_at: true,
      },
    });

    return { code: 201, message: 'Usuário criado com sucesso', user };
  }

  async updateUser(
    tenantId: number,
    userId: number,
    login: string,
    password: string | undefined,
    accessLevel: string,
  ) {
    const normalizedLogin = login?.trim();

    if (
      !validateTenantId(tenantId) ||
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return { code: 400, message: 'Usuário ou tenant inválido' };
    }
    if (!normalizedLogin) {
      return { code: 400, message: 'Informe o login' };
    }
    if (!validAccessLevel(accessLevel)) {
      return { code: 400, message: 'Nível de acesso inválido' };
    }
    if (
      password &&
      (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH)
    ) {
      return {
        code: 400,
        message: `A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres`,
      };
    }

    const currentUser = await prisma.user.findFirst({
      where: { id: userId, tenant_id: tenantId },
    });
    if (!currentUser) {
      return { code: 404, message: 'Usuário não encontrado' };
    }

    const duplicatedLogin = await prisma.user.findFirst({
      where: {
        tenant_id: tenantId,
        name: normalizedLogin,
        id: { not: userId },
      },
      select: { id: true },
    });
    if (duplicatedLogin) {
      return { code: 400, message: 'Este login já está em uso neste tenant' };
    }

    if (
      currentUser.access_level === 'admin' &&
      accessLevel !== 'admin' &&
      (await this.countAdmins(tenantId)) <= 1
    ) {
      return {
        code: 400,
        message: 'O tenant precisa manter ao menos um administrador',
      };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: normalizedLogin,
        access_level: accessLevel,
        ...(password && { password: await bcrypt.hash(password, 10) }),
      },
      select: {
        id: true,
        name: true,
        access_level: true,
        created_at: true,
      },
    });

    return { code: 200, message: 'Usuário atualizado com sucesso', user };
  }

  async deleteUser(tenantId: number, userId: number) {
    if (
      !validateTenantId(tenantId) ||
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return { code: 400, message: 'Usuário ou tenant inválido' };
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, tenant_id: tenantId },
    });
    if (!user) {
      return { code: 404, message: 'Usuário não encontrado' };
    }

    if (
      user.access_level === 'admin' &&
      (await this.countAdmins(tenantId)) <= 1
    ) {
      return {
        code: 400,
        message: 'Não é possível excluir o único administrador do tenant',
      };
    }

    await prisma.user.delete({ where: { id: userId } });

    return { code: 200, message: 'Usuário excluído com sucesso' };
  }

  private countAdmins(tenantId: number) {
    return prisma.user.count({
      where: { tenant_id: tenantId, access_level: 'admin' },
    });
  }
}

export default new TenantUserDomain();
