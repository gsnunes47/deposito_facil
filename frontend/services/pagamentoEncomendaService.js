import { apiRequest } from './api';

export function registrarPagamentoEncomenda(pagamento) {
  return apiRequest('/pagamentoEncomenda', {
    method: 'POST',
    body: JSON.stringify(pagamento),
  });
}

export function excluirPagamentoEncomenda(id) {
  return apiRequest(`/pagamentoEncomenda/${id}`, {
    method: 'DELETE',
  });
}
