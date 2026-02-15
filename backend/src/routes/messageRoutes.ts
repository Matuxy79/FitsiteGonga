import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { authenticateJWT } from '../middleware/authMiddleware';
import { s3Service, getPublicUrl } from '../services/s3Service';
import { getIO } from '../socket/socketServer';

const router: Router = Router();

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  channelType: z.enum(['GLOBAL', 'SQUAD', 'DIRECT', 'TRAINER']).default('GLOBAL'),
  squadId: z.string().uuid().optional(),
  recipientId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  mediaUrls: z.array(z.string()).optional(),
});

const editMessageSchema = z.object({
  content: z.string().min(1).max(2000),
});

const addReactionSchema = z.object({
  emoji: z.string().min(1).max(32),
});

const createSquadSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  visibility: z.enum(['PUBLIC', 'INVITE_ONLY', 'PRIVATE']).default('INVITE_ONLY'),
  maxMembers: z.number().int().min(2).max(100).default(50),
});

const inviteToSquadSchema = z.object({
  userId: z.string().uuid(),
});

// =============================================================================
// GLOBAL FEED
// =============================================================================

/**
 * GET /api/messages/global
 * Get global feed messages with pagination
 */
router.get('/global', authenticateJWT, async (req, res) => {
  try {
    const { cursor, limit = '50' } = req.query;
    const limitNum = Math.min(parseInt(limit as string) || 50, 100);

    const whereClause: any = {
      channel_type: 'GLOBAL',
      is_deleted: false,
      parent_id: null,
    };

    if (cursor) {
      whereClause.created_at = { lt: new Date(cursor as string) };
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      take: limitNum,
      include: {
        sender: {
          select: {
            id: true,
            display_name: true,
            avatar_url: true,
            role: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                display_name: true,
              },
            },
          },
        },
        replies: {
          where: { is_deleted: false },
          take: 3,
          orderBy: { created_at: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                display_name: true,
                avatar_url: true,
              },
            },
          },
        },
        _count: {
          select: { replies: true },
        },
      },
    });

    const nextCursor = messages.length === limitNum
      ? messages[messages.length - 1].created_at.toISOString()
      : null;

    res.json({
      messages,
      nextCursor,
      hasMore: !!nextCursor,
    });
  } catch (error) {
    console.error('Get global feed error:', error);
    res.status(500).json({ error: 'Failed to fetch global feed' });
  }
});

/**
 * POST /api/messages
 * Send a message to any channel
 */
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const validated = sendMessageSchema.parse(req.body);

    if (validated.channelType === 'SQUAD' && !validated.squadId) {
      return res.status(400).json({ error: 'squadId required for squad messages' });
    }
    if (validated.channelType === 'DIRECT' && !validated.recipientId) {
      return res.status(400).json({ error: 'recipientId required for direct messages' });
    }

    if (validated.squadId) {
      const membership = await prisma.squadMember.findUnique({
        where: {
          squad_id_user_id: {
            squad_id: validated.squadId,
            user_id: req.user!.userId,
          },
        },
      });

      if (!membership) {
        return res.status(403).json({ error: 'You are not a member of this squad' });
      }
    }

    if (validated.recipientId) {
      const canMessage = await canSendDirectMessage(req.user!.userId, validated.recipientId);
      if (!canMessage) {
        return res.status(403).json({ error: 'Cannot send message to this user' });
      }
    }

    const message = await prisma.message.create({
      data: {
        content: validated.content,
        sender_id: req.user!.userId,
        channel_type: validated.channelType,
        squad_id: validated.squadId,
        recipient_id: validated.recipientId,
        parent_id: validated.parentId,
        media_urls: validated.mediaUrls || [],
      },
      include: {
        sender: {
          select: {
            id: true,
            display_name: true,
            avatar_url: true,
            role: true,
          },
        },
      },
    });

    const io = getIO();
    if (validated.channelType === 'GLOBAL') {
      io.emit('message:global', message);
    } else if (validated.squadId) {
      io.to(`squad:${validated.squadId}`).emit('message:squad', message);
    } else if (validated.recipientId) {
      io.to(`user:${validated.recipientId}`).emit('message:direct', message);
      io.to(`user:${req.user!.userId}`).emit('message:direct', message);
    }

    res.status(201).json({ message });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * GET /api/messages/:messageId/thread
 * Get a message thread (replies)
 */
