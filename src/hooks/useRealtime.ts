'use client';

import { useEffect, useState, useRef } from 'react';
import { initSocket, joinChallenge, leaveChallenge, getSocket, disconnectSocket } from '@/lib/socketClient';

interface UseRealtimeOptions {
  challengeId?: string;
  enabled?: boolean;
}

interface RealtimeEventHandlers {
  onProgressNew?: (data: any) => void;
  onProgressUpdated?: (data: any) => void;
  onProgressDeleted?: (data: any) => void;
  onChallengeCreated?: (data: any) => void;
  onChallengeUpdated?: (data: any) => void;
  onChallengeDeleted?: (data: any) => void;
  onChallengeJoined?: (data: any) => void;
  onChallengeLeft?: (data: any) => void;
}

export function useRealtime(
  options: UseRealtimeOptions = {},
  handlers: RealtimeEventHandlers = {}
) {
  const { challengeId, enabled = true } = options;
  const [connected, setConnected] = useState(false);
  const handlersRef = useRef(handlers);

  // Update handlers ref when handlers change
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!enabled) {
      disconnectSocket();
      setConnected(false);
      return;
    }

    try {
      const socket = initSocket();

      socket.on('connect', () => {
        setConnected(true);
        console.log('✅ Realtime connected');
      });

      socket.on('disconnect', () => {
        setConnected(false);
        console.log('❌ Realtime disconnected');
      });

      // Join challenge room if challengeId provided
      if (challengeId && socket.connected) {
        joinChallenge(challengeId);
      }

      // Progress events
      socket.on('progress:new', (data) => {
        handlersRef.current.onProgressNew?.(data);
      });

      socket.on('progress:updated', (data) => {
        handlersRef.current.onProgressUpdated?.(data);
      });

      socket.on('progress:deleted', (data) => {
        handlersRef.current.onProgressDeleted?.(data);
      });

      // Challenge events
      socket.on('challenge:created', (data) => {
        handlersRef.current.onChallengeCreated?.(data);
      });

      socket.on('challenge:updated', (data) => {
        handlersRef.current.onChallengeUpdated?.(data);
      });

      socket.on('challenge:deleted', (data) => {
        handlersRef.current.onChallengeDeleted?.(data);
      });

      socket.on('challenge:joined', (data) => {
        handlersRef.current.onChallengeJoined?.(data);
      });

      socket.on('challenge:left', (data) => {
        handlersRef.current.onChallengeLeft?.(data);
      });

      // Cleanup on unmount
      return () => {
        if (challengeId) {
          leaveChallenge(challengeId);
        }
      };
    } catch (error) {
      console.error('Failed to initialize Socket.io:', error);
      setConnected(false);
    }
  }, [enabled, challengeId]);

  // Rejoin room when challengeId changes
  useEffect(() => {
    if (challengeId && connected) {
      const socket = getSocket();
      if (socket) {
        joinChallenge(challengeId);
      }
    }
  }, [challengeId, connected]);

  return {
    connected,
    socket: getSocket(),
  };
}


