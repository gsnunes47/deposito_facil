import { apiRequest } from './api';

export function autenticar(tenantId, credenciais) {
  return apiRequest(`/login/${tenantId}`, {
    method: 'POST',
    body: JSON.stringify(credenciais),
  });
}
