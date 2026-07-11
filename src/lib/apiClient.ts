/**
 * API Client - Replaces Supabase client
 * Handles HTTP requests to the backend API with JWT authentication
 */

let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
if (API_URL && !API_URL.startsWith('http') && !API_URL.startsWith('/')) {
  API_URL = `https://${API_URL}`;
}
// Strip trailing slashes for consistent concatenation
API_URL = API_URL.replace(/\/+$/, '');

/** Resolved backend origin with protocol, for use by other modules (e.g. XHR uploads). */
export { API_URL };

export interface ApiError {
  error: string;
  details?: any;
  message?: string;
  status?: number;
  meta?: any;
}

/**
 * Get access token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

/**
 * Get refresh token from localStorage (cross-origin fallback when httpOnly cookie isn't sent)
 */
function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

/**
 * Set auth tokens in localStorage
 */
export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
}

/**
 * Set refresh token in localStorage (cross-origin fallback)
 */
export function setRefreshToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  
  if (token) {
    localStorage.setItem('refreshToken', token);
  } else {
    localStorage.removeItem('refreshToken');
  }
}

let refreshPromise: Promise<boolean> | null = null;

/**
 * Attempt to refresh the access token.
 * Sends the refresh token in the request body as a cross-origin fallback
 * (httpOnly cookies may be blocked by third-party cookie policies).
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = getRefreshToken();
    const body: any = {};
    if (refreshToken) body.refreshToken = refreshToken;

    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) return false;

    const data = await response.json();
    if (!data?.accessToken) return false;

    setAuthToken(data.accessToken);
    if (data.refreshToken) setRefreshToken(data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

const AUTH_BOOTSTRAP_ENDPOINTS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/auth/logout'];

/**
 * Make HTTP request with authentication
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const token = getAuthToken();
  const url = `${API_URL}${endpoint}`;

  const headers = new Headers(options.headers);
  const isFormData = typeof window !== 'undefined' && options.body instanceof FormData;
  // Let the browser set the multipart boundary for FormData uploads.
  if (!isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies
    });
  } catch (err: any) {
    const error: ApiError = {
      error: 'Network error',
      message: err?.message || 'Failed to reach server',
      status: 0,
    };
    throw error;
  }

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    const text = await response.text();
    if (!response.ok) {
      const error: ApiError = {
        error: `HTTP ${response.status}`,
        message: text || response.statusText,
        status: response.status,
      };
      throw error;
    }
    return text as unknown as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const isAuthBootstrapEndpoint = AUTH_BOOTSTRAP_ENDPOINTS.includes(endpoint);
    if (response.status === 401 && !isRetry && !isAuthBootstrapEndpoint) {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const refreshed = await refreshPromise;
      if (refreshed) {
        return request<T>(endpoint, options, true);
      }
    }

    const error: ApiError = {
      error: data.error || 'Request failed',
      details: data.details,
      message: data.message,
      status: response.status,
      meta: data,
    };
    throw error;
  }

  return data;
}

export const apiClient = {
  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'GET' });
  },

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any): Promise<T> {
    return request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * POST request with multipart/form-data body (e.g. file uploads).
   */
  async postFormData<T>(endpoint: string, body: FormData): Promise<T> {
    return request<T>(endpoint, {
      method: 'POST',
      body,
    });
  },

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any): Promise<T> {
    return request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'DELETE' });
  },
};

export default apiClient;


