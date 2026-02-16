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

  // Media proxy: redirects to presigned Tigris download URL
  // Objects in Railway Object Storage are private, so we proxy access
  app.get('/api/media/*', async (req, res) => {
    try {
      const key = req.params[0];
      if (!key) return res.status(400).json({ error: 'Missing key' });
      const downloadUrl = await s3Service.generatePresignedDownloadUrl(key, 3600);
      res.redirect(downloadUrl);
    } catch (error) {
      console.error('Media proxy error:', error);
      res.status(404).json({ error: 'Media not found' });
    }
  });
};
