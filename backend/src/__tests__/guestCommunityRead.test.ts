import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import type { Server } from 'http';

vi.mock('../db/client', () => ({
  prisma: {
    channel: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    squadMember: { findUnique: vi.fn() },
    message: { findMany: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

vi.mock('../socket/socketServer', () => ({
  getIO: vi.fn(() => ({ to: () => ({ emit: () => undefined }) })),
}));

vi.mock('../services/notificationService', () => ({
  notify: vi.fn(),
}));

vi.mock('../services/xpService', () => ({
  awardXp: vi.fn(),
}));

vi.mock('../services/authService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/authService')>();
  return {
    ...actual,
    verifyAccessToken: vi.fn(),
  };
});

import { prisma } from '../db/client';
import communityRoutes from '../routes/communityRoutes';
import messageRoutes from '../routes/messageRoutes';
import { authService } from '../services/authService';

const mockedPrisma = vi.mocked(prisma, true);

interface TestResponse {
  status: number;
  body: any;
}

async function request(
  method: 'GET' | 'POST',
  path: string,
  options: { body?: unknown; token?: string } = {},
): Promise<TestResponse> {
  const app = express();
  app.use(express.json());
  app.use('/api/community', communityRoutes);
  app.use('/api/messages', messageRoutes);

  const server = await new Promise<Server>((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });

  try {
    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Could not determine test server address');
    }

    const headers: Record<string, string> = {};
    if (options.token) headers.Authorization = `Bearer ${options.token}`;

    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    return {
      status: response.status,
      body: await response.json(),
    };
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

const publicChannel = {
  id: 'ch-public-1',
  slug: 'general',
  name: 'General',
  description: 'Open to everyone.',
  emoji: null,
  required_tier: 'FREE',
  posting_policy: 'OPEN',
  is_default: true,
  sort_order: 0,
  squad_id: null,
};

const paidChannel = {
  ...publicChannel,
  id: 'ch-paid-1',
  slug: 'pro-lounge',
  name: 'Pro Lounge',
  required_tier: 'PAID',
};

describe('guest read access to community endpoints', () => {
  const previousJwtSecret = process.env.JWT_SECRET;

  beforeAll(() => {
    process.env.JWT_SECRET = 'guest-community-read-test-secret';
  });

  afterAll(() => {
    if (previousJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = previousJwtSecret;
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/community/channels', () => {
    it('returns channels to guests with posting disabled', async () => {
      mockedPrisma.channel.findMany.mockResolvedValue([publicChannel, paidChannel] as never);

      const response = await request('GET', '/api/community/channels');

      expect(response.status).toBe(200);
      const byId = new Map(response.body.channels.map((c: any) => [c.id, c]));

      expect(byId.get('ch-public-1')).toMatchObject({ locked: false, canPost: false });
      expect(byId.get('ch-paid-1')).toMatchObject({ locked: true, canPost: false });
    });
  });

  describe('GET /api/community/channels/:channelId/messages', () => {
    it('lets guests read a free public channel without a token', async () => {
      mockedPrisma.channel.findFirst.mockResolvedValue(publicChannel as never);
      mockedPrisma.message.findMany.mockResolvedValue([] as never);

      const response = await request('GET', '/api/community/channels/ch-public-1/messages');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.messages)).toBe(true);
      expect(response.body.messages).toHaveLength(0);
    });

    it('locks paid channels behind a token for guests', async () => {
      mockedPrisma.channel.findFirst.mockResolvedValue(paidChannel as never);

      const response = await request('GET', '/api/community/channels/ch-paid-1/messages');

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: 'TIER_LOCKED' });
    });

    it('blocks guests from squad-only channels entirely', async () => {
      mockedPrisma.channel.findFirst.mockResolvedValue({ ...publicChannel, squad_id: 'sq-1' } as never);

      const response = await request('GET', '/api/community/channels/ch-squad-1/messages');

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ error: 'You are not a member of this squad' });
    });
  });

  describe('write endpoints stay authenticated', () => {
    it('rejects guest message posts with 401', async () => {
      const response = await request('POST', '/api/community/channels/ch-public-1/messages', {
        body: { content: 'hello from a guest' },
      });

      expect(response.status).toBe(401);
      expect(mockedPrisma.message.findMany).not.toHaveBeenCalled();
    });
  });
});
