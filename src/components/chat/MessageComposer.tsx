'use client';

import { useState } from 'react';
import { sendMessage } from '@/lib/api/panels';

interface MessageComposerProps {
  channelId: string;
  canPost: boolean;
  onMessageSent: () => void;
}

export default function MessageComposer({
  channelId,
  canPost,
  onMessageSent,
}: MessageComposerProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !canPost) return;

    setIsSubmitting(true);
    try {
      await sendMessage(channelId, content.trim());
      setContent('');
      onMessageSent();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!canPost) {
    return (
      <div className="p-4 border-t border-discord-dark">
        <div className="bg-discord-warning/10 border border-discord-warning/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-discord-warning text-lg">🔒</span>
            <div>
              <h3 className="text-sm font-medium text-discord-warning">Posting Restricted</h3>
              <p className="text-sm text-discord-muted">
                Only trainers and admins can post messages. Upgrade to premium to participate in
                discussions.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-discord-dark">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 p-3 bg-discord-dark border border-discord-medium rounded-lg text-white placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-accent resize-none"
            rows={2}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="px-4 py-2 bg-discord-accent text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
