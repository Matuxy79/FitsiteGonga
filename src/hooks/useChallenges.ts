'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChallengeRepository } from '@/repositories/ChallengeRepository'
import type { Challenge } from '@/types/fitness'

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ChallengeRepository.list()
      setChallenges(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch challenges')
      console.error('Error fetching challenges:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChallenges()
  }, [fetchChallenges])

  const createChallenge = useCallback(async (
    challengeData: Omit<Challenge, 'id' | 'created_by' | 'participants' | 'created_at'>
  ) => {
    try {
      const newChallenge = await ChallengeRepository.create(challengeData)
      setChallenges(prev => [newChallenge, ...prev])
      return newChallenge
    } catch (err: any) {
      setError(err?.message || 'Failed to create challenge')
      throw err
    }
  }, [])

  const joinChallenge = useCallback(async (challengeId: string) => {
    try {
      const updatedChallenge = await ChallengeRepository.join(challengeId)
      setChallenges(prev => prev.map(challenge => 
        challenge.id === updatedChallenge.id ? updatedChallenge : challenge
      ))
      return updatedChallenge
    } catch (err: any) {
      setError(err?.message || 'Failed to join challenge')
      throw err
    }
  }, [])

  const leaveChallenge = useCallback(async (challengeId: string) => {
    try {
      const updatedChallenge = await ChallengeRepository.leave(challengeId)
      setChallenges(prev => prev.map(challenge => 
        challenge.id === updatedChallenge.id ? updatedChallenge : challenge
      ))
      return updatedChallenge
    } catch (err: any) {
      setError(err?.message || 'Failed to leave challenge')
      throw err
    }
  }, [])

  return {
    challenges,
    loading,
    error,
    fetchChallenges,
    createChallenge,
    joinChallenge,
    leaveChallenge,
  }
}
