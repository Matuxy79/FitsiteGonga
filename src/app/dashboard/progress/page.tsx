'use client'

import { LineChart } from 'lucide-react'

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Progress</h1>
        <p className="text-sm text-gray-500">Track your fitness journey over time.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm min-h-[400px] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <LineChart className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-semibold text-gray-600">Progress feed</p>
          <p className="text-sm mt-1">Log workouts and challenges to see progress here.</p>
        </div>
      </div>
    </div>
  )
}
