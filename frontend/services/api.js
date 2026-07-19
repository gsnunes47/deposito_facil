const API_URL = process.env.NEXT_PUBLIC_APIURL;

export async function apiRequest(path, options = {}) {
  const { redirectOnUnauthorized = true, ...fetchOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (
      response.status === 401 &&
      redirectOnUnauthorized &&
      typeof window !== 'undefined'
    ) {
      const tenantId = window.localStorage.getItem('tenantId');
      const loginPath = /^\d+$/.test(tenantId ?? '')
        ? `/login/${tenantId}`
        : '/login';
      window.location.assign(loginPath);
    }

    const message =
      data?.error || data?.message || 'Não foi possível concluir a operação.';

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}
