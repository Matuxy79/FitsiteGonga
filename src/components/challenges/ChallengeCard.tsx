'use client';

interface Challenge {
  id: string;
  name: string;
  description?: string;
  category: 'strength' | 'cardio' | 'nutrition' | 'custom';
  type: 'duration' | 'repetition' | 'distance' | 'custom';
  goal_value: number;
  goal_unit: string;
  start_date: string;
  end_date: string;
  participants: string[];
  created_at: string;
}

interface ChallengeCardProps {
  challenge: Challenge;
  isJoined: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onViewDetails: () => void;
}

export function ChallengeCard({
  challenge,
  isJoined,
  onJoin,
  onLeave,
  onViewDetails,
}: ChallengeCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength':
        return '💪';
      case 'cardio':
        return '🏃';
      case 'nutrition':
        return '🥗';
      case 'custom':
        return '🎯';
      default:
        return '🏆';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strength':
        return 'bg-red-100 text-red-800';
      case 'cardio':
        return 'bg-blue-100 text-blue-800';
      case 'nutrition':
        return 'bg-green-100 text-green-800';
      case 'custom':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isActive = () => {
    const now = new Date();
    const start = new Date(challenge.start_date);
    const end = new Date(challenge.end_date);
    return now >= start && now <= end;
  };

  const isUpcoming = () => {
    const now = new Date();
    const start = new Date(challenge.start_date);
    return now < start;
  };

  const getStatusBadge = () => {
    if (isUpcoming()) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Upcoming
        </span>
      );
    }
    if (isActive()) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Ended
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getCategoryIcon(challenge.category)}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{challenge.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(challenge.category)}`}
                >
                  {challenge.category.charAt(0).toUpperCase() + challenge.category.slice(1)}
                </span>
                {getStatusBadge()}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {challenge.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{challenge.description}</p>
        )}

        {/* Challenge Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Goal</p>
            <p className="text-sm text-gray-900">
              {challenge.goal_value} {challenge.goal_unit}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Participants
            </p>
            <p className="text-sm text-gray-900">{challenge.participants.length} joined</p>
          </div>
        </div>

        {/* Date Range */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Duration</p>
          <p className="text-sm text-gray-900">
            {formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={onViewDetails}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Details →
          </button>

          {isActive() || isUpcoming() ? (
            isJoined ? (
              <button
                onClick={onLeave}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 text-sm font-medium"
              >
                Leave Challenge
              </button>
            ) : (
              <button
                onClick={onJoin}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                Join Challenge
              </button>
            )
          ) : (
            <span className="text-sm text-gray-500">Challenge Ended</span>
          )}
        </div>
      </div>
    </div>
  );
}
