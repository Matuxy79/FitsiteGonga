'use client';

import { useState } from 'react';

interface ProgressEntry {
  id: string;
  user_id: string;
  challenge_id: string;
  value: number;
  unit: string;
  notes?: string;
  photo_url?: string;
  logged_at: string;
  user?: {
    display_name: string;
    avatar_url?: string;
  };
  challenge?: {
    name: string;
  };
}

interface ProgressFeedProps {
  challengeId?: string;
  entries: ProgressEntry[];
  onReact?: (entryId: string, reaction: string) => void;
  onComment?: (entryId: string, comment: string) => void;
}

export function ProgressFeed({ challengeId, entries, onReact, onComment }: ProgressFeedProps) {
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleCommentSubmit = (entryId: string) => {
    if (commentInput.trim() && onComment) {
      onComment(entryId, commentInput.trim());
      setCommentInput('');
      setSelectedEntry(null);
    }
  };

  const reactions = ['👍', '💪', '🔥', '🎉'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <span className="text-sm text-gray-500">{entries.length} entries</span>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">📝</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
          <p className="text-gray-600">Be the first to log progress for this challenge!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className="bg-white rounded-lg shadow p-4">
              {/* Entry Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {entry.user?.display_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {entry.user?.display_name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-500">{formatTime(entry.logged_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    {entry.value} {entry.unit}
                  </p>
                  {entry.challenge && (
                    <p className="text-sm text-gray-500">{entry.challenge.name}</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              {entry.notes && <p className="text-gray-700 mb-3">{entry.notes}</p>}

              {/* Photo */}
              {entry.photo_url && (
                <div className="mb-3">
                  <div className="w-full max-w-xs rounded-lg bg-gray-200 h-32 flex items-center justify-center">
                    <span className="text-gray-500">📷 Photo</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  {/* Reactions */}
                  {onReact && (
                    <div className="flex items-center space-x-2">
                      {reactions.map(reaction => (
                        <button
                          key={reaction}
                          onClick={() => onReact(entry.id, reaction)}
                          className="text-lg hover:scale-110 transition-transform"
                        >
                          {reaction}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Comment Button */}
                  {onComment && (
                    <button
                      onClick={() => setSelectedEntry(selectedEntry === entry.id ? null : entry.id)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      💬 Comment
                    </button>
                  )}
                </div>
              </div>

              {/* Comment Input */}
              {selectedEntry === entry.id && onComment && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          handleCommentSubmit(entry.id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleCommentSubmit(entry.id)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
