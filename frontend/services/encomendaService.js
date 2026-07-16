import { apiRequest } from './api';

export function criarEncomenda(encomenda) {
  return apiRequest('/encomenda', {
    method: 'POST',
    body: JSON.stringify(encomenda),
  });
}

export function listarEncomendasAbertas() {
  return apiRequest('/encomenda/abertas');
}

export function listarEncomendasFechadas() {
  return apiRequest('/encomenda/fechadas');
}
