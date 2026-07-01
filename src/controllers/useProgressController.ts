'use client'

import { useState, useCallback } from 'react'
import { ProgressRepository, type CreateProgressLogDTO } from '@/repositories/ProgressRepository'
import { toProgressVM, type ProgressLogViewModel } from '@/viewmodels'
import type { ProgressLog } from '@/types/fitness'
import { useToast } from '@/hooks/useToast'
import { mapApiErrorToToast } from '@/lib/apiFeedback'

export function useProgressController(challengeId?: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([])
  const { toast } = useToast()

  // Load progress logs for a specific challenge
  const loadProgress = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const logs = await ProgressRepository.listByChallenge(id)
      setProgressLogs(logs)
    } catch (err: any) {
      setError(err?.message || 'Failed to load progress')
      toast(mapApiErrorToToast(err, { action: 'load your progress' }))
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Log new progress entry
  const logProgress = useCallback(async (payload: CreateProgressLogDTO) => {
    try {
      setLoading(true)
      setError(null)
      
      const newLog = await ProgressRepository.create(payload)
      
      // Add to local state
      setProgressLogs(prev => [newLog, ...prev])
      
      toast({
        title: 'Progress logged!',
        description: `Added ${payload.value} ${payload.unit} to your progress`,
        variant: 'success'
      })
      
      return newLog
    } catch (err: any) {
      setError(err?.message || 'Failed to log progress')
      toast(mapApiErrorToToast(err, { action: 'log this progress entry' }))
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Update existing progress entry
  const updateProgress = useCallback(async (id: string, payload: Partial<CreateProgressLogDTO>) => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedLog = await ProgressRepository.update(id, payload)
      
      // Update local state
      setProgressLogs(prev => 
        prev.map(log => log.id === id ? updatedLog : log)
      )
      
      toast({
        title: 'Progress updated!',
        description: 'Your progress entry has been updated',
        variant: 'success'
      })
      
      return updatedLog
    } catch (err: any) {
      setError(err?.message || 'Failed to update progress')
      toast(mapApiErrorToToast(err, { action: 'update this progress entry' }))
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Delete progress entry
  const deleteProgress = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await ProgressRepository.delete(id)
      
      // Remove from local state
      setProgressLogs(prev => prev.filter(log => log.id !== id))
      
      toast({
        title: 'Progress deleted',
        description: 'Your progress entry has been removed',
        variant: 'success'
      })
    } catch (err: any) {
      setError(err?.message || 'Failed to delete progress')
      toast(mapApiErrorToToast(err, { action: 'delete this progress entry' }))
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Get total progress for current user
  const getTotalProgress = useCallback(async (userId: string, challengeId: string) => {
    try {
      return await ProgressRepository.getTotalProgress(challengeId, userId)
    } catch (err: any) {
      console.error('Error getting total progress:', err)
      return 0
    }
  }, [])

  // Get progress statistics
  const getProgressStats = useCallback(async (challengeId: string) => {
    try {
      return await ProgressRepository.getProgressStats(challengeId)
    } catch (err: any) {
      console.error('Error getting progress stats:', err)
      return {
        totalEntries: 0,
        totalValue: 0,
        averageValue: 0,
        uniqueUsers: 0,
      }
    }
  }, [])

  // Convert to view models
  const viewModels: ProgressLogViewModel[] = progressLogs.map(toProgressVM)

  return {
    // State
    loading,
    error,
    progressLogs,
    viewModels,
    
    // Actions
    loadProgress,
    logProgress,
    updateProgress,
    deleteProgress,
    getTotalProgress,
    getProgressStats,
  }
}
