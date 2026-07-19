import { apiRequest } from './api';

export async function autenticar(tenantId, credenciais) {
  const resposta = await apiRequest(`/login/${tenantId}`, {
    method: 'POST',
    body: JSON.stringify(credenciais),
    redirectOnUnauthorized: false,
  });

  if (typeof window !== 'undefined') {
    window.localStorage.setItem('tenantId', String(resposta.tenantId));
  }

  return resposta;
}

export function verificarSessao() {
  return apiRequest('/session', { redirectOnUnauthorized: false });
}

export function obterRotaLogin() {
  if (typeof window === 'undefined') return '/login';

  const tenantId = window.localStorage.getItem('tenantId');
  return /^\d+$/.test(tenantId ?? '') ? `/login/${tenantId}` : '/login';
}
