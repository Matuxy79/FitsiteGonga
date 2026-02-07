import apiClient from '@/lib/apiClient'
import type { Challenge } from '@/types/fitness'

type CategoryIn = Challenge['category']
type TypeIn = Challenge['type']
type CreateChallengePayload = Omit<Challenge, 'id' | 'created_by' | 'participants' | 'created_at'>
type ApiCreateChallengePayload = Omit<CreateChallengePayload, 'category' | 'type'> & {
  category: string
  type: string
}

const categoryFromApi: Record<string, CategoryIn> = {
  STRENGTH: 'strength',
  CARDIO: 'cardio',
  NUTRITION: 'nutrition',
  CUSTOM: 'custom',
}

const typeFromApi: Record<string, TypeIn> = {
  DURATION: 'duration',
  REPETITION: 'repetition',
  DISTANCE: 'distance',
  CUSTOM: 'custom',
}

const categoryToApi: Record<CategoryIn, string> = {
  strength: 'STRENGTH',
  cardio: 'CARDIO',
  nutrition: 'NUTRITION',
  custom: 'CUSTOM',
}

const typeToApi: Record<TypeIn, string> = {
  duration: 'DURATION',
  repetition: 'REPETITION',
  distance: 'DISTANCE',
  custom: 'CUSTOM',
}

function normalizeChallenge(raw: any): Challenge {
  const categoryKey = String(raw?.category || '').toUpperCase()
  const typeKey = String(raw?.type || '').toUpperCase()

  return {
    ...raw,
    category: categoryFromApi[categoryKey] || 'custom',
    type: typeFromApi[typeKey] || 'custom',
  }
}

function toApiChallengePayload(payload: CreateChallengePayload): ApiCreateChallengePayload {
  return {
    ...payload,
    category: categoryToApi[payload.category] || payload.category,
    type: typeToApi[payload.type] || payload.type,
  }
}

export const ChallengeRepository = {
  async list(): Promise<Challenge[]> {
    const response = await apiClient.get<{ data: Challenge[] }>('/api/challenges')
    return (response.data || []).map(normalizeChallenge)
  },

  async create(payload: CreateChallengePayload): Promise<Challenge> {
    const response = await apiClient.post<{ data: Challenge }>('/api/challenges', toApiChallengePayload(payload))
    return normalizeChallenge(response.data)
  },

  async join(challengeId: string) {
    const response = await apiClient.post<{ data: Challenge }>(`/api/challenges/${challengeId}/join`)
    return normalizeChallenge(response.data)
  },

  async leave(challengeId: string) {
    const response = await apiClient.post<{ data: Challenge }>(`/api/challenges/${challengeId}/leave`)
    return normalizeChallenge(response.data)
  },
}
