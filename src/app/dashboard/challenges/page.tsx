import { Trophy, Clock } from 'lucide-react'

export default function ChallengesPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-[#ff5d4f]/10 text-[#ff5d4f] flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Challenges coming soon</h1>
        <p className="text-gray-500 mb-6">
          We're building team challenges, leaderboards, and achievement badges. Check back soon.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Expected launch: next update</span>
        </div>
      </div>
    </div>
  )
}
