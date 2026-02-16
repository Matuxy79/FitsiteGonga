import { useState, useEffect, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { initSocket } from '@/lib/socketClient'

// =============================================================================
// API BASE
// =============================================================================

const RAW_API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const API_ORIGIN = RAW_API_ORIGIN.replace(/\/+$/, '')
const API_BASE = API_ORIGIN.endsWith('/api') ? API_ORIGIN : `${API_ORIGIN}/api`

const WS_ORIGIN = (process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_SOCKET_URL || API_ORIGIN)
  .replace(/\/+$/, '')
  .replace(/\/api$/, '')

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }
  
  return response.json()
}

// =============================================================================
// LIFT TRACKING HOOKS
// =============================================================================

export interface TrackedLift {
  id: string
  exerciseId: string
  exerciseName: string
  workingWeight: number
  workingUnit: 'LBS' | 'KG'
  oneRepMax: number | null
  goalWeight: number | null
  goalDate: string | null
  isActive: boolean
  displayOrder: number
  bestSet: {
    weight: number
    reps: number
    estimated1RM: number
    date: string
  } | null
  lastSet: {
    weight: number
    reps: number
    date: string
    formatted: string
  } | null
  trend: 'up' | 'down' | 'stable'
  totalSets: number
}

export interface SetLog {
  id: string
  weight: number
  reps: number
  unit: 'LBS' | 'KG'
  rpe: number | null
  tempo: string | null
  restTime: number | null
  setNumber: number | null
  isWarmup: boolean
  isPr: boolean
  estimated1rm: number | null
  volume: number | null
  notes: string | null
  loggedAt: string
}

export function useTrackedLifts() {
  const [lifts, setLifts] = useState<TrackedLift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLifts = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchWithAuth('/lifts')
      setLifts(data.lifts)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLifts()
  }, [loadLifts])

  const addLift = useCallback(async (lift: {
    exerciseId: string
    exerciseName: string
    workingWeight: number
    workingUnit?: 'LBS' | 'KG'
    goalWeight?: number
    goalDate?: string
  }) => {
    const data = await fetchWithAuth('/lifts', {
      method: 'POST',
      body: JSON.stringify(lift),
    })
    setLifts(prev => [...prev, data.lift])
    return data.lift
  }, [])

  const updateLift = useCallback(async (liftId: string, updates: Partial<TrackedLift>) => {
    const data = await fetchWithAuth(`/lifts/${liftId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
    setLifts(prev => prev.map(l => l.id === liftId ? { ...l, ...data.lift } : l))
    return data.lift
  }, [])

  const removeLift = useCallback(async (liftId: string) => {
    await fetchWithAuth(`/lifts/${liftId}`, { method: 'DELETE' })
    setLifts(prev => prev.filter(l => l.id !== liftId))
  }, [])

  const reorderLifts = useCallback(async (orderedIds: string[]) => {
    // Optimistic update
    setLifts(prev => {
      const liftMap = new Map(prev.map(l => [l.id, l]))
      return orderedIds.map((id, idx) => ({
        ...liftMap.get(id)!,
        displayOrder: idx,
      }))
    })
    
    // Sync with server
    await Promise.all(
      orderedIds.map((id, idx) =>
        fetchWithAuth(`/lifts/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ displayOrder: idx }),
        })
      )
    )
  }, [])

  return {
    lifts,
    loading,
    error,
    loadLifts,
    addLift,
    updateLift,
    removeLift,
    reorderLifts,
  }
}

