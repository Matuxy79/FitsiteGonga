'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ProgressLog, RealtimeEvent } from '@/types/fitness'

export function useRealtimeProgress(challengeId?: string) {
  const [progressUpdates, setProgressUpdates] = useState<ProgressLog[]>([])
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([])

  useEffect(() => {
    if (!challengeId) return

    // Subscribe to progress logs for the specific challenge
    const progressChannel = supabase
      .channel(`progress-${challengeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'progress_logs',
          filter: `challenge_id=eq.${challengeId}`
        },
        (payload) => {
          console.log('New progress logged:', payload)
          
          // Add the new progress to our updates
          setProgressUpdates(prev => [payload.new as ProgressLog, ...prev])
          
          // Create a realtime event
          const event: RealtimeEvent = {
            type: 'progress_logged',
            user_id: payload.new.user_id,
            challenge_id: payload.new.challenge_id,
            value: payload.new.value,
            timestamp: new Date().toISOString()
          }
          
          setRealtimeEvents(prev => [event, ...prev.slice(0, 9)]) // Keep last 10 events
        }
      )
      .subscribe()

    // Subscribe to achievement events
    const achievementChannel = supabase
      .channel(`achievements`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements'
        },
        (payload) => {
          console.log('New achievement earned:', payload)
          
          // Create achievement event
          const event: RealtimeEvent = {
            type: 'achievement_earned',
            user_id: payload.new.user_id,
            achievement_id: payload.new.achievement_id,
            achievement_name: 'New Achievement', // Would need to fetch from achievements table
            timestamp: new Date().toISOString()
          }
          
          setRealtimeEvents(prev => [event, ...prev.slice(0, 9)])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(progressChannel)
      supabase.removeChannel(achievementChannel)
    }
  }, [challengeId])

  return {
    progressUpdates,
    realtimeEvents,
    clearUpdates: () => setProgressUpdates([]),
    clearEvents: () => setRealtimeEvents([])
  }
}
