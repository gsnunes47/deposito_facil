import { apiRequest } from './api';

export function gerarRelatorio(endpoint, filtros) {
  const parametros = new URLSearchParams();

  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor) parametros.set(chave, valor);
  });

  return apiRequest(`${endpoint}?${parametros.toString()}`);
}
