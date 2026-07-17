import prisma from '../repositories/db.js';

interface ProdutoEstoque {
  id: number;
  nome: string;
  quantidade: number | null;
}

function formatarItens(
  valor: unknown,
  produtosPorId: Map<number, ProdutoEstoque>,
) {
  if (!Array.isArray(valor)) return [];

  return valor.map((item) => {
    const dados = item as Record<string, unknown>;
    const produtoId = Number(dados.id);
    const quantidade = Number(dados.quantidade ?? 0);
    const valorUnitario = Number(dados.valor_unitario ?? 0);

    return {
      produto_id: produtoId,
      produto: produtosPorId.get(produtoId)?.nome ?? `Produto #${produtoId}`,
      quantidade,
      valor_unitario: valorUnitario,
      total_item: quantidade * valorUnitario,
    };
  });
}

class EstoqueDomain {
  async getVisaoEstoque(tenantId: number) {
    const [produtos, entradas, saidas] = await Promise.all([
      prisma.produto.findMany({
        where: {
          tenant_id: tenantId,
        },
        select: {
          id: true,
          nome: true,
          quantidade: true,
        },
        orderBy: {
          nome: 'asc',
        },
      }),
      prisma.encomenda.findMany({
        where: {
          tenant_id: tenantId,
        },
        select: {
          id: true,
          data: true,
          produtos: true,
          total: true,
          pago: true,
          fornecedor: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
        orderBy: {
          data: 'desc',
        },
        take: 10,
      }),
      prisma.venda.findMany({
        where: {
          tenant_id: tenantId,
        },
        select: {
          id: true,
          data: true,
          produtos: true,
          total: true,
          pago: true,
          cliente: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
        orderBy: {
          data: 'desc',
        },
        take: 10,
      }),
    ]);

    const produtosNormalizados = produtos.map((produto) => ({
      ...produto,
      quantidade: produto.quantidade ?? 0,
    }));
    const produtosPorId = new Map(
      produtos.map((produto) => [produto.id, produto]),
    );

    return {
      resumo: {
        produtos_cadastrados: produtosNormalizados.length,
        total_unidades: produtosNormalizados.reduce(
          (total, produto) => total + produto.quantidade,
          0,
        ),
        produtos_esgotados: produtosNormalizados.filter(
          (produto) => produto.quantidade <= 0,
        ).length,
      },
      produtos: produtosNormalizados,
      entradas: entradas.map((entrada) => ({
        id: entrada.id,
        data: entrada.data,
        fornecedor_id: entrada.fornecedor.id,
        fornecedor:
          entrada.fornecedor.nome ?? `Fornecedor #${entrada.fornecedor.id}`,
        itens: formatarItens(entrada.produtos, produtosPorId),
        total: entrada.total,
        pago: entrada.pago,
      })),
      saidas: saidas.map((saida) => ({
        id: saida.id,
        data: saida.data,
        cliente_id: saida.cliente.id,
        cliente: saida.cliente.nome ?? `Cliente #${saida.cliente.id}`,
        itens: formatarItens(saida.produtos, produtosPorId),
        total: saida.total,
        pago: saida.pago,
      })),
    };
  }
}

export default new EstoqueDomain();
