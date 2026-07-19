import { apiRequest } from './api';

export function autenticarAdmin(credenciais) {
  return apiRequest('/admin/login', {
    method: 'POST',
    body: JSON.stringify(credenciais),
    redirectOnUnauthorized: false,
  });
}

export function listarTenants() {
  return apiRequest('/admin/tenants', { redirectOnUnauthorized: false });
}

export function criarTenant(dados) {
  return apiRequest('/admin/tenants', {
    method: 'POST',
    body: JSON.stringify(dados),
    redirectOnUnauthorized: false,
  });
}

export function criarUsuarioTenant(tenantId, dados) {
  return apiRequest('/admin/tenants/' + tenantId + '/users', {
    method: 'POST',
    body: JSON.stringify(dados),
    redirectOnUnauthorized: false,
  });
}

export function atualizarUsuarioTenant(tenantId, userId, dados) {
  return apiRequest('/admin/tenants/' + tenantId + '/users/' + userId, {
    method: 'PATCH',
    body: JSON.stringify(dados),
    redirectOnUnauthorized: false,
  });
}

export function excluirUsuarioTenant(tenantId, userId) {
  return apiRequest('/admin/tenants/' + tenantId + '/users/' + userId, {
    method: 'DELETE',
    redirectOnUnauthorized: false,
  });
}
