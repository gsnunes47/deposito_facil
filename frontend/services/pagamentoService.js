import { apiRequest } from './api';

export function registrarPagamento(pagamento) {
  return apiRequest('/pagamento', {
    method: 'POST',
    body: JSON.stringify(pagamento),
  });
}

export function excluirPagamento(id) {
  return apiRequest(`/pagamento/${id}`, {
    method: 'DELETE',
  });
}

export function quitarVendas(vendaIds, formaPagamento) {
  return apiRequest('/pagamento/quitar-vendas', {
    method: 'POST',
    body: JSON.stringify({
      venda_ids: vendaIds,
      forma_pagamento: formaPagamento,
    }),
  });
}
