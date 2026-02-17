import { Express } from 'express';
import authRoutes from './authRoutes';
import challengeRoutes from './challengeRoutes';
import progressRoutes from './progressRoutes';
import storageRoutes from './storageRoutes';
import adminRoutes from './adminRoutes';
import liftRoutes from './liftRoutes';
import messageRoutes from './messageRoutes';
import { s3Service } from '../services/s3Service';

export const initRoutes = (app: Express) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/challenges', challengeRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/storage', storageRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/lifts', liftRoutes);
  app.use('/api/messages', messageRoutes);

  // Media proxy: generate presigned download URL and redirect
  // Objects stay private, no ACL config needed
  app.get('/api/media/*', async (req, res) => {
    const key = req.path.slice('/api/media/'.length);
    if (!key) return res.status(400).json({ error: 'Missing key' });
    try {
      const signedUrl = await s3Service.generatePresignedDownloadUrl(key, 3600);
      res.set('Cache-Control', 'private, max-age=3500');
      res.redirect(302, signedUrl);
    } catch {
      res.status(404).json({ error: 'File not found' });
    }
  });
};
