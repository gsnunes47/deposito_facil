import prisma from '../repositories/db.js';

class ConfiguracaoDomain {
  async obter(tenantId: number) {
    return prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { listar_produtos: true },
    });
  }

  async salvar(tenantId: number, listarProdutos: boolean) {
    return prisma.tenants.update({
      where: { id: tenantId },
      data: { listar_produtos: listarProdutos },
      select: { listar_produtos: true },
    });
  }
}

export default new ConfiguracaoDomain();
