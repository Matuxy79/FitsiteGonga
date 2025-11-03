import apiClient from '@/lib/apiClient';
import { setAuthToken } from '@/lib/apiClient';

export interface RegisterDTO {
  email: string;
  password: string;
  display_name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  role: 'CLIENT' | 'TRAINER' | 'ADMIN';
  fitness_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  goals: string[];
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const AuthRepository = {
  /**
   * Register new user
   */
  async register(data: RegisterDTO): Promise<AuthResponse> {
    const response = await apiClient.post<{ data: AuthResponse }>('/api/auth/register', data);
    const authData = response.data || response;
    
    // Store token in localStorage (fallback for mobile)
    setAuthToken(authData.accessToken);
    
    return authData;
  },

  /**
   * Login user
   */
  async login(data: LoginDTO): Promise<AuthResponse> {
    const response = await apiClient.post<{ data: AuthResponse }>('/api/auth/login', data);
    const authData = response.data || response;
    
    // Store token in localStorage (fallback for mobile)
    setAuthToken(authData.accessToken);
    
    return authData;
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ accessToken: string }> {
    const response = await apiClient.post<{ data: { accessToken: string } }>('/api/auth/refresh');
    const data = response.data || response;
    
    setAuthToken(data.accessToken);
    
    return data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      // Always clear token even if request fails
      setAuthToken(null);
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ data: { user: User } }>('/api/auth/me');
    return (response as any).data?.user || response;
  },
};


