import prisma from '../repositories/db.js';
import type { TipoItem } from '@prisma/client';

interface produtoInterface {
  id: number;
  nome: string;
  quantidade: number;
  tenant_id: number;
  tipo: TipoItem;
  preco_padrao: number | null;
}

interface updateProdutoInterface {
  id: number;
  nome?: string;
  quantidade?: number;
  tenant_id: number;
  tipo?: TipoItem;
  preco_padrao?: number | null;
}

class ProdutoDomain {
  async createProduto(
    name: string,
    tenant_id: number,
    tipo: TipoItem = 'PRODUTO',
    preco_padrao: number | null = null,
  ) {
    try {
      const produto = await prisma.produto.create({
        data: {
          nome: name,
          tenant_id: tenant_id,
          tipo,
          preco_padrao,
        },
      });

      return {
        code: 200,
        message: 'Produto created successfully',
        produto_id: produto.id,
      };
    } catch (error) {
      return {
        code: 400,
        message: 'Error creating produto',
        error: error,
      };
    }
  }

  async getProdutos(tenantId: number) {
    const produtos = await prisma.produto.findMany({
      where: {
        tenant_id: tenantId,
      },
      orderBy: {
        nome: 'asc',
      },
      select: {
        id: true,
        nome: true,
        quantidade: true,
        tipo: true,
        preco_padrao: true,
      },
    });

    return produtos;
  }

  async getProdutoById(produtoId: number, tenantId: number) {
    const produto = await prisma.produto.findFirst({
      where: {
        id: produtoId,
        tenant_id: tenantId,
      },
    });

    return produto;
  }

  async deleteProduto(produtoId: number, tenantId: number) {
    const produto = await this.getProdutoById(produtoId, tenantId);

    if (!produto) {
      return {
        code: 400,
        message: 'Produto não encontrado',
      };
    }

    const delProduto = await prisma.produto.delete({
      where: {
        id: produtoId,
        tenant_id: tenantId,
      },
    });

    return {
      code: 200,
      message: `Produto ${delProduto.id} - ${delProduto.nome} deletado com sucesso`,
    };
  }

  async updateProduto(produto: updateProdutoInterface) {
    const existingProduto = await this.getProdutoById(
      produto.id,
      produto.tenant_id,
    );

    if (!existingProduto) {
      return {
        code: 400,
        message: 'Produto não encontrado',
      };
    }

    const updatedProduto = await prisma.produto.update({
      where: {
        id: produto.id,
        tenant_id: produto.tenant_id,
      },
      data: {
        ...(produto.nome !== undefined && {
          nome: produto.nome,
        }),
        ...(produto.quantidade !== undefined && {
          // ... se a condição for verdadeira, adiciona o trecho abaixo, se for falsa não adiciona.
          quantidade: produto.quantidade,
        }),
        ...(produto.tipo !== undefined && { tipo: produto.tipo }),
        ...(produto.preco_padrao !== undefined && {
          preco_padrao: produto.preco_padrao,
        }),
      },
    });

    return {
      code: 200,
      message: 'Produto atualizado com sucesso',
      produto: updatedProduto as produtoInterface,
    };
  }
}

export default new ProdutoDomain();
export type { produtoInterface };
