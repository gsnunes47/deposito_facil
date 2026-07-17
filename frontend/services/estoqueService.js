import { apiRequest } from './api';

export function buscarEstoque() {
  return apiRequest('/estoque');
}
