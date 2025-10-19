'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-discord-darker rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome to FitsiteGonga!</h1>
        <p className="text-discord-muted">
          Your fitness journey starts here. Use the 7 panels to track, plan, and achieve your goals.
        </p>
      </div>

      {/* 7 Panel Overview */}
      <div className="bg-discord-darker rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Your Fitness Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Energy Mode */}
          <div
            className="bg-discord-dark rounded-lg p-4 hover:bg-discord-medium transition-colors cursor-pointer"
            onClick={() => router.push('/app/energy')}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="font-medium text-white">Energy Mode</h3>
                <p className="text-sm text-discord-muted">Track training readiness</p>
              </div>
            </div>
          </div>

          {/* Split Planner */}
          <div
            className="bg-discord-dark rounded-lg p-4 hover:bg-discord-medium transition-colors cursor-pointer"
            onClick={() => router.push('/app/split-planner')}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📋</span>
              <div>
                <h3 className="font-medium text-white">Split Planner</h3>
                <p className="text-sm text-discord-muted">Plan your workouts</p>
              </div>
            </div>
          </div>

          {/* Lifts & Goals */}
          <div
            className="bg-discord-dark rounded-lg p-4 hover:bg-discord-medium transition-colors cursor-pointer"
            onClick={() => router.push('/app/lifts')}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏋️</span>
              <div>
                <h3 className="font-medium text-white">Lifts & Goals</h3>
                <p className="text-sm text-discord-muted">Track your progress</p>
              </div>
            </div>
          </div>

          {/* Quick Logger */}
          <div
            className="bg-discord-dark rounded-lg p-4 hover:bg-discord-medium transition-colors cursor-pointer"
            onClick={() => router.push('/app/logger')}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">✍️</span>
              <div>
                <h3 className="font-medium text-white">Quick Logger</h3>
                <p className="text-sm text-discord-muted">Log sets and measurements</p>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div
            className="bg-discord-dark rounded-lg p-4 hover:bg-discord-medium transition-colors cursor-pointer"
            onClick={() => router.push('/app/chat')}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💬</span>
              <div>
                <h3 className="font-medium text-white">Chat</h3>
                <p className="text-sm text-discord-muted">Connect with trainers</p>
              </div>
            </div>
          </div>

          {/* Calculators */}
          <div
            className="bg-discord-dark rounded-lg p-4 hover:bg-discord-medium transition-colors cursor-pointer"
            onClick={() => router.push('/app/calculators')}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🧮</span>
              <div>
                <h3 className="font-medium text-white">Calculators</h3>
                <p className="text-sm text-discord-muted">Fitness formulas</p>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div
            className="bg-discord-dark rounded-lg p-4 hover:bg-discord-medium transition-colors cursor-pointer"
            onClick={() => router.push('/app/highlights')}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📸</span>
              <div>
                <h3 className="font-medium text-white">Highlights</h3>
                <p className="text-sm text-discord-muted">Instagram inspiration</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Flow */}
      <div className="bg-discord-accent/10 border border-discord-accent/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Getting Started</h2>
        <div className="space-y-3 text-discord-muted">
          <div className="flex items-center space-x-3">
            <span className="text-discord-accent font-bold">1.</span>
            <span>
              Start with <strong className="text-white">Energy Mode</strong> to set your training
              readiness
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-discord-accent font-bold">2.</span>
            <span>
              Use <strong className="text-white">Split Planner</strong> to plan your workout
              schedule
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-discord-accent font-bold">3.</span>
            <span>
              Set goals in <strong className="text-white">Lifts & Goals</strong> and track progress
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-discord-accent font-bold">4.</span>
            <span>
              Log your workouts with <strong className="text-white">Quick Logger</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
