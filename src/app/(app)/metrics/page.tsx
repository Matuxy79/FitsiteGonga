'use client';

import { useState } from 'react';

export default function MetricsPage() {
  const [activeTab, setActiveTab] = useState<'prs' | 'volume' | 'progress'>('prs');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Metrics & Analytics</h1>
        <p className="text-gray-600">Track your performance and analyze your training progress.</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('prs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'prs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Personal Records
            </button>
            <button
              onClick={() => setActiveTab('volume')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'volume'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Training Volume
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'progress'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Progress Charts
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'prs' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Personal Records Yet</h3>
              <p className="text-gray-600 mb-6">
                Complete some workouts to start tracking your personal records.
              </p>
            </div>
          )}

          {activeTab === 'volume' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Volume Data</h3>
              <p className="text-gray-600 mb-6">
                Your training volume will appear here after you complete workouts.
              </p>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Progress Data</h3>
              <p className="text-gray-600 mb-6">
                Track your workouts to see progress charts and analytics.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-xl">💪</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Best Squat</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-xl">🏋️</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Best Bench Press</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-xl">🏃</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Best Deadlift</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900">0kg</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
