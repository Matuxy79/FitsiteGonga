'use client'

export function BrandHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-discord-accent text-white flex items-center justify-center font-bold">
          F
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-discord-accent">FitsiteGonga</span>
          </h1>
          <p className="text-sm text-discord-muted">Discord-style fitness challenges for clients and trainers</p>
        </div>
      </div>
    </div>
  )
}

export default BrandHeader


