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
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to FitsiteGonga!</h1>
        <p className="text-gray-600">
          Your fitness journey starts here. Track workouts, join challenges, and achieve your goals.
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Start Workout Card */}
        <div
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push('/app/workouts')}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💪</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Start Workout</h3>
              <p className="text-gray-600">Begin a new training session</p>
            </div>
          </div>
        </div>

        {/* View Metrics Card */}
        <div
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push('/app/metrics')}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">View Metrics</h3>
              <p className="text-gray-600">Check your progress and stats</p>
            </div>
          </div>
        </div>

        {/* Set Goals Card */}
        <div
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push('/app/goals')}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Set Goals</h3>
              <p className="text-gray-600">Define your fitness objectives</p>
            </div>
          </div>
        </div>

        {/* Join Challenges Card */}
        <div
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push('/app/challenges')}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Join Challenges</h3>
              <p className="text-gray-600">Compete with others and stay motivated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-gray-600">
          <p>No recent activity yet. Start a workout or join a challenge!</p>
        </div>
      </div>

      {/* Getting Started Tips */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Getting Started</h2>
        <ul className="list-disc list-inside text-blue-700 space-y-2">
          <li>
            Complete your profile in <span className="font-medium">Account Setup</span> if you
            haven&apos;t already.
          </li>
          <li>
            Explore the <span className="font-medium">Workouts</span> section to log your first
            session.
          </li>
          <li>
            Check out <span className="font-medium">Challenges</span> to find a new goal.
          </li>
          <li>
            Set personal targets in the <span className="font-medium">Goals</span> section.
          </li>
        </ul>
      </div>
    </div>
  );
}
