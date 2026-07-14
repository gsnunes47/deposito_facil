import { apiRequest } from './api';

export function listarProdutos() {
  return apiRequest('/produtos');
}

export function cadastrarProduto(nome) {
  return apiRequest('/produtos', {
    method: 'POST',
    body: JSON.stringify({ nome }),
  });
}

export function atualizarProduto(id, produto) {
  return apiRequest(`/produtos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(produto),
  });
}

export function excluirProduto(id) {
  return apiRequest(`/produtos/${id}`, {
    method: 'DELETE',
  });
}
