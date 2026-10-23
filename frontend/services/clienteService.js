import { apiRequest } from './api.js';

export async function obterMensagemExclusaoCliente(cliente) {
  const vendas = await apiRequest('/venda/abertas');
  const saldos = vendas
    .filter((venda) => Number(venda.cliente_id) === Number(cliente.id))
    .map(
      (venda) =>
        Number(venda.total) -
        venda.pagamentos.reduce(
          (total, pagamento) => total + Number(pagamento.valor ?? 0),
          0,
        ),
    )
    .filter((saldo) => saldo > 0);

  if (saldos.length === 0) {
    return `Deseja realmente excluir cliente "${cliente.nome}"?\n\nTodas as vendas e os pagamentos desse cliente também serão excluídos permanentemente. Essa ação não pode ser desfeita.`;
  }

  const total = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(saldos.reduce((soma, saldo) => soma + saldo, 0) / 100);

  return `Atenção: o cliente "${cliente.nome}" possui ${saldos.length} conta(s) em aberto, com saldo total de ${total}.\n\nTodas as vendas (abertas e quitadas) e os pagamentos desse cliente serão excluídos permanentemente, junto com o cadastro. Essa ação não pode ser desfeita.\n\nDeseja realmente continuar com a exclusão?`;
}

export function listarClientes() {
  return apiRequest('/cliente');
}

export function cadastrarCliente(cliente) {
  return apiRequest('/cliente', {
    method: 'POST',
    body: JSON.stringify(cliente),
  });
}

export function atualizarCliente(id, cliente) {
  return apiRequest(`/cliente/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cliente),
  });
}

export function excluirCliente(id) {
  return apiRequest(`/cliente/${id}`, {
    method: 'DELETE',
  });
}
