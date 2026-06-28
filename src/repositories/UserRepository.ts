import apiClient from '@/lib/apiClient'
import type { User } from '@/types/fitness'

export interface UpdateProfileDTO {
  display_name?: string
  fitness_level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  goals?: string[]
}

export const UserRepository = {
  async getMe(): Promise<User> {
    const res = await apiClient.get<{ user: User }>('/api/users/me')
    return res.user
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
