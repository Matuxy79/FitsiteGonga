'use client'

import { ReactNode } from 'react'
import { BrandHeader } from '../brand/BrandHeader'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-discord-darkest text-discord-light">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <BrandHeader />
        <div className="mt-6">
          {children}
        </div>
      </div>
      <div className="pointer-events-none fixed inset-0 opacity-[0.06]" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_50%_-100px,rgba(88,101,242,0.25),transparent)]" />
      </div>
    </div>
  )
}

export default AuthLayout


