import { Express } from 'express';
import authRoutes from './authRoutes';
import challengeRoutes from './challengeRoutes';
import progressRoutes from './progressRoutes';
import storageRoutes from './storageRoutes';
import adminRoutes from './adminRoutes';
import liftRoutes from './liftRoutes';
import messageRoutes from './messageRoutes';
import { getPublicUrl } from '../services/s3Service';

export const initRoutes = (app: Express) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/challenges', challengeRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/storage', storageRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/lifts', liftRoutes);
  app.use('/api/messages', messageRoutes);

  // Media proxy: permanent redirect to direct Tigris public URL
  // Fallback for old messages that stored /api/media/ URLs before public ACL
  app.get('/api/media/*', (req, res) => {
    const key = req.params[0];
    if (!key) return res.status(400).json({ error: 'Missing key' });
    const publicUrl = getPublicUrl(key);
    res.set('Cache-Control', 'public, max-age=86400'); // 24h
    res.redirect(301, publicUrl);
  });
};
