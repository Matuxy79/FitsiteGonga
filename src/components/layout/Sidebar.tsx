'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  userRole?: string;
}

const navigationItems = [
  { id: 'dashboard', name: 'Dashboard', icon: '🏠', href: '/' },
  { id: 'workouts', name: 'Workouts', icon: '💪', href: '/workouts' },
  { id: 'metrics', name: 'Metrics', icon: '📊', href: '/metrics' },
  { id: 'goals', name: 'Goals', icon: '🎯', href: '/metrics' },
];

export function Sidebar({ userRole = 'client' }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <div className="w-60 bg-discord-darker flex flex-col">
      {/* Server/Group Header */}
      <div className="h-12 px-4 flex items-center border-b border-discord-dark">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
            F
          </div>
          <span className="font-semibold text-white">FitsiteGonga</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-2 space-y-1">
          {navigationItems.map(item => {
            const isActive = pathname === item.href;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-discord-accent text-white'
                    : 'text-discord-muted hover:text-discord-light hover:bg-discord-dark'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Status */}
      <div className="p-4 border-t border-discord-dark">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 bg-discord-accent rounded-full flex items-center justify-center text-white text-sm font-semibold">
              U
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-discord-success rounded-full border-2 border-discord-darker"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">User</div>
            <div className="text-xs text-discord-muted">Online</div>
          </div>
        </div>
      </div>
    </div>
  );
}
