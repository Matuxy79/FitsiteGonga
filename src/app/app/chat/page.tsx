'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getChannels, getMessages, getUserRole, getUserTier, isTrainer } from '@/lib/api/panels';
import MessageList from '@/components/chat/MessageList';
import MessageComposer from '@/components/chat/MessageComposer';
import type { Channel, Message } from '@/types/panels';

export default function ChatPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [userTier, setUserTier] = useState<string>('');
  const [canPost, setCanPost] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      loadMessages();
    }
  }, [selectedChannel, loadMessages]);

  const loadData = async () => {
    try {
      const [channelList, role, tier, isUserTrainer] = await Promise.all([
        getChannels(),
        getUserRole(),
        getUserTier(),
        isTrainer(),
      ]);

      setChannels(channelList);
      setUserRole(role);
      setUserTier(tier);
      setCanPost(isUserTrainer || tier === 'premium');
      setCanDelete(isUserTrainer);

      // Select first channel by default
      if (channelList.length > 0) {
        setSelectedChannel(channelList[0].id);
      }
    } catch (error) {
      console.error('Error loading chat data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = useCallback(async () => {
    try {
      const messageList = await getMessages(selectedChannel);
      setMessages(messageList);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [selectedChannel]);

  const handleMessageSent = () => {
    loadMessages();
  };

  const handleMessageDelete = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-discord-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-discord-darker rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Chat</h1>
        <p className="text-discord-muted">Connect with trainers and fellow fitness enthusiasts</p>
      </div>

      {/* Channel Selection */}
      <div className="bg-discord-darker rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Channels</h2>
        <div className="flex space-x-4">
          {channels.map(channel => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedChannel === channel.id
                  ? 'bg-discord-accent text-white'
                  : 'bg-discord-dark text-discord-muted hover:bg-discord-medium hover:text-white'
              }`}
            >
              #{channel.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-discord-darker rounded-lg overflow-hidden flex flex-col h-[600px]">
        {/* Channel Header */}
        <div className="p-4 border-b border-discord-dark">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-discord-muted">#</span>
              <span className="font-semibold text-white">
                {channels.find(c => c.id === selectedChannel)?.name || 'Select a channel'}
              </span>
            </div>
            <div className="text-sm text-discord-muted">
              {userRole} • {userTier}
            </div>
          </div>
        </div>

        {/* Messages */}
        <MessageList messages={messages} canDelete={canDelete} onDelete={handleMessageDelete} />

        {/* Message Composer */}
        <MessageComposer
          channelId={selectedChannel}
          canPost={canPost}
          onMessageSent={handleMessageSent}
        />
      </div>

      {/* Etiquette Banner */}
      <div className="bg-discord-darker rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <span className="text-discord-warning text-lg">📋</span>
          <div>
            <h3 className="text-sm font-medium text-discord-warning mb-2">Chat Etiquette</h3>
            <ul className="text-sm text-discord-muted space-y-1">
              <li>• Be respectful and supportive of fellow members</li>
              <li>• Keep discussions fitness and health-related</li>
              <li>• No spam or self-promotion</li>
              <li>• Ask questions and share your progress</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
