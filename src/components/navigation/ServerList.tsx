'use client'

interface Server {
  id: string
  name: string
  icon?: string
}

interface ServerListProps {
  servers?: Server[]
  selectedId?: string
  onSelect?: (id: string) => void
}

const defaultServers: Server[] = [
  { id: 'personal', name: 'Personal Clients', icon: '🧑‍💻' },
  { id: 'groups', name: 'Group Classes', icon: '👥' },
  { id: 'community', name: 'Community', icon: '🌐' },
]

export function ServerList({ servers = defaultServers, selectedId = 'personal', onSelect = () => {} }: ServerListProps) {
  return (
    <div className="w-16 bg-discord-darkest border-r border-discord-darker py-3 flex flex-col items-center space-y-3">
      {servers.map((server) => {
        const isSelected = server.id === selectedId
        return (
          <button
            key={server.id}
            onClick={() => onSelect(server.id)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${
              isSelected
                ? 'bg-discord-accent text-white rounded-xl'
                : 'bg-discord-medium text-white hover:rounded-xl hover:bg-discord-accent/80'
            }`}
            title={server.name}
          >
            {server.icon || server.name.charAt(0)}
          </button>
        )
      })}
    </div>
  )
}

export default ServerList