export function useLiftSession(liftId: string | null) {
  const [history, setHistory] = useState<SetLog[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadHistory = useCallback(async () => {
    if (!liftId) return
    
    try {
      setLoading(true)
      const data = await fetchWithAuth(`/lifts/${liftId}/history?limit=50`)
      setHistory(data.sets)
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoading(false)
    }
  }, [liftId])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const logSet = useCallback(async (set: {
    weight: number
    reps: number
    unit?: 'LBS' | 'KG'
    rpe?: number
    tempo?: string
    restTime?: number
    setNumber?: number
    isWarmup?: boolean
    notes?: string
  }) => {
    if (!liftId) throw new Error('No lift selected')
    
    setSaving(true)
    try {
      const data = await fetchWithAuth(`/lifts/${liftId}/sets`, {
        method: 'POST',
        body: JSON.stringify(set),
      })
      setHistory(prev => [data.setLog, ...prev])
      return data
    } finally {
      setSaving(false)
    }
  }, [liftId])

  const logSession = useCallback(async (session: {
    exerciseId: string
    sets: Array<{
      weight: number
      reps: number
      unit?: 'LBS' | 'KG'
      rpe?: number
      isWarmup?: boolean
      notes?: string
    }>
    notes?: string
    startTime: string
    endTime: string
  }) => {
    setSaving(true)
    try {
      const data = await fetchWithAuth('/lifts/session', {
        method: 'POST',
        body: JSON.stringify(session),
      })
      // Refresh history
      await loadHistory()
      return data
    } finally {
      setSaving(false)
    }
  }, [loadHistory])

  const deleteSet = useCallback(async (setId: string) => {
    if (!liftId) return
    
    await fetchWithAuth(`/lifts/${liftId}/sets/${setId}`, { method: 'DELETE' })
    setHistory(prev => prev.filter(s => s.id !== setId))
  }, [liftId])

  return {
    history,
    loading,
    saving,
    loadHistory,
    logSet,
    logSession,
    deleteSet,
  }
}

export function useLiftAnalytics(liftId: string | null) {
  const [analytics, setAnalytics] = useState<{
    totalSets: number
    totalVolume: number
    currentE1RM: number | null
    prCount: number
    prProgression: Array<{
      date: string
      weight: number
      reps: number
      estimated1RM: number
    }>
    weeklyVolume: Array<{ week: string; volume: number }>
    averageRPE: number | null
    repDistribution: Record<string, number>
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const loadAnalytics = useCallback(async () => {
    if (!liftId) return
    
    try {
      setLoading(true)
      const data = await fetchWithAuth(`/lifts/${liftId}/analytics`)
      setAnalytics(data.analytics)
    } catch (err) {
      console.error('Failed to load analytics:', err)
    } finally {
      setLoading(false)
    }
  }, [liftId])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  return { analytics, loading, loadAnalytics }
}

// =============================================================================
// MESSAGING HOOKS
// =============================================================================

export interface Message {
  id: string
  content: string
  senderId: string
  sender: {
    id: string
    displayName: string
    avatarUrl: string | null
    role: string
  }
  channelType: 'GLOBAL' | 'SQUAD' | 'DIRECT' | 'TRAINER'
  squadId: string | null
  recipientId: string | null
  parentId: string | null
  mediaUrls: string[]
  isEdited: boolean
  editedAt: string | null
  isDeleted: boolean
  createdAt: string
  reactions: Array<{
    id: string
    userId: string
    emoji: string
    user: { id: string; displayName: string }
  }>
  reactionSummary?: Record<string, { count: number; hasReacted: boolean }>
  _count?: { replies: number }
}

export interface Squad {
  id: string
  name: string
  description: string | null
  avatarUrl: string | null
  ownerId: string
  visibility: 'PUBLIC' | 'INVITE_ONLY' | 'PRIVATE'
  maxMembers: number
  memberCount: number
  unreadCount: number
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER'
}

// Transform backend snake_case to frontend camelCase
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformMessage(raw: any): Message {
  return {
    id: raw.id,
    content: raw.content,
    senderId: raw.sender_id,
    sender: {
      id: raw.sender?.id || '',
      displayName: raw.sender?.display_name || 'Unknown',
      avatarUrl: raw.sender?.avatar_url || null,
      role: raw.sender?.role || 'CLIENT',
    },
    channelType: raw.channel_type,
    squadId: raw.squad_id,
    recipientId: raw.recipient_id,
    parentId: raw.parent_id,
    mediaUrls: raw.media_urls || [],
    isEdited: raw.is_edited || false,
    editedAt: raw.edited_at,
    isDeleted: raw.is_deleted || false,
    createdAt: raw.created_at,
    reactions: (raw.reactions || []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      emoji: r.emoji,
      user: {
        id: r.user?.id || r.user_id,
        displayName: r.user?.display_name || 'Unknown',
      },
    })),
    reactionSummary: raw.reactionSummary || raw.reaction_summary,
    _count: raw._count,
  }
}

