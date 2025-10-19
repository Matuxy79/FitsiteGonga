'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Message } from '@/types/panels';
import { deleteMessage } from '@/lib/api/panels';

interface MessageProps {
  message: Message;
  canDelete: boolean;
  onDelete: (messageId: string) => void;
}

export default function MessageComponent({ message, canDelete, onDelete }: MessageProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteMessage(message.id);
      onDelete(message.id);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group hover:bg-discord-dark/50 rounded-lg p-3 transition-colors"
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="w-8 h-8 bg-discord-accent rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          {message.user?.display_name?.charAt(0)?.toUpperCase() || 'U'}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-white">
              {message.user?.display_name || 'Unknown User'}
            </span>
            <span className="text-xs text-discord-muted">
              {new Date(message.created_at).toLocaleTimeString()}
            </span>
          </div>

          <p className="text-discord-light whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Delete Button */}
        {canDelete && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            {showDeleteConfirm ? (
              <div className="flex space-x-1">
                <button
                  onClick={handleDelete}
                  className="text-discord-error hover:text-red-400 transition-colors"
                  title="Confirm delete"
                >
                  ✓
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-discord-muted hover:text-white transition-colors"
                  title="Cancel"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-discord-muted hover:text-discord-error transition-colors"
                title="Delete message"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
