import { apiRequest } from './api';

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
