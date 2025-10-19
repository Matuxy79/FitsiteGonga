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

        // For now, we'll generate mock data
        // In a real implementation, this would fetch from the API
        const mockData: VolumeData[] = [];
        const days = timeRange === 'week' ? 7 : 30;

        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);

          mockData.push({
            date: date.toISOString().split('T')[0],
            volume: Math.floor(Math.random() * 5000) + 1000, // Random volume between 1000-6000 kg
          });
        }

        setVolumeData(mockData);
      } catch (error) {
        console.error('Error fetching volume data:', error);
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
