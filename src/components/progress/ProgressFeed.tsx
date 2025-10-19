'use client';

import { motion } from 'framer-motion';
import { ProgressEntry } from './ProgressEntry';
import type { ProgressFeedProps } from '@/types/fitness';

export function ProgressFeed({ logs, onReact, onComment, currentUserId }: ProgressFeedProps) {
  if (logs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-white mb-2">No progress yet</h3>
          <p className="text-discord-muted">Start logging your progress to see it appear here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {logs.map((log, index) => (
        <motion.div
          key={log.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ProgressEntry
            log={log}
            user={log.user!}
            onReact={reaction => onReact(log.id, reaction)}
            onComment={comment => onComment(log.id, comment)}
            canEdit={log.user_id === currentUserId}
            reactions={[]}
          />
        </motion.div>
      ))}
    </div>
  );
}
