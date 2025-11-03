'use client'

import type { Challenge } from '@/types/fitness'

interface ChannelListProps {
  categories: Array<{
    id: string
    name: string
    icon: string
    challenges: Challenge[]
  }>
  selectedChannelId?: string
  onSelect?: (id: string) => void
}

export function ChannelList({ categories, selectedChannelId, onSelect = () => {} }: ChannelListProps) {
  return (
    <div className="w-64 bg-discord-darker border-r border-discord-dark py-3 overflow-y-auto">
      {categories.map(category => (
        <div key={category.id} className="mb-3">
          <div className="px-3 py-1 text-xs uppercase tracking-wider text-discord-muted flex items-center space-x-2">
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </div>
          <div className="mt-1">
            {category.challenges.map(ch => {
              const selected = ch.id === selectedChannelId
              return (
                <button
                  key={ch.id}
                  onClick={() => onSelect(ch.id)}
                  className={`w-full flex items-center px-3 py-1.5 text-sm text-left rounded hover:bg-discord-dark transition-colors ${
                    selected ? 'text-white bg-discord-dark' : 'text-discord-muted'
                  }`}
                  title={ch.name}
                >
                  <span className="mr-2 text-xs">#</span>
                  <span className="truncate">{ch.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ChannelList


