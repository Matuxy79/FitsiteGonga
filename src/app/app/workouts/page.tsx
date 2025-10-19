'use client';

import { useState } from 'react';
import { WorkoutLogger } from '@/components/workouts/WorkoutLogger';

export default function WorkoutsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Workouts</h1>
        <p className="text-gray-600">Track your training sessions and monitor your progress.</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active Workout
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Workout History
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'active' ? (
            <WorkoutLogger />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-400">📋</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Workout History</h3>
              <p className="text-gray-600 mb-6">
                Complete your first workout to see your training history here.
              </p>
              <button
                onClick={() => setActiveTab('active')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Start Your First Workout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-xl">🔥</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Workouts</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-xl">⏱️</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Time</p>
              <p className="text-2xl font-bold text-gray-900">0h 0m</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-xl">🏆</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Personal Records</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
