'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Image,
  Smile,
  MoreHorizontal,
  Reply,
  Edit,
  Trash2,
  MessageSquare,
  ThumbsUp,
  Heart,
  Flame,
  Trophy,
  Loader2,
  ChevronDown,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlobalFeed, useMediaUpload, type Message } from '@/hooks'

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

interface User {
  id: string
  displayName: string
  avatarUrl?: string | null
  role?: string
}

interface GlobalChatProps {
  currentUser: User
}

const QUICK_REACTIONS = ['👍', '🔥', '💪', '❤️', '👏', '🎉']

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export function GlobalChat({ currentUser }: GlobalChatProps) {
  const {
    messages,
    loading,
    hasMore,
    sendMessage,
    addReaction,
    loadMore,
    refresh,
  } = useGlobalFeed()

  const { upload, uploading, progress } = useMediaUpload()

  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [pendingMedia, setPendingMedia] = useState<string[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && !showScrollButton) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  // Track scroll position
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    const atBottom = scrollHeight - scrollTop - clientHeight < 100
    setShowScrollButton(!atBottom)

    // Load more when near top
    if (scrollTop < 200 && hasMore && !loading) {
      loadMore()
    }
  }, [hasMore, loading, loadMore])

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Handle send
  const handleSend = async () => {
    if (!newMessage.trim() && pendingMedia.length === 0) return
    if (sending) return

    setSending(true)
    try {
      await sendMessage(newMessage, pendingMedia.length > 0 ? pendingMedia : undefined)
      setNewMessage('')
      setPendingMedia([])
      setReplyingTo(null)
      scrollToBottom()
    } catch (error) {
      console.error('Failed to send:', error)
    } finally {
      setSending(false)
    }
  }

  // Handle file upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        continue
      }

      try {
        const url = await upload(file)
        setPendingMedia(prev => [...prev, url])
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }

    // Reset input
    e.target.value = ''
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(message)
    return groups
  }, {} as Record<string, Message[]>)

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <div className="h-14 px-4 border-b border-white/5 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">Global Feed</div>
            <div className="text-xs text-slate-500">{messages.length} messages</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* ================================================================== */}
      {/* MESSAGES */}
      {/* ================================================================== */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {/* Load more indicator */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
          </div>
        )}

        {Object.entries(groupedMessages).map(([date, dayMessages]) => (
          <div key={date}>
            {/* Date Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                {formatDateDivider(date)}
              </span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Messages */}
            {dayMessages.map((message, idx) => {
              const prevMessage = dayMessages[idx - 1]
              const sameAuthor = prevMessage?.sender.id === message.sender.id
              const timeDiff = prevMessage
                ? new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime()
                : Infinity
              const compact = sameAuthor && timeDiff < 5 * 60 * 1000 // 5 minutes

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  currentUserId={currentUser.id}
                  compact={compact}
                  onReact={(emoji) => addReaction(message.id, emoji)}
                  onReply={() => setReplyingTo(message)}
                />
              )
            })}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-6 p-2 bg-emerald-500 rounded-full shadow-lg hover:bg-emerald-400 transition-colors"
          >
            <ChevronDown className="w-5 h-5 text-black" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ================================================================== */}
      {/* INPUT AREA */}
      {/* ================================================================== */}
      <div className="p-4 border-t border-white/5 bg-black/40">
        {/* Reply Preview */}
        {replyingTo && (
          <div className="mb-3 flex items-center justify-between px-3 py-2 bg-zinc-900 rounded-lg border-l-2 border-emerald-500">
            <div className="min-w-0">
              <div className="text-xs text-slate-500">
                Replying to <span className="text-emerald-400">{replyingTo.sender.displayName}</span>
              </div>
              <div className="text-sm text-slate-400 truncate">{replyingTo.content}</div>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 hover:bg-white/5 rounded"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        )}

        {/* Pending Media Preview */}
        {pendingMedia.length > 0 && (
          <div className="mb-3 flex items-center gap-2 overflow-x-auto py-2">
            {pendingMedia.map((url, idx) => (
              <div key={idx} className="relative shrink-0">
                <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg" />
                <button
                  onClick={() => setPendingMedia(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="mb-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              Uploading... {progress}%
            </div>
            <div className="mt-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Input Row */}
        <div className="flex items-end gap-3">
          {/* Media Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2.5 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-slate-200 disabled:opacity-50"
          >
            <Image className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Send a message to the global feed..."
              rows={1}
              className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 resize-none focus:border-emerald-500/50 focus:outline-none"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>

          {/* Emoji Button */}
          <button className="p-2.5 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-slate-200">
            <Smile className="w-5 h-5" />
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={(!newMessage.trim() && pendingMedia.length === 0) || sending}
            className={cn(
              'p-2.5 rounded-xl transition-all',
              (newMessage.trim() || pendingMedia.length > 0) && !sending
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            )}
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// MESSAGE BUBBLE COMPONENT
// -----------------------------------------------------------------------------

interface MessageBubbleProps {
  message: Message
  currentUserId: string
  compact: boolean
  onReact: (emoji: string) => void
  onReply: () => void
}

function MessageBubble({
  message,
  currentUserId,
  compact,
  onReact,
  onReply,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false)
  const isOwn = message.sender.id === currentUserId

  // Group reactions
  const reactionGroups = message.reactions.reduce((groups, r) => {
    if (!groups[r.emoji]) groups[r.emoji] = []
    groups[r.emoji].push(r)
    return groups
  }, {} as Record<string, typeof message.reactions>)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={cn(
        'group relative',
        compact ? 'mt-0.5' : 'mt-4'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {!compact && (
          <div className="shrink-0">
            {message.sender.avatarUrl ? (
              <img
                src={message.sender.avatarUrl}
                alt={message.sender.displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-black font-bold">
                {message.sender.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn('flex-1 min-w-0', compact && 'ml-[52px]')}>
          {/* Header */}
          {!compact && (
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-slate-200">
                {message.sender.displayName}
              </span>
              {message.sender.role === 'TRAINER' && (
                <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] rounded">
                  TRAINER
                </span>
              )}
              <span className="text-xs text-slate-500">
                {formatTime(message.createdAt)}
              </span>
              {message.isEdited && (
                <span className="text-xs text-slate-600">(edited)</span>
              )}
            </div>
          )}

          {/* Message Content */}
          <div className="text-sm text-slate-300 whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Media */}
          {message.mediaUrls.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.mediaUrls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt=""
                  className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                />
              ))}
            </div>
          )}

          {/* Reactions */}
          {Object.keys(reactionGroups).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.entries(reactionGroups).map(([emoji, reactions]) => {
                const hasReacted = reactions.some(r => r.userId === currentUserId)
                return (
                  <button
                    key={emoji}
                    onClick={() => onReact(emoji)}
                    className={cn(
                      'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors',
                      hasReacted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-slate-400 hover:bg-zinc-700'
                    )}
                  >
                    <span>{emoji}</span>
                    <span>{reactions.length}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Reply Count */}
          {message._count?.replies && message._count.replies > 0 && (
            <button className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              <Reply className="w-3 h-3" />
              {message._count.replies} {message._count.replies === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute -top-3 right-0 flex items-center gap-1 px-2 py-1 bg-zinc-800 rounded-lg border border-white/10 shadow-lg"
          >
            {/* Quick Reactions */}
            {QUICK_REACTIONS.slice(0, 4).map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReact(emoji)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
            
            <div className="w-px h-4 bg-white/10 mx-1" />
            
            {/* Reply */}
            <button
              onClick={onReply}
              className="p-1 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-slate-200"
            >
              <Reply className="w-4 h-4" />
            </button>

            {/* More */}
            <button className="p-1 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-slate-200">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDateDivider(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
}

export default GlobalChat
