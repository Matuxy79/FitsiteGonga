import { Server, Socket, DefaultEventsMap } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { authService } from '../services/authService';

// Extend Socket data interface
export interface SocketData {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Initialize Socket.io server with authentication
 */
export const initSocketServer = (httpServer: HTTPServer): Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData> => {
  const io = new Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware for Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = authService.verifyAccessToken(token);
      socket.data.user = decoded;
      next();
    } catch (error: any) {
      return next(new Error(`Authentication error: ${error.message}`));
    }
  });

  // Connection handler
  io.on('connection', (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>) => {
    const user = socket.data.user;
    console.log(`✅ User connected: ${user.email} (${user.userId})`);

    // Join user-specific room for notifications
    socket.join(`user:${user.userId}`);

    // Join challenge room
    socket.on('join:challenge', (challengeId: string) => {
      socket.join(`challenge:${challengeId}`);
      console.log(`📥 User ${user.email} joined challenge:${challengeId}`);
    });

    // Leave challenge room
    socket.on('leave:challenge', (challengeId: string) => {
      socket.leave(`challenge:${challengeId}`);
      console.log(`📤 User ${user.email} left challenge:${challengeId}`);
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected: ${user.email} - ${reason}`);
    });

    // Error handler
    socket.on('error', (error) => {
      console.error(`Socket error for user ${user.email}:`, error);
    });
  });

  // Export io instance for use in controllers
  return io;
};

// Export singleton instance (set after initialization)
let ioInstance: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData> | null = null;

export const setIO = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>) => {
  ioInstance = io;
};

export const getIO = (): Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData> => {
  if (!ioInstance) {
    throw new Error('Socket.io server not initialized. Call setIO() first.');
  }
  return ioInstance;
};

// Type alias for the Socket.io server
export type SocketIOServer = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>;

// For backwards compatibility
export let io: SocketIOServer;

