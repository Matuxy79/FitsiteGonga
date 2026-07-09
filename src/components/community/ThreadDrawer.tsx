'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, MessageSquare } from 'lucide-react'
import { transformMessage, type Message, getSocket } from '@/hooks'
import { useToast } from '@/hooks/useToast'
import { mapApiErrorToToast } from '@/lib/apiFeedback'
import { CommunityRepository } from '@/repositories/CommunityRepository'
import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'

interface ThreadDrawerProps {
  rootMessage: Message | null
  onClose: () => void
  currentUserId: string
  isAdmin: boolean
  maxUploadBytes: number
  maxMediaPerMessage: number
  /** Sends a reply through the active feed so channel/squad/dm routing is right. */
  onSendReply: (content: string, opts: { mediaUrls?: string[]; parentId?: string; mentions?: string[] }) => Promise<unknown>
  canPost: boolean
}

export function ThreadDrawer({
  rootMessage,
  onClose,
  currentUserId,
  isAdmin,
  maxUploadBytes,
  maxMediaPerMessage,
  onSendReply,
  canPost,
}: ThreadDrawerProps) {
  const { toast } = useToast()
  const [parent, setParent] = useState<Message | null>(null)
  const [replies, setReplies] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!rootMessage) return
    setLoading(true)
    try {
      const data = await CommunityRepository.getThread(rootMessage.id)
      setParent(transformMessage(data.parent))
      setReplies((data.replies || []).map(transformMessage))
    } catch (error) {
      console.error('Failed to load thread:', error)
      toast(mapApiErrorToToast(error, { action: 'load this thread' }))
    } finally {
      setLoading(false)
    }
  }, [rootMessage, toast])

  useEffect(() => {
    setParent(null)
    setReplies([])
    if (rootMessage) load()
  }, [rootMessage, load])

  // Live-append replies arriving via any message event that targets this thread.
  useEffect(() => {
    if (!rootMessage) return
    const socket = getSocket()
    if (!socket) return

    const maybeAppend = (raw: any) => {
      const msg = raw?.message ? transformMessage(raw.message) : transformMessage(raw)
      if (msg.parentId !== rootMessage.id) return
      setReplies((prev) => (prev.some((r) => r.id === msg.id) ? prev : [...prev, msg]))
    }
    const onChannel = (payload: any) => maybeAppend(payload)
    const onSquad = (raw: any) => maybeAppend(raw)
    const onDeleted = ({ id }: { id: string }) => setReplies((prev) => prev.filter((r) => r.id !== id))

    socket.on('message:channel', onChannel)
    socket.on('message:squad', onSquad)
    socket.on('message:deleted', onDeleted)
    return () => {
      socket.off('message:channel', onChannel)
      socket.off('message:squad', onSquad)
      socket.off('message:deleted', onDeleted)
    }
  }, [rootMessage])

  const act = async (action: () => Promise<unknown>, description: string) => {
    try {
      await action()
    } catch (error) {
      toast(mapApiErrorToToast(error, { action: description }))
    }
  }

  return (
    <AnimatePresence>
      {rootMessage && (
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.2 }}
          className="absolute inset-y-0 right-0 w-full sm:w-[420px] bg-zinc-950 border-l border-white/10 z-40 flex flex-col shadow-2xl"
        >
          <div className="h-14 px-4 border-b border-white/5 flex items-center justify-between bg-black/40 shrink-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
              <MessageSquare className="w-4 h-4 text-[#ff8a80]" />
              Thread
              <span className="text-xs font-normal text-slate-500">
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </span>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading && (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 text-[#ff8a80] animate-spin" />
              </div>
            )}

            {parent && (
              <div className="pb-4 border-b border-white/5">
                <MessageBubble
                  message={parent}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  compact={false}
                  showThreadButton={false}
                  onReact={(emoji) => act(() => CommunityRepository.toggleReaction(parent.id, emoji), 'react')}
                />
              </div>
            )}

            <div className="pt-2">
              {replies.map((reply, idx) => {
                const prev = replies[idx - 1]
                const compact =
                  prev?.sender.id === reply.sender.id &&
                  new Date(reply.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60 * 1000
                return (
                  <MessageBubble
                    key={reply.id}
                    message={reply}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                    compact={compact}
                    showThreadButton={false}
                    onReact={(emoji) => act(() => CommunityRepository.toggleReaction(reply.id, emoji), 'react')}
                    onEdit={
                      reply.senderId === currentUserId
                        ? (content) => act(() => CommunityRepository.editMessage(reply.id, content), 'edit') as Promise<void>
                        : undefined
                    }
                    onDelete={() => act(() => CommunityRepository.deleteMessage(reply.id), 'delete') as Promise<void>}
                    onReport={(reason, details) =>
                      act(() => CommunityRepository.reportMessage(reply.id, reason, details), 'report') as Promise<void>
                    }
                  />
                )
              })}
            </div>
          </div>

          <MessageComposer
            placeholder="Reply in thread…"
            disabled={!canPost}
            disabledReason="You cannot reply here"
            maxUploadBytes={maxUploadBytes}
            maxMediaPerMessage={maxMediaPerMessage}
            onSend={async (content, opts) => {
              await onSendReply(content, { ...opts, parentId: rootMessage.id })
              // Optimistically reload in case the socket echo is filtered out.
              setTimeout(load, 400)
            }}
            enableMentions
          />
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

