'use client'

import { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
  west?: ReactNode
  east?: ReactNode
  header?: ReactNode
}

export function AppLayout({ children, west, east, header }: AppLayoutProps) {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#050505] text-slate-200">
      {/* Subtle noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

      <div className="relative flex h-full">
        {west}
        <div className="flex-1 min-w-0 flex flex-col">
          {header}
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
        {east}
      </div>
    </div>
  )
}
