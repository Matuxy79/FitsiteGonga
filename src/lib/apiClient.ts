/**
 * API Client - Replaces Supabase client
 * Handles HTTP requests to Railway backend with JWT authentication
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ApiError {
  error: string;
  details?: any;
  message?: string;
}

/**
 * Get auth token from cookie or localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try to get from cookie first (httpOnly cookies aren't accessible via JS)
  // If using httpOnly cookies, backend handles it automatically
  // For localStorage fallback (mobile clients):
  const token = localStorage.getItem('accessToken');
  return token;
}

/**
 * Set auth token in localStorage (fallback for mobile)
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
 * Make HTTP request with authentication
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const url = `${API_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies
  });

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.text() as unknown as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const error: ApiError = {
      error: data.error || 'Request failed',
      details: data.details,
      message: data.message,
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
   * PUT request
   */
  async put<T>(endpoint: string, body?: any): Promise<T> {
    return request<T>(endpoint, {
      method: 'PUT',
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


