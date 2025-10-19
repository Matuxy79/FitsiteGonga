'use client';

import { useState, useEffect } from 'react';

interface VolumeData {
  date: string;
  volume: number;
}

export function VolumeChart() {
  const [volumeData, setVolumeData] = useState<VolumeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    const fetchVolumeData = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`/api/volume?range=${timeRange}`);

        if (!response.ok) {
          throw new Error('Failed to fetch volume data');
        }

        const result = await response.json();
        setVolumeData(result.data || []);
      } catch (error) {
        console.error('Error fetching volume data:', error);
        // Keep empty array on error - will show empty state
        setVolumeData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVolumeData();
  }, [timeRange]);

  const maxVolume = Math.max(...volumeData.map(d => d.volume));
  const totalVolume = volumeData.reduce((sum, d) => sum + d.volume, 0);
  const avgVolume = totalVolume / volumeData.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (volumeData.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No training data yet</h3>
        <p className="text-gray-600 mb-4">
          Complete some workouts to see your training volume over time
        </p>
        <button
          onClick={() => (window.location.href = '/workouts')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Start Your First Workout
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === 'week'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === 'month'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{totalVolume.toFixed(0)} kg</div>
          <div className="text-sm text-gray-600">Total Volume</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{avgVolume.toFixed(0)} kg</div>
          <div className="text-sm text-gray-600">Avg per Day</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{volumeData.length}</div>
          <div className="text-sm text-gray-600">Days Tracked</div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64 bg-gray-50 rounded-lg p-4">
        <div className="flex items-end justify-between h-full space-x-1">
          {volumeData.map((data, index) => {
            const height = (data.volume / maxVolume) * 100;
            const date = new Date(data.date);
            const dayLabel =
              timeRange === 'week'
                ? date.toLocaleDateString('en-US', { weekday: 'short' })
                : date.getDate().toString();

            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="relative group">
                  <div
                    className="bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${data.date}: ${data.volume.toFixed(0)} kg`}
                  />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {data.volume.toFixed(0)} kg
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2 text-center">{dayLabel}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Y-axis labels */}
      <div className="flex justify-between text-xs text-gray-500 px-4">
        <span>0 kg</span>
        <span>{maxVolume.toFixed(0)} kg</span>
      </div>
    </div>
  );
}
