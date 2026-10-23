import { apiRequest } from './api';

export function obterConfiguracoes() {
  return apiRequest('/configuracoes');
}

export function salvarConfiguracoes(configuracoes) {
  return apiRequest('/configuracoes', {
    method: 'PUT',
    body: JSON.stringify(configuracoes),
  });
}
