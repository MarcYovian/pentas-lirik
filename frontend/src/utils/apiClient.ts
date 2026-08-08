/**
 * Centralized API Client & HTTP 401 Unauthorized Interceptor for PentasLirik
 */

export const AUTH_UNAUTHORIZED_EVENT = 'pentaslirik:unauthorized';

/**
 * Clears stored authentication credentials from localStorage
 */
export function clearAuthCredentials() {
  localStorage.removeItem('pentaslirik_token');
  localStorage.removeItem('pentaslirik_user');
}

/**
 * Retrieves the currently saved token from localStorage
 */
export function getStoredToken(): string | null {
  return localStorage.getItem('pentaslirik_token');
}

/**
 * Unified fetch wrapper that attaches Bearer tokens and handles HTTP 401 responses.
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(url, mergedOptions);

  if (response.status === 401) {
    clearAuthCredentials();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(AUTH_UNAUTHORIZED_EVENT, {
          detail: { message: 'Session expired or invalidated. Please sign in again.' },
        })
      );
    }
  }

  return response;
}

export const apiClient = {
  fetch: apiFetch,

  async get<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    const res = await apiFetch(url, { ...options, method: 'GET' });
    return res.json();
  },

  async post<T = any>(url: string, body?: any, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    if (body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await apiFetch(url, {
      ...options,
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  },

  async put<T = any>(url: string, body?: any, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    if (body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await apiFetch(url, {
      ...options,
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  },

  async delete<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    const res = await apiFetch(url, { ...options, method: 'DELETE' });
    return res.json();
  },
};
