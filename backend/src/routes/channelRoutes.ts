import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';
import { authenticateJWT } from '../middleware/authMiddleware';
import { channelRepository } from '../repositories/channelRepository';
import { getIO } from '../socket/socketServer';

const router: RouterType = Router({ mergeParams: true });

const channelSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  channel_type: z.enum(['TEXT', 'GLOBAL', 'SQUAD', 'DIRECT', 'TRAINER']).optional(),
});

const messageSchema = z.object({
  content: z.string().min(1).max(2000),
  media_urls: z.array(z.string()).optional(),
  parent_id: z.string().optional(),
});

const reactionSchema = z.object({
  emoji: z.string().min(1).max(10),
});

/**
 * GET /api/messages/squads/:squadId/channels
 */
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const channels = await channelRepository.listChannels(req.params.squadId);
    res.json({ channels });
  } catch (error: any) {
    console.error('List channels error:', error);
    res.status(500).json({ error: 'Failed to list channels' });
  }
});

/**
 * POST /api/messages/squads/:squadId/channels
 */
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const validated = channelSchema.parse(req.body);
    const channel = await channelRepository.createChannel({
      squad_id: req.params.squadId,
      name: validated.name,
      description: validated.description,
      channel_type: validated.channel_type || 'TEXT',
      created_by: req.user!.userId,
    });
    res.status(201).json({ channel });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create channel error:', error);
    res.status(500).json({ error: 'Failed to create channel' });
  }
});

/**
 * GET /api/messages/channels/:channelId
 */
router.get('/channel/:channelId', authenticateJWT, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const before = req.query.before as string | undefined;
    const [channel, messages] = await Promise.all([
      channelRepository.findChannelById(req.params.channelId),
      channelRepository.listMessages(req.params.channelId, limit, before),
    ]);
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    res.json({ channel, messages });
  } catch (error: any) {
    console.error('Get channel messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

/**
 * PATCH /api/messages/channels/:channelId
 */
router.patch('/channel/:channelId', authenticateJWT, async (req, res) => {
  try {
    const validated = channelSchema.partial().parse(req.body);
    const channel = await channelRepository.findChannelById(req.params.channelId);
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    if (channel.created_by !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const updated = await channelRepository.updateChannel(req.params.channelId, validated);
    res.json({ channel: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update channel error:', error);
    res.status(500).json({ error: 'Failed to update channel' });
  }
});

/**
 * DELETE /api/messages/channels/:channelId
 */
router.delete('/channel/:channelId', authenticateJWT, async (req, res) => {
  try {
    const channel = await channelRepository.findChannelById(req.params.channelId);
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    if (channel.created_by !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }
    await channelRepository.deleteChannel(req.params.channelId);
    res.json({ message: 'Channel deleted' });
  } catch (error: any) {
    console.error('Delete channel error:', error);
    res.status(500).json({ error: 'Failed to delete channel' });
  }
});

/**
 * POST /api/messages/channels/:channelId/messages
 */
router.post('/channel/:channelId/messages', authenticateJWT, async (req, res) => {
  try {
    const validated = messageSchema.parse(req.body);
    const channel = await channelRepository.findChannelById(req.params.channelId);
    if (!channel) return res.status(404).json({ error: 'Channel not found' });

    const message = await channelRepository.createMessage({
      content: validated.content,
      sender_id: req.user!.userId,
      channel_id: req.params.channelId,
      media_urls: validated.media_urls,
      parent_id: validated.parent_id,
    });

    try {
      getIO().to(`squad:${channel.squad_id}`).emit('message:channel', { channelId: channel.id, message });
    } catch {
      // ignore
    }

    res.status(201).json({ message });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create channel message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * POST /api/messages/channels/:channelId/messages/:messageId/reactions
 */
router.post('/channel/:channelId/messages/:messageId/reactions', authenticateJWT, async (req, res) => {
  try {
    const validated = reactionSchema.parse(req.body);
    await channelRepository.addReaction(req.params.messageId, req.user!.userId, validated.emoji);
    res.json({ message: 'Reaction added' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Reaction error:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

/**
 * DELETE /api/messages/channels/:channelId/messages/:messageId/reactions/:emoji
 */
router.delete('/channel/:channelId/messages/:messageId/reactions/:emoji', authenticateJWT, async (req, res) => {
  try {
    await channelRepository.removeReaction(req.params.messageId, req.user!.userId, req.params.emoji);
    res.json({ message: 'Reaction removed' });
  } catch (error: any) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ error: 'Failed to remove reaction' });
  }
});

export default router;
