'use client'

import { cn } from '@/lib/utils'

/** Role/tier flair chip shown next to display names. */
export function FlairBadge({ role, membershipTier, className }: { role?: string; membershipTier?: string; className?: string }) {
  if (role === 'ADMIN') {
    return (
      <span className={cn('rounded bg-clean-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-clean-accent', className)}>
        ADMIN
      </span>
    )
  }
  if (role === 'TRAINER') {
    return (
      <span className={cn('rounded bg-status-info-soft px-1.5 py-0.5 text-[10px] font-semibold text-status-info-text', className)}>
        TRAINER
      </span>
    )
  }
  if (membershipTier === 'PAID') {
    return (
      <span className={cn('rounded bg-status-warning-soft px-1.5 py-0.5 text-[10px] font-semibold text-status-warning-text', className)}>
        PRO
      </span>
    )
  }
  return null
}

/** Level chip, e.g. "Lv 12". */
export function LevelChip({ level, className }: { level?: number | null; className?: string }) {
  if (!level || level < 1) return null
  return (
    <span className={cn('rounded border border-clean-border bg-clean-hover px-1.5 py-0.5 font-mono text-[10px] text-clean-muted', className)}>
      Lv {level}
    </span>
  )
}

/** Avatar with initial fallback. */
export function Avatar({ src, name, size = 10, className }: { src?: string | null; name: string; size?: number; className?: string }) {
  const px = size * 4
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        loading="lazy"
        decoding="async"
        style={{ width: px, height: px }}
        className={cn('rounded-full object-cover shrink-0', className)}
      />
    )
  }
  return (
    <div
      style={{ width: px, height: px }}
      className={cn(
        'rounded-full bg-gradient-to-br from-clean-accent to-[#F58A82] flex items-center justify-center font-bold text-white shrink-0',
        px <= 32 ? 'text-xs' : 'text-sm',
        className,
      )}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}