export function useGlobalFeed() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)

  // Load messages
  const loadMessages = useCallback(async (refresh = false) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (!refresh && cursor) params.set('cursor', cursor)
      
      const data = await fetchWithAuth(`/messages/global?${params}`)
      const transformed = (data.messages || []).map(transformMessage)

      if (refresh) {
        setMessages(transformed)
      } else {
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id))
          const newMessages = transformed.filter((m: Message) => !existingIds.has(m.id))
          return [...prev, ...newMessages]
        })
      }
      setCursor(data.nextCursor)
      setHasMore(data.hasMore)
    } catch (err) {
      console.error('Failed to load global feed:', err)
    } finally {
      setLoading(false)
    }
  }, [cursor])

  // Initial load
  useEffect(() => {
    loadMessages(true)
  }, [])

  // Real-time updates (shared socket connection)
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    let socket: Socket
    try {
      socket = initSocket()
    } catch {
      return
    }

    const onGlobal = (rawMessage: any) => {
      const msg = transformMessage(rawMessage)
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev
        return [msg, ...prev]
      })
    }

    const onUpdated = (rawUpdated: any) => {
      const updated = transformMessage(rawUpdated)
      setMessages(prev => prev.map(m => m.id === updated.id ? updated : m))
    }

    const onDeleted = ({ id }: { id: string }) => {
      setMessages(prev => prev.filter(m => m.id !== id))
    }

    const onReaction = ({ messageId, emoji, userId, action }: any) => {
      setMessages(prev => prev.map(m => {
        if (m.id !== messageId) return m

        if (action === 'added') {
          return {
            ...m,
            reactions: [...m.reactions, { id: '', userId, emoji, user: { id: userId, displayName: '' } }],
          }
        } else {
          return {
            ...m,
            reactions: m.reactions.filter(r => !(r.userId === userId && r.emoji === emoji)),
          }
        }
      }))
    }

    socket.on('message:global', onGlobal)
    socket.on('message:updated', onUpdated)
    socket.on('message:deleted', onDeleted)
    socket.on('message:reaction', onReaction)

    socketRef.current = socket

    return () => {
      socket.off('message:global', onGlobal)
      socket.off('message:updated', onUpdated)
      socket.off('message:deleted', onDeleted)
      socket.off('message:reaction', onReaction)
    }
  }, [])

  const sendMessage = useCallback(async (content: string, mediaUrls?: string[]) => {
    const data = await fetchWithAuth('/messages', {
      method: 'POST',
      body: JSON.stringify({
        content,
        channelType: 'GLOBAL',
        mediaUrls,
      }),
    })
    // Message will be added via socket event
    return data.message
  }, [])

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    await fetchWithAuth(`/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    })
  }, [])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadMessages()
    }
  }, [loading, hasMore, loadMessages])

  return {
    messages,
    loading,
    hasMore,
    sendMessage,
    addReaction,
    loadMore,
    refresh: () => loadMessages(true),
  }
}

export function useSquads() {
  const [squads, setSquads] = useState<Squad[]>([])
  const [loading, setLoading] = useState(true)

  const loadSquads = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchWithAuth('/messages/squads')
      setSquads(data.squads)
    } catch (err) {
      console.error('Failed to load squads:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSquads()
  }, [loadSquads])

  const createSquad = useCallback(async (squad: {
    name: string
    description?: string
    visibility?: 'PUBLIC' | 'INVITE_ONLY' | 'PRIVATE'
    maxMembers?: number
  }) => {
    const data = await fetchWithAuth('/messages/squads', {
      method: 'POST',
      body: JSON.stringify(squad),
    })
    setSquads(prev => [...prev, data.squad])
    return data.squad
  }, [])

  const joinSquad = useCallback(async (squadId: string) => {
    await fetchWithAuth(`/messages/squads/${squadId}/join`, { method: 'POST' })
    await loadSquads() // Refresh
  }, [loadSquads])

  const leaveSquad = useCallback(async (squadId: string) => {
    await fetchWithAuth(`/messages/squads/${squadId}/leave`, { method: 'DELETE' })
    setSquads(prev => prev.filter(s => s.id !== squadId))
  }, [])

  const inviteToSquad = useCallback(async (squadId: string, userId: string) => {
    await fetchWithAuth(`/messages/squads/${squadId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  }, [])

  return {
    squads,
    loading,
    loadSquads,
    createSquad,
    joinSquad,
    leaveSquad,
    inviteToSquad,
  }
}

