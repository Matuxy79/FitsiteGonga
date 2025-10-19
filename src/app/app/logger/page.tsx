'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SetTab from '@/components/logger/SetTab';
import GoalTab from '@/components/logger/GoalTab';
import BodyTab from '@/components/logger/BodyTab';

type TabType = 'set' | 'goal' | 'body';

export default function QuickLoggerPage() {
  const [activeTab, setActiveTab] = useState<TabType>('set');

  const tabs = [
    { id: 'set' as TabType, name: 'Set', icon: '💪' },
    { id: 'goal' as TabType, name: 'Goal', icon: '🎯' },
    { id: 'body' as TabType, name: 'Body', icon: '📏' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-discord-darker rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Quick Logger</h1>
        <p className="text-discord-muted">Log sets, manage goals, and track body measurements</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-discord-darker rounded-lg p-6">
        <div className="flex space-x-1 bg-discord-dark rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-discord-accent text-white'
                  : 'text-discord-muted hover:text-white hover:bg-discord-medium'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'set' && <SetTab />}
        {activeTab === 'goal' && <GoalTab />}
        {activeTab === 'body' && <BodyTab />}
      </div>
    </div>
  );
}
