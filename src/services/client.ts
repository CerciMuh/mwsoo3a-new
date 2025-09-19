// Minimal API client using VITE_API_BASE_URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export async function apiGet<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const res = await fetch(url, { ...init, method: 'GET' });
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  if (!res.ok) {
    const body = await (isJson ? res.json().catch(() => ({})) : res.text().catch(() => '')) as any;
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    throw new Error(`GET ${url} failed: ${res.status} ${res.statusText} ${bodyStr}`);
  }
  return (isJson ? res.json() : (res.text() as unknown)) as Promise<T>;
}

export async function apiGetAuth<T = unknown>(path: string, token: string, extraHeaders?: Record<string,string>, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    ...(init?.headers || {}),
    ...(extraHeaders || {}),
    Authorization: `Bearer ${token}`,
  };
  return apiGet<T>(path, { ...init, headers });
}

export { BASE_URL };
