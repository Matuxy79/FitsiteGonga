'use client';

import { useState, useEffect } from 'react';
import { AuthRepository, type User } from '@/repositories/AuthRepository';
import { setAuthToken } from '@/lib/apiClient';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load current user on mount
   */
  useEffect(() => {
    refreshUser();
  }, []);

  /**
   * Login user
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await AuthRepository.login({ email, password });
      setUser(response.user);
    } catch (err: any) {
      setError(err.error || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (email: string, password: string, displayName: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await AuthRepository.register({ email, password, display_name: displayName });
      setUser(response.user);
    } catch (err: any) {
      setError(err.error || 'Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    try {
      await AuthRepository.logout();
    } catch (err) {
      // Ignore logout errors, still clear user state
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setAuthToken(null);
    }
  };

  /**
   * Refresh current user data
   */
  const refreshUser = async (): Promise<void> => {
    try {
      setLoading(true);
      const user = await AuthRepository.getCurrentUser();
      setUser(user);
      setError(null);
    } catch (err: any) {
      // Not authenticated - clear user
      setUser(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
  };
}


