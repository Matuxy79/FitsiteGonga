'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MoreHorizontal,
  Reply,
  Pencil,
  Trash2,
  Pin,
  PinOff,
  Flag,
  MessageSquare,
  Trophy,
  Loader2,
  SmilePlus,
  VolumeX,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mediaUrl } from '@/lib/media'
import type { Message } from '@/hooks'
import { FlairBadge, LevelChip, Avatar } from './Badges'
import { EmojiPicker } from './EmojiPicker'
import { Modal } from './Modal'

const QUICK_REACTIONS = ['👍', '🔥', '💪', '❤️']

const REPORT_REASONS = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate content' },
  { value: 'OFF_TOPIC', label: 'Off topic' },
  { value: 'OTHER', label: 'Other' },
] as const

export interface MessageBubbleProps {
  message: Message
  currentUserId: string
  isAdmin: boolean
  canModerate?: boolean // squad mods etc.
  compact: boolean
  showThreadButton?: boolean
  onReact: (emoji: string) => void
  onReply?: () => void
  onOpenThread?: () => void
  onEdit?: (content: string) => Promise<void>
  onDelete?: () => Promise<void>
  onPin?: () => Promise<void>
  onUnpin?: () => Promise<void>
  onReport?: (reason: string, details?: string) => Promise<void>
  onMute?: (minutes: number) => Promise<void>
}

