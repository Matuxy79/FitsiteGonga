'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { AchievementSidebar } from './AchievementSidebar'
import { Header } from './Header'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen discord-bg text-discord-light">
      {/* Left Sidebar - Challenge Categories */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <main className="flex-1 flex overflow-hidden">
          {/* Challenge Content */}
          <div className="flex-1 bg-discord-dark">
            {children}
          </div>
          
          {/* Right Sidebar - Achievements */}
          <AchievementSidebar />
        </main>
      </div>
    </div>
  )
}

// Discord-inspired color scheme
const discordColors = {
  'discord-darkest': '#1e1f22',
  'discord-darker': '#202225', 
  'discord-dark': '#2f3136',
  'discord-medium': '#36393f',
  'discord-light': '#dcddde',
  'discord-muted': '#72767d',
  'discord-accent': '#5865f2',
  'discord-success': '#3ba55c',
  'discord-warning': '#faa61a',
  'discord-error': '#ed4245',
} as const
