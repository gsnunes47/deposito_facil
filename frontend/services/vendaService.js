import { apiRequest } from './api';

export function criarVenda(venda) {
  return apiRequest('/venda', {
    method: 'POST',
    body: JSON.stringify(venda),
  });
}

export function listarVendasAbertas() {
  return apiRequest('/venda/abertas');
}

export function listarVendasFechadas() {
  return apiRequest('/venda/fechadas');
}

export function excluirVenda(id) {
  return apiRequest(`/venda/${id}`, {
    method: 'DELETE',
  });
}