export function MessageBubble({
  message,
  currentUserId,
  isAdmin,
  canModerate = false,
  compact,
  showThreadButton = true,
  onReact,
  onReply,
  onOpenThread,
  onEdit,
  onDelete,
  onPin,
  onUnpin,
  onReport,
  onMute,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(message.content)
  const [busy, setBusy] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState<string>('SPAM')
  const [reportDetails, setReportDetails] = useState('')

  const isOwn = message.senderId === currentUserId
  const moderator = isAdmin || canModerate

  // System messages (achievement wins etc.) render as celebration cards.
  if (message.isSystem) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
        <div className="flex items-center gap-3 rounded-xl border border-warm-sand-border bg-warm-sand px-4 py-3">
          <Trophy className="w-5 h-5 shrink-0 text-status-warning" />
          <div className="text-sm text-warm-sand-text">{message.content}</div>
          <span className="ml-auto shrink-0 text-[10px] text-clean-muted">{formatTime(message.createdAt)}</span>
        </div>
      </motion.div>
    )
  }

  const runBusy = async (fn?: () => Promise<void>) => {
    if (!fn || busy) return
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
      setMenuOpen(false)
    }
  }

  const submitEdit = async () => {
    if (!onEdit || !editValue.trim() || editValue === message.content) {
      setEditing(false)
      return
    }
    setBusy(true)
    try {
      await onEdit(editValue.trim())
      setEditing(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false)
        setMenuOpen(false)
        setPickerOpen(false)
      }}
      className={cn(
        'group relative rounded-lg px-2 py-0.5 transition-colors duration-150',
        compact ? 'mt-0.5' : 'mt-4',
        message.isPinned
          ? 'bg-warm-sand hover:bg-[#FEF3C7]'
          : isOwn
            ? 'bg-clean-accent-softer hover:bg-clean-accent-soft/60'
            : 'hover:bg-clean-hover/60',
      )}
    >
      <div className="flex items-start gap-3">
        {!compact ? (
          <Avatar src={mediaUrl(message.sender.avatarUrl)} name={message.sender.displayName} size={10} />
        ) : null}

        <div className={cn('flex-1 min-w-0', compact && 'ml-[52px]')}>
          {!compact && (
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className={cn('font-medium', isOwn ? 'text-clean-accent' : 'text-clean-text')}>{message.sender.displayName}</span>
              <FlairBadge role={message.sender.role} membershipTier={message.sender.membershipTier} />
              <LevelChip level={message.sender.level} />
              <span className="text-xs text-clean-muted">{formatTime(message.createdAt)}</span>
              {message.isEdited && <span className="text-xs text-clean-muted">(edited)</span>}
              {message.isPinned && <Pin className="w-3 h-3 text-status-warning" />}
            </div>
          )}

          {editing ? (
            <div className="mt-1">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    submitEdit()
                  }
                  if (e.key === 'Escape') setEditing(false)
                }}
                rows={2}
                autoFocus
                className="w-full resize-none rounded-xl border border-clean-border bg-white px-3 py-2.5 text-sm text-clean-text transition-colors duration-150 focus:border-clean-accent/50 focus:outline-none focus:ring-2 focus:ring-clean-accent/20"
              />
              <div className="mt-1 flex items-center gap-2 text-[11px] text-clean-muted">
                {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                <span>Enter to save · Esc to cancel</span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-clean-text whitespace-pre-wrap break-words">
              {renderContentWithMentions(message.content)}
            </div>
          )}

          {message.mediaUrls.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.mediaUrls.map((url, idx) =>
                /\.(mp4|webm|mov)($|\?)/i.test(url) ? (
                  <video key={idx} src={url} controls className="max-w-xs rounded-lg" />
                ) : (
                  <img
                    key={idx}
                    src={url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ),
              )}
            </div>
          )}

          {Object.keys(message.reactionSummary).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.entries(message.reactionSummary).map(([emoji, { count, hasReacted }]) => (
                <button
                  key={emoji}
                  onClick={() => onReact(emoji)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors',
                    hasReacted
                      ? 'border-clean-accent/30 bg-clean-accent-soft text-clean-accent'
                      : 'border-clean-border bg-white text-clean-muted hover:bg-clean-hover',
                  )}
                >
                  <span>{emoji}</span>
                  <span>{count}</span>
                </button>
              ))}
            </div>
          )}

          {showThreadButton && message.replyCount > 0 && (
            <button
              onClick={onOpenThread}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-clean-accent transition-opacity hover:opacity-80"
            >
              <MessageSquare className="w-3 h-3" />
              {message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>
      </div>

      {/* Hover actions */}
      <AnimatePresence>
        {showActions && !editing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute -top-3 right-0 flex items-center gap-1 rounded-lg border border-clean-border bg-white px-2 py-1 shadow-pop"
          >
            {QUICK_REACTIONS.map((emoji) => (
              <button key={emoji} onClick={() => onReact(emoji)} className="p-1 hover:bg-clean-hover rounded transition-colors">
                {emoji}
              </button>
            ))}

            <div className="relative">
              <button
                onClick={() => setPickerOpen((v) => !v)}
                className="p-1 hover:bg-clean-hover rounded transition-colors text-clean-muted hover:text-clean-text"
                title="More reactions"
              >
                <SmilePlus className="w-4 h-4" />
              </button>
              <EmojiPicker
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onPick={(emoji) => {
                  onReact(emoji)
                  setPickerOpen(false)
                }}
                align="right"
                direction="down"
              />
            </div>

            <div className="w-px h-4 bg-clean-border mx-1" />

            {onReply && (
              <button
                onClick={onReply}
                className="p-1 hover:bg-clean-hover rounded transition-colors text-clean-muted hover:text-clean-text"
                title="Reply in thread"
              >
                <Reply className="w-4 h-4" />
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-1 hover:bg-clean-hover rounded transition-colors text-clean-muted hover:text-clean-text"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full z-40 mt-1 w-44 rounded-xl border border-clean-border bg-white py-1 shadow-pop"
                  >
                    {isOwn && onEdit && (
                      <MenuItem icon={Pencil} label="Edit" onClick={() => { setEditing(true); setEditValue(message.content); setMenuOpen(false) }} />
                    )}
                    {(isOwn || moderator) && onDelete && (
                      <MenuItem icon={Trash2} label="Delete" danger onClick={() => runBusy(onDelete)} />
                    )}
                    {moderator && !message.isPinned && onPin && (
                      <MenuItem icon={Pin} label="Pin message" onClick={() => runBusy(onPin)} />
                    )}
                    {moderator && message.isPinned && onUnpin && (
                      <MenuItem icon={PinOff} label="Unpin message" onClick={() => runBusy(onUnpin)} />
                    )}
                    {isAdmin && !isOwn && onMute && (
                      <MenuItem icon={VolumeX} label="Mute author (1h)" danger onClick={() => runBusy(() => onMute(60))} />
                    )}
                    {!isOwn && onReport && (
                      <MenuItem icon={Flag} label="Report" onClick={() => { setReportOpen(true); setMenuOpen(false) }} />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report modal */}
      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Report message">
        <div className="space-y-3">
          {REPORT_REASONS.map((r) => (
            <label key={r.value} className="flex items-center gap-3 cursor-pointer text-sm text-clean-text">
              <input
                type="radio"
                name="report-reason"
                checked={reportReason === r.value}
                onChange={() => setReportReason(r.value)}
                className="accent-[#E8453C]"
              />
              {r.label}
            </label>
          ))}
          <textarea
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            placeholder="Add details (optional)"
            rows={3}
            className="w-full resize-none rounded-xl border border-clean-border bg-white px-3 py-2.5 text-sm text-clean-text placeholder:text-clean-muted transition-colors duration-150 focus:border-clean-accent/50 focus:outline-none focus:ring-2 focus:ring-clean-accent/20"
          />
          <button
            disabled={busy}
            onClick={async () => {
              if (!onReport) return
              setBusy(true)
              try {
                await onReport(reportReason, reportDetails.trim() || undefined)
                setReportOpen(false)
                setReportDetails('')
              } finally {
                setBusy(false)
              }
            }}
            className="w-full rounded-xl bg-clean-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clean-accent-hover disabled:opacity-50"
          >
            {busy ? 'Submitting…' : 'Submit report'}
          </button>
        </div>
      </Modal>
    </motion.div>
  )
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Pin
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors',
        danger ? 'text-status-danger-text hover:bg-status-danger-soft' : 'text-clean-text hover:bg-clean-hover',
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}

function renderContentWithMentions(content: string) {
  const parts = content.split(/(@[\w][\w .-]{0,30})/g)
  if (parts.length === 1) return content
  return parts.map((part, i) =>
    part.startsWith('@') ? (
      <span key={i} className="rounded bg-clean-accent-soft px-1 font-medium text-clean-accent">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
