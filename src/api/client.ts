// Base URL — update this if your backend runs on a different host/port
export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

/**
 * Returns the stored JWT token (set after login).
 */
export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Persist token after a successful login.
 */
export function setToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

/**
 * Clear auth state on logout.
 */
export function clearToken(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

/**
 * A thin wrapper around fetch that:
 * - prepends API_BASE
 * - injects the Bearer token when available
 * - throws a descriptive error on non-2xx responses
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.message ?? body.error ?? message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  // 204 No Content — nothing to parse
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}
