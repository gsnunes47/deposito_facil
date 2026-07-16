import { apiRequest } from './api';

export function listarDespesas() {
  return apiRequest('/despesa');
}

export function cadastrarDespesa(despesa) {
  return apiRequest('/despesa', {
    method: 'POST',
    body: JSON.stringify(despesa),
  });
}

export function atualizarDespesa(id, despesa) {
  return apiRequest(`/despesa/${id}`, {
    method: 'PUT',
    body: JSON.stringify(despesa),
  });
}

export function excluirDespesa(id) {
  return apiRequest(`/despesa/${id}`, {
    method: 'DELETE',
  });
}
