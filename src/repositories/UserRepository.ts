import apiClient, { setAuthToken } from '@/lib/apiClient'
import type { User } from '@/types/fitness'

export interface UpdateProfileDTO {
  display_name?: string
  fitness_level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  goals?: string[]
}

export interface UpdatePlanResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export const UserRepository = {
  async getMe(): Promise<User> {
    const res = await apiClient.get<{ user: User }>('/api/users/me')
    return res.user
  },

  async updatePlan(membership_tier: 'FREE' | 'PAID'): Promise<UpdatePlanResponse> {
    const res = await apiClient.patch<UpdatePlanResponse>('/api/users/me/plan', { membership_tier })
    setAuthToken(res.accessToken)
    return res
  },

  async redeemCode(code: string): Promise<UpdatePlanResponse> {
    const res = await apiClient.post<UpdatePlanResponse>('/api/users/me/redeem-code', { code })
    setAuthToken(res.accessToken)
    return res
  },

  async updateProfile(data: UpdateProfileDTO): Promise<User> {
    const res = await apiClient.patch<{ user: User }>('/api/users/me', data)
    return res.user
  },

  async uploadAvatar(file: File): Promise<{ user: User; key: string }> {
    const formData = new FormData()
    formData.append('avatar', file)

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/users/me/avatar`, {
      method: 'POST',
      body: formData,
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` },
    })
    if (!res.ok) throw new Error('Failed to upload avatar')
    return res.json()
  },
}
