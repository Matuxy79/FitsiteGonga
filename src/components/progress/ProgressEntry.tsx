'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ProgressEntryProps } from '@/types/fitness';

export function ProgressEntry({
  log,
  user,
  onReact,
  onComment,
  canEdit,
  reactions = [],
}: ProgressEntryProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const commonReactions = ['👍', '💪', '🔥', '🎉', '👏'];

  return (
    <div className="bg-discord-darker rounded-lg p-4 border border-discord-dark hover:border-discord-medium transition-colors">
      {/* User Info */}
      <div className="flex items-start space-x-3 mb-3">
        <div className="w-10 h-10 bg-discord-accent rounded-full flex items-center justify-center text-white font-semibold">
          {user.display_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{user.display_name}</span>
            <span className="text-discord-muted text-sm">{formatTime(log.logged_at)}</span>
          </div>
          <div className="text-discord-muted text-sm">
            Logged {log.value} {log.unit}
          </div>
        </div>
      </div>

      {/* Progress Content */}
      <div className="ml-13">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-2xl">💪</span>
          <span className="text-white font-semibold text-lg">
            +{log.value} {log.unit}
          </span>
          <span className="text-discord-muted">progress logged</span>
        </div>

        {log.notes && <p className="text-discord-light mb-3">{log.notes}</p>}

        {log.photo_url && (
          <div className="mb-3">
            <img src={log.photo_url} alt="Progress photo" className="max-w-xs rounded-lg" />
          </div>
        )}

        {/* Reactions */}
        <div className="flex items-center space-x-2 mb-2">
          {reactions.length > 0 && (
            <div className="flex items-center space-x-1">
              {reactions.map((reaction, index) => (
                <span key={index} className="text-lg">
                  {reaction.reaction}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowReactions(!showReactions)}
            className="text-discord-muted hover:text-discord-light text-sm transition-colors"
          >
            Add reaction
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4 text-sm">
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-discord-muted hover:text-discord-light transition-colors"
          >
            💬 Comment
          </button>

          {canEdit && (
            <button className="text-discord-muted hover:text-discord-light transition-colors">
              ✏️ Edit
            </button>
          )}
        </div>

        {/* Reaction Picker */}
        {showReactions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 flex space-x-1"
          >
            {commonReactions.map(reaction => (
              <button
                key={reaction}
                onClick={() => {
                  onReact(reaction);
                  setShowReactions(false);
                }}
                className="text-2xl hover:scale-110 transition-transform p-1"
              >
                {reaction}
              </button>
            ))}
          </motion.div>
        )}

        {/* Comments Section */}
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-discord-dark"
          >
            <div className="space-y-2">
              {/* Comment input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 bg-discord-dark border border-discord-medium rounded px-3 py-2 text-discord-light placeholder-discord-muted focus:outline-none focus:border-discord-accent"
                />
                <button
                  onClick={() => onComment('Comment text')}
                  className="bg-discord-accent hover:bg-discord-accent/80 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
