import { Express } from 'express';
import authRoutes from './authRoutes';
import challengeRoutes from './challengeRoutes';
import progressRoutes from './progressRoutes';
import storageRoutes from './storageRoutes';

export const initRoutes = (app: Express) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/challenges', challengeRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/storage', storageRoutes);
};


