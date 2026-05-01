const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

export const api = {
  login: (credentials: any) => apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getProducts: () => apiFetch('/api/products'),
  createTransaction: (txn: any) => apiFetch('/api/transactions', { method: 'POST', body: JSON.stringify(txn) }),
};
