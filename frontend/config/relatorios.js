export const RELATORIOS = [
  {
    slug: 'contas-abertas',
    titulo: 'Contas em aberto',
    descricao:
      'Vendas ainda não quitadas, pagamentos recebidos e saldo por cliente.',
    criterio:
      'Considera a data da venda e somente vendas que continuam abertas.',
    endpoint: '/relatorios/contas-abertas',
    filtroCliente: true,
  },
  {
    slug: 'lucro',
    titulo: 'Resultado do período',
    descricao:
      'Vendas faturadas menos despesas operacionais e custos de encomendas.',
    criterio:
      'Usa a data de cada lançamento. Encomendas entram no custo mesmo quando ainda não foram pagas.',
    endpoint: '/relatorios/lucro',
  },
  {
    slug: 'resumo-vendas',
    titulo: 'Resumo de vendas',
    descricao:
      'Totais vendidos, valores faturados e vendas que continuam abertas.',
    criterio:
      'Considera a data da venda e a situação atual dela: quitada ou aberta.',
    endpoint: '/relatorios/resumo-vendas',
  },
  {
    slug: 'formas-pagamento',
    titulo: 'Recebimentos por forma de pagamento',
    descricao:
      'Valores recebidos, agrupados pela forma de pagamento.',
    criterio:
      'Considera a data em que cada pagamento foi registrado, não a data da venda.',
    endpoint: '/relatorios/formas-pagamento',
    filtroFormaPagamento: true,
  },
];

export function encontrarRelatorio(slug) {
  return RELATORIOS.find((relatorio) => relatorio.slug === slug);
}
