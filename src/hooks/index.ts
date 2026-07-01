import { useState, useEffect, useCallback, useRef } from 'react'
import { Socket } from 'socket.io-client'
import { initSocket } from '@/lib/socketClient'

// =============================================================================
// API BASE
// =============================================================================

const RAW_API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const API_ORIGIN = RAW_API_ORIGIN.replace(/\/+$/, '')
const API_BASE = API_ORIGIN.endsWith('/api') ? API_ORIGIN : `${API_ORIGIN}/api`

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

// Transform backend snake_case to frontend camelCase
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
  useGlobalFeed,
  useMediaUpload,
}
