import apiClient from '@/lib/apiClient'
import { setAuthToken } from '@/lib/apiClient'
import type { User as FitnessUser } from '@/types/fitness'

export interface RegisterDTO {
  email: string
  password: string
  display_name: string
}

export interface LoginDTO {
  email: string
  password: string
}

export interface AuthResponse {
  user: FitnessUser
  accessToken: string
  refreshToken: string
}

export type User = FitnessUser

type RawAuthResponse = {
  user: RawUser
  accessToken: string
  refreshToken: string
}

interface RawUser {
  id: string
  email: string
  display_name: string
  avatar_url?: string
  role?: 'CLIENT' | 'TRAINER' | 'ADMIN' | string
  fitness_level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | string
  goals?: string[]
  created_at: string
  updated_at?: string
}

const roleMap: Record<string, FitnessUser['role']> = {
  CLIENT: 'CLIENT',
  TRAINER: 'TRAINER',
  ADMIN: 'ADMIN',
}

const levelMap: Record<string, FitnessUser['fitness_level']> = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
}

function normalizeUser(raw: RawUser): FitnessUser {
  const normalizedRole = roleMap[raw.role?.toUpperCase() || ''] || 'CLIENT'
  const normalizedLevel = levelMap[raw.fitness_level?.toUpperCase() || ''] || 'BEGINNER'
  return {
    id: raw.id,
    email: raw.email,
    display_name: raw.display_name,
    avatar_url: raw.avatar_url,
    role: normalizedRole,
    fitness_level: normalizedLevel,
    goals: raw.goals || [],
    created_at: raw.created_at,
    updated_at: raw.updated_at || raw.created_at,
  }
}

function extractAuthResponse(response: any): AuthResponse {
  const payload: RawAuthResponse = response?.data || response
  return {
    ...payload,
    user: normalizeUser(payload.user),
  }
}

export const AuthRepository = {
  /**
   * Register new user
   */
  async register(data: RegisterDTO): Promise<AuthResponse> {
    const response = await apiClient.post<{ data: RawAuthResponse }>('/api/auth/register', data)
    const authData = extractAuthResponse(response)

    setAuthToken(authData.accessToken)
    return authData
  },

  /**
   * Login user
   */
  async login(data: LoginDTO): Promise<AuthResponse> {
    const response = await apiClient.post<{ data: RawAuthResponse }>('/api/auth/login', data)
    const authData = extractAuthResponse(response)

    setAuthToken(authData.accessToken)
    return authData
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ accessToken: string }> {
    const response = await apiClient.post<{ data: { accessToken: string } }>('/api/auth/refresh')
    const payload = response.data || response

    setAuthToken(payload.accessToken)
    return payload
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout')
    } finally {
      setAuthToken(null)
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ data: { user: RawUser } }>('/api/auth/me')
    const payload = response.data || response
    return normalizeUser(payload.user)
  },

}
