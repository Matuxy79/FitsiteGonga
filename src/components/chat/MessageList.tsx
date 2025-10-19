'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import MessageComponent from './Message';
import type { Message } from '@/types/panels';

interface MessageListProps {
  messages: Message[];
  canDelete: boolean;
  onDelete: (messageId: string) => void;
}

export default function MessageList({ messages, canDelete, onDelete }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelId = 'lobby'; // For now, we'll use the lobby channel

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        payload => {
          // The parent component should handle this by refetching messages
          console.log('New message received:', payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        payload => {
          console.log('Message deleted:', payload);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [channelId]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-semibold text-white mb-2">No messages yet</h3>
          <p className="text-discord-muted">Be the first to start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map(message => (
        <MessageComponent
          key={message.id}
          message={message}
          canDelete={canDelete}
          onDelete={onDelete}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
