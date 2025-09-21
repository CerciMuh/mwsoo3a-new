// Minimal API client using VITE_API_BASE_URL
const isDev = !!import.meta.env.DEV;
const DEFAULT_DEV_BASE = 'http://localhost:5000'; // Changed from 4000 to 5000 for clean architecture backend
const BASE_URL = import.meta.env.VITE_API_BASE_URL || (isDev ? DEFAULT_DEV_BASE : '');

export async function apiGet<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not set; cannot call API in production');
  }
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

export async function apiPost<T = unknown>(path: string, body?: any, init?: RequestInit): Promise<T> {
  if (!BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not set; cannot call API in production');
  }
  const url = `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const res = await fetch(url, { 
    ...init, 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  if (!res.ok) {
    const body = await (isJson ? res.json().catch(() => ({})) : res.text().catch(() => '')) as any;
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    throw new Error(`POST ${url} failed: ${res.status} ${res.statusText} ${bodyStr}`);
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

export async function apiPostAuth<T = unknown>(path: string, token: string, body?: any, extraHeaders?: Record<string,string>, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    ...(extraHeaders || {}),
    Authorization: `Bearer ${token}`,
  };
  return apiPost<T>(path, body, { ...init, headers });
}

export { BASE_URL };
