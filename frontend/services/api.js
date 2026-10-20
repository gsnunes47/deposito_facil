const API_URL = process.env.NEXT_PUBLIC_APIURL;
export const SESSION_RENEWED_EVENT = 'session-renewed';

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

  const sessionExpiresAt = Number(
    response.headers.get('X-Session-Expires-At'),
  );

  if (
    Number.isFinite(sessionExpiresAt) &&
    typeof window !== 'undefined'
  ) {
    window.dispatchEvent(
      new CustomEvent(SESSION_RENEWED_EVENT, { detail: sessionExpiresAt }),
    );
  }

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
