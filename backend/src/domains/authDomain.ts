import type { Prisma } from '@prisma/client';
import prisma from '../repositories/db.js';
import bcrypt from 'bcrypt';

class authDomain {
  async login(UserInput: any) {
    try {
      const userQuery = {
        name: UserInput.login,
        tenant_id: parseInt(UserInput.tenantId),
      };

      const userDb = await prisma.user.findUnique({
        where: userQuery,
      });

      if (!userDb) {
        return {
          code: 400,
          message: 'Login ou senha inválidos',
        };
      }

      const passwordMatch = await bcrypt.compare(
        UserInput.password,
        userDb.password,
      );

      if (!passwordMatch) {
        return {
          code: 400,
          message: 'Login ou senha inválidos',
        };
      }

      return {
        code: 200,
        message: 'Login com sucesso',
        data: userDb,
      };
    } catch (error) {
      return {
        code: 400,
        message: 'Erro ao tentar fazer login',
        error: error,
      };
    }
  }
}

export default new authDomain();
