import { Server, Socket, DefaultEventsMap } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { authService } from '../services/authService';

export interface SocketData {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

const configuredOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true;
  if (configuredOrigins.includes(origin)) return true;
  if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
    return true;
  }
  return false;
};

export const initSocketServer = (httpServer: HTTPServer): Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData> => {
  const io = new Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Socket.io CORS blocked origin: ${origin}`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    if (!token) return next(new Error('Authentication error: No token provided'));

    try {
      const decoded = authService.verifyAccessToken(token);
      socket.data.user = decoded;
      next();
    } catch (error: any) {
      return next(new Error(`Authentication error: ${error.message}`));
    }
  });

  io.on('connection', (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>) => {
    const user = socket.data.user;
    console.log(`✅ User connected: ${user.email} (${user.userId})`);

    // Auto-join user-specific room for DMs/notifications
    socket.join(`user:${user.userId}`);

    // Auto-join global feed room
    socket.join('global');

    // Squad rooms
    socket.on('join:squad', (squadId: string) => {
      socket.join(`squad:${squadId}`);
      console.log(`📥 User ${user.email} joined squad:${squadId}`);
    });

    socket.on('leave:squad', (squadId: string) => {
      socket.leave(`squad:${squadId}`);
      console.log(`📤 User ${user.email} left squad:${squadId}`);
    });

    // Challenge rooms (legacy)
    socket.on('join:challenge', (challengeId: string) => {
      socket.join(`challenge:${challengeId}`);
    });

    socket.on('leave:challenge', (challengeId: string) => {
      socket.leave(`challenge:${challengeId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected: ${user.email} - ${reason}`);
    });

    socket.on('error', (error) => {
      console.error(`Socket error for user ${user.email}:`, error);
    });
  });

  return io;
};

let ioInstance: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData> | null = null;

export const setIO = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>) => {
  ioInstance = io;
};

export const getIO = (): Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData> => {
  if (!ioInstance) throw new Error('Socket.io server not initialized. Call setIO() first.');
  return ioInstance;
};

export type SocketIOServer = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>;
export let io: SocketIOServer;