export function useSquadChat(squadId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [squad, setSquad] = useState<Squad | null>(null)
  const [loading, setLoading] = useState(true)
  const socketRef = useRef<Socket | null>(null)

  const loadSquad = useCallback(async () => {
    if (!squadId) return
    
    try {
      setLoading(true)
      const data = await fetchWithAuth(`/messages/squads/${squadId}`)
      setSquad(data.squad)
      setMessages(data.messages)
    } catch (err) {
      console.error('Failed to load squad:', err)
    } finally {
      setLoading(false)
    }
  }, [squadId])

  useEffect(() => {
    loadSquad()
  }, [loadSquad])

  // Real-time updates
  useEffect(() => {
    if (!squadId) return
    
    const token = localStorage.getItem('accessToken')
    if (!token) return

    const socket = io(WS_ORIGIN, {
      auth: { token },
    })

    socket.emit('join:squad', squadId)

    socket.on('message:squad', (message: Message) => {
      if (message.squadId === squadId) {
        setMessages(prev => [...prev, message])
      }
    })

    socketRef.current = socket

    return () => {
      socket.emit('leave:squad', squadId)
      socket.disconnect()
    }
  }, [squadId])

  const sendMessage = useCallback(async (content: string, mediaUrls?: string[]) => {
    if (!squadId) throw new Error('No squad selected')
    
    const data = await fetchWithAuth('/messages', {
      method: 'POST',
      body: JSON.stringify({
        content,
        channelType: 'SQUAD',
        squadId,
        mediaUrls,
      }),
    })
    return data.message
  }, [squadId])

  return {
    squad,
    messages,
    loading,
    sendMessage,
    refresh: loadSquad,
  }
}

export function useDirectMessages(userId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const socketRef = useRef<Socket | null>(null)

  const loadMessages = useCallback(async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      const data = await fetchWithAuth(`/messages/direct/${userId}`)
      setMessages(data.messages)
      setHasMore(data.hasMore)
    } catch (err) {
      console.error('Failed to load DMs:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  // Real-time updates
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    const socket = io(WS_ORIGIN, {
      auth: { token },
    })

    socket.on('message:direct', (message: Message) => {
      // Check if this message is for our conversation
      if (
        (message.senderId === userId) ||
        (message.recipientId === userId)
      ) {
        setMessages(prev => [...prev, message])
      }
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [userId])

  const sendMessage = useCallback(async (content: string, mediaUrls?: string[]) => {
    if (!userId) throw new Error('No recipient selected')
    
    const data = await fetchWithAuth('/messages', {
      method: 'POST',
      body: JSON.stringify({
        content,
        channelType: 'DIRECT',
        recipientId: userId,
        mediaUrls,
      }),
    })
    return data.message
  }, [userId])

  return {
    messages,
    loading,
    hasMore,
    sendMessage,
    refresh: loadMessages,
  }
}

// =============================================================================
// MEDIA UPLOAD HOOK
// =============================================================================

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const upload = useCallback(async (file: File): Promise<string> => {
    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      const xhr = new XMLHttpRequest()

      const publicUrl = await new Promise<string>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100))
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText)
            resolve(data.publicUrl)
          } else {
            reject(new Error('Upload failed'))
          }
        }

        xhr.onerror = () => reject(new Error('Upload failed'))

        xhr.open('POST', `${API_BASE}/messages/upload`)
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        // Do NOT set Content-Type — browser sets multipart boundary automatically
        xhr.send(formData)
      })

      return publicUrl
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }, [])

  return { upload, uploading, progress }
}

export default {
  useTrackedLifts,
  useLiftSession,
  useLiftAnalytics,
  useGlobalFeed,
  useSquads,
  useSquadChat,
  useDirectMessages,
  useMediaUpload,
}
