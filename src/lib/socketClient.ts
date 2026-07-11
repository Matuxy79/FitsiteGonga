/**
 * Socket.io Client - Replaces Supabase Realtime
 */

import { io, Socket } from 'socket.io-client';

let SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
if (SOCKET_URL && !SOCKET_URL.startsWith('http') && !SOCKET_URL.startsWith('/')) {
  SOCKET_URL = `https://${SOCKET_URL}`;
}

let socket: Socket | null = null;

/**
 * Get auth token for Socket.io handshake
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

/**
 * Initialize Socket.io connection
 */
export function initSocket(): Socket {
  if (socket?.connected) {
    return socket;
  }

  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No auth token available for Socket.io connection');
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    // Start with polling (works through any reverse proxy), then upgrade to ws.
    // Railway's proxy can reject a bare WebSocket upgrade handshake (HTTP 400).
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ Socket.io connected');
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket.io disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket.io connection error:', error);
  });

  return socket;
}

/**
 * Get existing Socket.io connection
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Disconnect Socket.io
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Join challenge room
 */
export function joinChallenge(challengeId: string): void {
  if (socket?.connected) {
    socket.emit('join:challenge', challengeId);
  }
}

/**
 * Leave challenge room
 */
export function leaveChallenge(challengeId: string): void {
  if (socket?.connected) {
    socket.emit('leave:challenge', challengeId);
  }
}

export default {
  init: initSocket,
  get: getSocket,
  disconnect: disconnectSocket,
  joinChallenge,
  leaveChallenge,
};


