'use client';

import { UserPR } from '@/types/training';
import { formatWeight } from '@/lib/strength';

interface PRCardProps {
  pr: UserPR;
}

export function PRCard({ pr }: PRCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{pr.movement_name}</h3>
        <p className="text-sm text-gray-600">Last performed: {formatDate(pr.last_performed_at)}</p>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-blue-600">{formatWeight(pr.best_1rm_kg)}</div>
        <div className="text-xs text-gray-500">1RM</div>
      </div>
    </div>
  );
}