router.get('/:messageId/thread', authenticateJWT, async (req, res) => {
  try {
    const parent = await prisma.message.findFirst({
      where: {
        id: req.params.messageId,
        is_deleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            display_name: true,
            avatar_url: true,
            role: true,
          },
        },
        reactions: true,
      },
    });

    if (!parent) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const replies = await prisma.message.findMany({
      where: {
        parent_id: req.params.messageId,
        is_deleted: false,
      },
      orderBy: { created_at: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            display_name: true,
            avatar_url: true,
            role: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                display_name: true,
              },
            },
          },
        },
      },
    });

    res.json({ parent, replies });
  } catch (error) {
    console.error('Get thread error:', error);
    res.status(500).json({ error: 'Failed to fetch thread' });
  }
});

/**
 * PATCH /api/messages/:messageId
 * Edit a message
 */
router.patch('/:messageId', authenticateJWT, async (req, res) => {
  try {
    const validated = editMessageSchema.parse(req.body);

    const message = await prisma.message.findFirst({
      where: {
        id: req.params.messageId,
        sender_id: req.user!.userId,
        is_deleted: false,
      },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found or not yours' });
    }

    const updated = await prisma.message.update({
      where: { id: message.id },
      data: {
        content: validated.content,
        is_edited: true,
        edited_at: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            display_name: true,
            avatar_url: true,
          },
        },
      },
    });

    const io = getIO();
    io.emit('message:updated', updated);

    res.json({ message: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Edit message error:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
});

/**
 * DELETE /api/messages/:messageId
 * Soft delete a message
 */
router.delete('/:messageId', authenticateJWT, async (req, res) => {
  try {
    const message = await prisma.message.findFirst({
      where: {
        id: req.params.messageId,
        sender_id: req.user!.userId,
        is_deleted: false,
      },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found or not yours' });
    }

    await prisma.message.update({
      where: { id: message.id },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
        content: '[Message deleted]',
      },
    });

    const io = getIO();
    io.emit('message:deleted', { id: message.id });

    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

/**
 * POST /api/messages/:messageId/reactions
 * Add reaction to message
 */
router.post('/:messageId/reactions', authenticateJWT, async (req, res) => {
  try {
    const validated = addReactionSchema.parse(req.body);

    const message = await prisma.message.findFirst({
      where: {
        id: req.params.messageId,
        is_deleted: false,
      },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const existing = await prisma.messageReaction.findUnique({
      where: {
        message_id_user_id_emoji: {
          message_id: req.params.messageId,
          user_id: req.user!.userId,
          emoji: validated.emoji,
        },
      },
    });

    if (existing) {
      await prisma.messageReaction.delete({
        where: { id: existing.id },
      });
      res.json({ action: 'removed', emoji: validated.emoji });
    } else {
      await prisma.messageReaction.create({
        data: {
          message_id: req.params.messageId,
          user_id: req.user!.userId,
          emoji: validated.emoji,
        },
      });
      res.json({ action: 'added', emoji: validated.emoji });
    }

    const io = getIO();
    io.emit('message:reaction', {
      messageId: req.params.messageId,
      emoji: validated.emoji,
      userId: req.user!.userId,
      action: existing ? 'removed' : 'added',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Reaction error:', error);
    res.status(500).json({ error: 'Failed to process reaction' });
  }
});

// =============================================================================
// SQUADS
// =============================================================================

/**
 * GET /api/messages/squads
 * Get user's squads
 */
router.get('/squads', authenticateJWT, async (req, res) => {
  try {
    const memberships = await prisma.squadMember.findMany({
      where: { user_id: req.user!.userId },
      include: {
        squad: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
    });

    const squadsWithUnread = await Promise.all(
      memberships.map(async (membership) => {
        const unreadCount = await prisma.message.count({
          where: {
            squad_id: membership.squad_id,
            is_deleted: false,
            created_at: { gt: membership.joined_at },
            sender_id: { not: req.user!.userId },
          },
        });

        return {
          ...membership.squad,
          memberCount: membership.squad._count.members,
          unreadCount,
          role: membership.role,
        };
      })
    );

    res.json({ squads: squadsWithUnread });
  } catch (error) {
    console.error('Get squads error:', error);
    res.status(500).json({ error: 'Failed to fetch squads' });
  }
});

/**
 * POST /api/messages/squads
 * Create a new squad
 */
router.post('/squads', authenticateJWT, async (req, res) => {
  try {
    const validated = createSquadSchema.parse(req.body);

    const squad = await prisma.squad.create({
      data: {
        name: validated.name,
        description: validated.description,
        owner_id: req.user!.userId,
        visibility: validated.visibility,
        max_members: validated.maxMembers,
        members: {
          create: {
            user_id: req.user!.userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    res.status(201).json({ squad });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create squad error:', error);
    res.status(500).json({ error: 'Failed to create squad' });
  }
});

/**
 * GET /api/messages/squads/:squadId
 * Get squad details and messages
 */
router.get('/squads/:squadId', authenticateJWT, async (req, res) => {
  try {
    const membership = await prisma.squadMember.findUnique({
      where: {
        squad_id_user_id: {
          squad_id: req.params.squadId,
          user_id: req.user!.userId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this squad' });
    }

    const squad = await prisma.squad.findUnique({
      where: { id: req.params.squadId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                display_name: true,
                avatar_url: true,
                role: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            display_name: true,
            avatar_url: true,
          },
        },
      },
    });

    if (!squad) {
      return res.status(404).json({ error: 'Squad not found' });
    }

    const messages = await prisma.message.findMany({
      where: {
        squad_id: req.params.squadId,
        is_deleted: false,
      },
      orderBy: { created_at: 'desc' },
      take: 50,
      include: {
        sender: {
          select: {
            id: true,
            display_name: true,
            avatar_url: true,
            role: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                display_name: true,
              },
            },
          },
        },
      },
    });

    res.json({
      squad,
      messages: messages.reverse(),
      membership,
    });
  } catch (error) {
    console.error('Get squad error:', error);
    res.status(500).json({ error: 'Failed to fetch squad' });
  }
});

/**
 * POST /api/messages/squads/:squadId/invite
 * Invite user to squad
 */
router.post('/squads/:squadId/invite', authenticateJWT, async (req, res) => {
  try {
    const validated = inviteToSquadSchema.parse(req.body);

    const inviterMembership = await prisma.squadMember.findUnique({
      where: {
        squad_id_user_id: {
          squad_id: req.params.squadId,
          user_id: req.user!.userId,
        },
      },
    });

    if (!inviterMembership || !['OWNER', 'ADMIN', 'MODERATOR'].includes(inviterMembership.role)) {
      return res.status(403).json({ error: 'No permission to invite' });
    }

    const existingMember = await prisma.squadMember.findUnique({
      where: {
        squad_id_user_id: {
          squad_id: req.params.squadId,
          user_id: validated.userId,
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    const existingInvite = await prisma.squadInvite.findUnique({
      where: {
        squad_id_invitee_id: {
          squad_id: req.params.squadId,
          invitee_id: validated.userId,
        },
      },
    });

    if (existingInvite && existingInvite.status === 'PENDING') {
      return res.status(400).json({ error: 'User already has pending invite' });
    }

    const invite = await prisma.squadInvite.create({
      data: {
        squad_id: req.params.squadId,
        inviter_id: req.user!.userId,
        invitee_id: validated.userId,
      },
      include: {
        squad: {
          select: {
            id: true,
            name: true,
          },
        },
        inviter: {
          select: {
            id: true,
            display_name: true,
          },
        },
      },
    });

    const io = getIO();
    io.to(`user:${validated.userId}`).emit('squad:invite', invite);

    res.status(201).json({ invite });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Invite error:', error);
    res.status(500).json({ error: 'Failed to send invite' });
  }
});

/**
 * POST /api/messages/squads/:squadId/join
 * Join a public squad or accept invite
 */
router.post('/squads/:squadId/join', authenticateJWT, async (req, res) => {
  try {
    const squad = await prisma.squad.findUnique({
      where: { id: req.params.squadId },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!squad || !squad.is_active) {
      return res.status(404).json({ error: 'Squad not found' });
    }

    const existingMember = await prisma.squadMember.findUnique({
      where: {
        squad_id_user_id: {
          squad_id: req.params.squadId,
          user_id: req.user!.userId,
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({ error: 'Already a member' });
    }

    if (squad._count.members >= squad.max_members) {
      return res.status(400).json({ error: 'Squad is full' });
    }

    if (squad.visibility !== 'PUBLIC') {
      const invite = await prisma.squadInvite.findUnique({
        where: {
          squad_id_invitee_id: {
            squad_id: req.params.squadId,
            invitee_id: req.user!.userId,
          },
        },
      });

      if (!invite || invite.status !== 'PENDING') {
        return res.status(403).json({ error: 'Invite required to join this squad' });
      }

      await prisma.squadInvite.update({
        where: { id: invite.id },
        data: {
          status: 'ACCEPTED',
          responded_at: new Date(),
        },
      });
    }

    const membership = await prisma.squadMember.create({
      data: {
        squad_id: req.params.squadId,
        user_id: req.user!.userId,
        role: 'MEMBER',
      },
    });

    const io = getIO();
    io.to(`squad:${req.params.squadId}`).emit('squad:member-joined', {
      squadId: req.params.squadId,
      userId: req.user!.userId,
    });

    res.json({ membership });
  } catch (error) {
    console.error('Join squad error:', error);
    res.status(500).json({ error: 'Failed to join squad' });
  }
});

/**
 * DELETE /api/messages/squads/:squadId/leave
 * Leave a squad
 */
router.delete('/squads/:squadId/leave', authenticateJWT, async (req, res) => {
  try {
    const membership = await prisma.squadMember.findUnique({
      where: {
        squad_id_user_id: {
          squad_id: req.params.squadId,
          user_id: req.user!.userId,
        },
      },
    });

    if (!membership) {
      return res.status(404).json({ error: 'Not a member' });
    }

    if (membership.role === 'OWNER') {
      return res.status(400).json({ error: 'Owner cannot leave. Transfer ownership first.' });
    }

    await prisma.squadMember.delete({
      where: { id: membership.id },
    });

    const io = getIO();
    io.to(`squad:${req.params.squadId}`).emit('squad:member-left', {
      squadId: req.params.squadId,
      userId: req.user!.userId,
    });

    res.json({ message: 'Left squad' });
  } catch (error) {
    console.error('Leave squad error:', error);
    res.status(500).json({ error: 'Failed to leave squad' });
  }
});

// =============================================================================
// DIRECT MESSAGES
// =============================================================================

/**
 * GET /api/messages/direct/:userId
 * Get DM conversation with a user
 */
router.get('/direct/:userId', authenticateJWT, async (req, res) => {
  try {
    const { cursor, limit = '50' } = req.query;
    const limitNum = Math.min(parseInt(limit as string) || 50, 100);

    const canMessage = await canSendDirectMessage(req.user!.userId, req.params.userId);
    if (!canMessage) {
      return res.status(403).json({ error: 'Cannot message this user' });
    }

    const whereClause: any = {
      channel_type: 'DIRECT',
      is_deleted: false,
      OR: [
        { sender_id: req.user!.userId, recipient_id: req.params.userId },
        { sender_id: req.params.userId, recipient_id: req.user!.userId },
      ],
    };

    if (cursor) {
      whereClause.created_at = { lt: new Date(cursor as string) };
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      take: limitNum,
      include: {
        sender: {
          select: {
            id: true,
            display_name: true,
            avatar_url: true,
          },
        },
        reactions: true,
      },
    });

    const nextCursor = messages.length === limitNum
      ? messages[messages.length - 1].created_at.toISOString()
      : null;

    res.json({
      messages: messages.reverse(),
      nextCursor,
      hasMore: !!nextCursor,
    });
  } catch (error) {
    console.error('Get DMs error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

/**
 * GET /api/messages/conversations
 * Get list of DM conversations
 */
router.get('/conversations', authenticateJWT, async (req, res) => {
  try {
    const conversations = await prisma.$queryRaw`
      WITH ranked_messages AS (
        SELECT 
          m.*,
          ROW_NUMBER() OVER (
            PARTITION BY LEAST(m.sender_id, m.recipient_id), GREATEST(m.sender_id, m.recipient_id)
            ORDER BY m.created_at DESC
          ) as rn
        FROM messages m
        WHERE m.channel_type = 'DIRECT'
          AND m.is_deleted = false
          AND (m.sender_id = ${req.user!.userId} OR m.recipient_id = ${req.user!.userId})
      )
      SELECT * FROM ranked_messages WHERE rn = 1
      ORDER BY created_at DESC
      LIMIT 50
    `;

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// =============================================================================
// MEDIA UPLOAD
// =============================================================================

/**
 * POST /api/messages/upload
 * Get presigned URL for message media upload
 */
router.post('/upload', authenticateJWT, async (req, res) => {
  try {
    const { filename, contentType } = z.object({
      filename: z.string().min(1),
      contentType: z.string().regex(/^(image|video)\//),
    }).parse(req.body);

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const ext = filename.split('.').pop() || 'jpg';
    const key = `messages/${req.user!.userId}/${timestamp}-${randomId}.${ext}`;

    const uploadUrl = await s3Service.generatePresignedUploadUrl({
      key,
      contentType,
      expiresIn: 300,
    });

    res.json({
      uploadUrl,
      key,
      publicUrl: getPublicUrl(key),
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Upload URL error:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

// =============================================================================
// HELPERS
// =============================================================================

async function canSendDirectMessage(senderId: string, recipientId: string): Promise<boolean> {
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { user_a_id: senderId, user_b_id: recipientId, status: 'ACCEPTED' },
        { user_a_id: recipientId, user_b_id: senderId, status: 'ACCEPTED' },
      ],
    },
  });

  if (friendship) return true;

  const trainerRelation = await prisma.trainerClient.findFirst({
    where: {
      OR: [
        { trainer_id: senderId, client_id: recipientId, status: 'ACTIVE' },
        { trainer_id: recipientId, client_id: senderId, status: 'ACTIVE' },
      ],
    },
  });

  return !!trainerRelation;
}

export default router;
