import apiClient from '@/lib/apiClient'
import type { Challenge } from '@/types/fitness'

export const ChallengeRepository = {
  async list(): Promise<Challenge[]> {
    const response = await apiClient.get<{ data: Challenge[] }>('/api/challenges')
    return response.data || []
  },

  async create(payload: Omit<Challenge, 'id' | 'created_by' | 'participants' | 'created_at'>): Promise<Challenge> {
    const response = await apiClient.post<{ data: Challenge }>('/api/challenges', payload)
    return response.data
  },

  async join(challengeId: string, userId: string) {
    const response = await apiClient.post<{ data: Challenge }>(`/api/challenges/${challengeId}/join`)
    return response.data
  },

  async leave(challengeId: string, userId: string) {
    const response = await apiClient.post<{ data: Challenge }>(`/api/challenges/${challengeId}/leave`)
    return response.data
  },
}
