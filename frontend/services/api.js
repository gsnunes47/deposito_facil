const API_URL = process.env.NEXT_PUBLIC_APIURL;

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.error || data?.message || 'Não foi possível concluir a operação.';

    throw new Error(message);
  }

  return data;
}
