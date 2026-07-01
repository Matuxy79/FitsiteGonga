import { Express } from 'express';
import authRoutes from './authRoutes';
import challengeRoutes from './challengeRoutes';
import progressRoutes from './progressRoutes';
import adminRoutes from './adminRoutes';
import liftRoutes from './liftRoutes';
import messageRoutes from './messageRoutes';
import userRoutes from './userRoutes';
import workoutRoutes from './workoutRoutes';
import programRoutes from './programRoutes';
import nutritionRoutes from './nutritionRoutes';
import channelRoutes from './channelRoutes';
import { storageService } from '../services/storageService';

export const initRoutes = (app: Express) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/challenges', challengeRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/lifts', liftRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/workouts', workoutRoutes);
  app.use('/api/programs', programRoutes);
  app.use('/api/nutrition', nutritionRoutes);
  app.use('/api/messages/squads/:squadId/channels', channelRoutes);

  app.get('/api/media/*', async (req, res) => {
    const key = req.path.slice('/api/media/'.length);
    if (!key) return res.status(400).json({ error: 'Missing key' });
    try {
      const { stream, contentType, contentLength } = await storageService.getObjectStream(key);
      res.set('Cache-Control', 'private, max-age=3600');
      if (contentType) res.set('Content-Type', contentType);
      if (contentLength) res.set('Content-Length', String(contentLength));
      stream.pipe(res);
    } catch {
      res.status(404).json({ error: 'File not found' });
    }
  });
};
