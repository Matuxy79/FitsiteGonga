import apiClient from '@/lib/apiClient'
import type { ProgressLog } from '@/types/fitness'

const categoryFromApi: Record<string, string> = {
  STRENGTH: 'strength',
  CARDIO: 'cardio',
  NUTRITION: 'nutrition',
  CUSTOM: 'custom',
}

const typeFromApi: Record<string, string> = {
  DURATION: 'duration',
  REPETITION: 'repetition',
  DISTANCE: 'distance',
  CUSTOM: 'custom',
}

function normalizeProgressLog(raw: any): ProgressLog {
  const challenge = raw?.challenge
  if (challenge) {
    const categoryKey = String(challenge.category || '').toUpperCase()
    const typeKey = String(challenge.type || '').toUpperCase()
    raw = {
      ...raw,
      challenge: {
        ...challenge,
        category: categoryFromApi[categoryKey] || challenge.category,
        type: typeFromApi[typeKey] || challenge.type,
      },
    }
  }

  return raw as ProgressLog
}

export interface CreateProgressLogDTO {
  challenge_id: string
  value: number
  unit: string
  notes?: string
  photo_url?: string
}

export const ProgressRepository = {
  async listByChallenge(challengeId: string): Promise<ProgressLog[]> {
    const response = await apiClient.get<{ data: ProgressLog[] }>(`/api/progress?challengeId=${challengeId}`)
    return (response.data || []).map(normalizeProgressLog)
  },

  async listByUser(userId: string): Promise<ProgressLog[]> {
    const response = await apiClient.get<{ data: ProgressLog[] }>(`/api/progress?userId=${userId}`)
    return (response.data || []).map(normalizeProgressLog)
  },

  async create(payload: CreateProgressLogDTO): Promise<ProgressLog> {
    const response = await apiClient.post<{ data: ProgressLog }>('/api/progress', payload)
    return normalizeProgressLog(response.data)
  },

  async update(id: string, payload: Partial<CreateProgressLogDTO>): Promise<ProgressLog> {
    const response = await apiClient.put<{ data: ProgressLog }>(`/api/progress/${id}`, payload)
    return normalizeProgressLog(response.data)
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/progress/${id}`)
  },

  async getTotalProgress(challengeId: string, userId: string): Promise<number> {
    const logs = await this.listByChallenge(challengeId)
    return logs
      .filter(log => (log as any).user_id === userId)
      .reduce((sum, log) => sum + log.value, 0)
  },

  async getProgressStats(challengeId: string): Promise<{
    totalEntries: number
    totalValue: number
    averageValue: number
    uniqueUsers: number
  }> {
    const logs = await this.listByChallenge(challengeId)
    
    const totalEntries = logs.length
    const totalValue = logs.reduce((sum, log) => sum + log.value, 0)
    const averageValue = totalEntries > 0 ? totalValue / totalEntries : 0
    const uniqueUsers = new Set(logs.map(log => (log as any).user_id)).size

    return {
      totalEntries,
      totalValue,
      averageValue,
      uniqueUsers,
    }
  },
}
