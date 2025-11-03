'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
  leftIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError = false, leftIcon, ...props }, ref) => {
    return (
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-discord-muted">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-discord-dark text-discord-light placeholder-discord-muted border border-discord-medium rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-discord-accent focus:border-discord-accent',
            leftIcon && 'pl-9',
            hasError && 'border-discord-error focus:ring-discord-error focus:border-discord-error',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input


