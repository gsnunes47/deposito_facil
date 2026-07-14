import { apiRequest } from './api';

export function listarFornecedores() {
  return apiRequest('/fornecedor');
}

export function cadastrarFornecedor(fornecedor) {
  return apiRequest('/fornecedor', {
    method: 'POST',
    body: JSON.stringify(fornecedor),
  });
}

export function atualizarFornecedor(id, fornecedor) {
  return apiRequest(`/fornecedor/${id}`, {
    method: 'PUT',
    body: JSON.stringify(fornecedor),
  });
}

export function excluirFornecedor(id) {
  return apiRequest(`/fornecedor/${id}`, {
    method: 'DELETE',
  });
}
