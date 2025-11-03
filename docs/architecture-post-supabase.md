# Post-Supabase Architecture Documentation

## Overview

This document describes the complete architecture for FitsiteGonga after migrating from Supabase to a custom Railway + AWS infrastructure. The MVVM architecture remains unchanged - only the data access layer and infrastructure are modified.

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│  Frontend: Next.js (Vercel)                 │
│  ┌───────────────────────────────────────┐ │
│  │ Controllers (unchanged)                │ │
│  │ - useChallengeController               │ │
│  │ - useProgressController                │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ ViewModels (unchanged)                │ │
│  │ - toChallengeVM                       │ │
│  │ - toProgressVM                        │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ Repositories (updated)                │ │
│  │ - ChallengeRepository → HTTP API      │ │
│  │ - ProgressRepository → HTTP API       │ │
│  │ - AuthRepository (new)                │ │
│  └───────────────────────────────────────┘ │
└──────────────┬────────────────────────────┘
               │ HTTPS / WebSocket
               ↓
┌─────────────────────────────────────────────┐
│  Backend: Express API (Railway)            │
│  ┌───────────────────────────────────────┐ │
│  │ Routes                                │ │
│  │ - /api/auth/*                         │ │
│  │ - /api/challenges/*                   │ │
│  │ - /api/progress/*                     │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ Services                              │ │
│  │ - authService (JWT, bcrypt)          │ │
│  │ - s3Service (presigned URLs)          │ │
│  │ - realtimeService (Socket.io)         │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ Repositories                          │ │
│  │ - userRepository (PostgreSQL)        │ │
│  │ - challengeRepository (PostgreSQL)   │ │
│  │ - progressRepository (PostgreSQL)    │ │
│  └───────────────────────────────────────┘ │
└──────┬───────────────────┬──────────────────┘
       │                   │
       ↓                   ↓
┌──────────────┐   ┌─────────────────┐
│ Railway      │   │ AWS S3           │
│ PostgreSQL   │   │ File Storage     │
└──────────────┘   └─────────────────┘
```

## Technology Stack

### Frontend (Unchanged)

- **Framework**: Next.js 14 (App Router)
- **Deployment**: Vercel (Hobby tier - Free)
- **State**: Zustand, React Hook Form
- **Styling**: Tailwind CSS
- **Real-time**: Socket.io client

### Backend (New)

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (Railway)
- **ORM**: Prisma (type-safe queries)
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io server
- **Deployment**: Railway (Starter - $5/month)
- **Storage**: AWS S3 with presigned URLs

### Infrastructure

- **Database**: Railway PostgreSQL (included in $5 plan)
- **File Storage**: AWS S3 (pay-per-use, ~$1-2/month)
- **CI/CD**: GitHub Actions (free)
- **Monitoring**: Sentry (free tier), Railway logs

## Data Flow

### Authentication Flow

```
1. User submits login form → Frontend
2. Frontend → POST /api/auth/login {email, password}
3. Backend → Query PostgreSQL for user by email
4. Backend → Verify password with bcrypt.compare()
5. Backend → Generate JWT access token (15min) + refresh token (7d)
6. Backend → Return tokens to Frontend
7. Frontend → Store tokens in httpOnly cookies
8. Frontend → Decode JWT to get user data
9. Frontend → Update UI with authenticated state
```

### Progress Upload Flow

```
1. User selects file + enters progress data → Frontend
2. Frontend → POST /api/progress/upload-request {challengeId, metadata}
3. Backend → Verify JWT middleware
4. Backend → Generate S3 presigned PUT URL
5. Backend → Return presigned URL to Frontend
6. Frontend → PUT file directly to S3 using presigned URL
7. Frontend → POST /api/progress {challengeId, value, s3Key, notes}
8. Backend → INSERT into progress_logs table
9. Backend → Emit 'progress:new' event via Socket.io
10. Socket.io → Broadcast to all clients in challenge room
11. Frontend → Receive realtime update, update UI
```

### Challenge Creation Flow

```
1. Trainer creates challenge → Frontend
2. Frontend → POST /api/challenges {name, description, ...}
3. Backend → Verify JWT + role middleware (requireRole(['trainer', 'admin']))
4. Backend → INSERT into challenges table
5. Backend → Return created challenge
6. Frontend → Update challenge list
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('client', 'trainer', 'admin')),
  fitness_level TEXT NOT NULL CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  goals TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Challenges Table

```sql
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('strength', 'cardio', 'nutrition', 'custom')),
  type TEXT NOT NULL CHECK (type IN ('duration', 'repetition', 'distance', 'custom')),
  goal_value INTEGER NOT NULL,
  goal_unit TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  participants UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_challenges_created_by ON challenges(created_by);
CREATE INDEX idx_challenges_is_active ON challenges(is_active);
CREATE INDEX idx_challenges_category ON challenges(category);
```

### Progress Logs Table

```sql
CREATE TABLE progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  challenge_id UUID NOT NULL REFERENCES challenges(id),
  value INTEGER NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  photo_url TEXT,  -- S3 URL
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_progress_logs_user_id ON progress_logs(user_id);
CREATE INDEX idx_progress_logs_challenge_id ON progress_logs(challenge_id);
CREATE INDEX idx_progress_logs_logged_at ON progress_logs(logged_at DESC);
CREATE INDEX idx_progress_logs_challenge_user ON progress_logs(challenge_id, user_id);
```

## Security Model

### Authentication

- **Password Storage**: bcrypt hashing (10 rounds)
- **Token Format**: JWT with HS256 algorithm
- **Access Token**: 15-minute expiry
- **Refresh Token**: 7-day expiry, stored in httpOnly cookie
- **Token Storage**: httpOnly cookies (XSS protection) + optional localStorage for mobile

### Authorization (RLS Replacement)

```typescript
// Role-based middleware replaces Supabase RLS
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Usage in routes
router.post('/challenges', authenticateJWT, requireRole(['trainer', 'admin']), createChallenge);
```

### Data Access Rules

- **Users**: Can only view/edit their own profile
- **Progress Logs**: Users can only view/edit their own logs (unless trainer/admin)
- **Challenges**: All authenticated users can view, only trainers/admins can create
- **Realtime**: Socket.io rooms scoped by challenge_id and user_id

## File Storage Architecture

### S3 Bucket Structure

```
fitsite-assets/
├── progress-photos/
│   ├── {userId}/
│   │   ├── {challengeId}/
│   │   │   └── {timestamp}-{randomId}.jpg
│   │   └── ...
│   └── ...
└── avatars/
    └── {userId}.jpg
```

### Presigned URL Flow

1. Client requests upload permission for specific file
2. Backend generates presigned PUT URL with:
   - Expiry: 5 minutes
   - Content-Type: image/jpeg, image/png
   - Max file size: 5MB
3. Client uploads directly to S3
4. Client confirms upload completion to backend
5. Backend stores S3 key in database

## Realtime Architecture

### Socket.io Room Structure

```
Room Names:
- `user:{userId}` - User-specific notifications
- `challenge:{challengeId}` - Challenge progress updates
- `global` - System-wide announcements (admin only)
```

### Event Types

```typescript
// Client → Server
'socket:join:challenge' - Join challenge room
'socket:leave:challenge' - Leave challenge room

// Server → Client
'progress:new' - New progress entry created
'progress:updated' - Progress entry updated
'progress:deleted' - Progress entry deleted
'challenge:created' - New challenge created
'challenge:updated' - Challenge updated
'achievement:earned' - User earned achievement
```

### Authentication for WebSockets

- JWT token sent during Socket.io handshake
- Server validates token before allowing connection
- User data attached to socket.data.user

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Invalidate tokens
- `GET /api/auth/me` - Get current user data

### Challenges

- `GET /api/challenges` - List all active challenges
- `GET /api/challenges/:id` - Get challenge details
- `POST /api/challenges` - Create challenge (trainer/admin)
- `PUT /api/challenges/:id` - Update challenge (trainer/admin)
- `DELETE /api/challenges/:id` - Delete challenge (trainer/admin)
- `POST /api/challenges/:id/join` - Join challenge
- `POST /api/challenges/:id/leave` - Leave challenge

### Progress

- `GET /api/progress?challengeId=:id` - Get progress logs for challenge
- `GET /api/progress?userId=:id` - Get user's progress logs
- `POST /api/progress/upload-request` - Get S3 presigned URL
- `POST /api/progress` - Create progress entry
- `PUT /api/progress/:id` - Update progress entry
- `DELETE /api/progress/:id` - Delete progress entry

### Storage

- `POST /api/storage/presigned-url` - Generate S3 presigned URL
- `DELETE /api/storage/:key` - Delete file from S3 (admin)

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=fitsite-assets

# Server
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app

# Socket.io
SOCKET_IO_PORT=3001
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app
```

## Deployment Architecture

### Railway Backend

- **Service**: Express API + Socket.io server
- **Database**: Railway PostgreSQL (auto-provisioned)
- **Environment**: Node.js 18
- **Build**: `npm install && npm run build`
- **Start**: `node dist/server.js`

### Vercel Frontend

- **Framework**: Next.js
- **Build**: `npm run build`
- **Environment**: Static export + API routes (delegated to Railway)

### CI/CD Pipeline

```yaml
GitHub Actions:
1. Push to main → Trigger workflow
2. Run tests (Vitest)
3. Build backend → Deploy to Railway
4. Build frontend → Deploy to Vercel
5. Run E2E tests (Playwright)
```

## Cost Breakdown (Monthly)

| Component    | Service                 | Cost           |
| ------------ | ----------------------- | -------------- |
| Frontend     | Vercel Hobby            | $0             |
| Backend API  | Railway Starter         | $5             |
| Database     | Railway PostgreSQL      | $0 (included)  |
| File Storage | AWS S3                  | $1-2           |
| Real-time    | Socket.io (self-hosted) | $0             |
| CI/CD        | GitHub Actions          | $0             |
| Monitoring   | Sentry Free Tier        | $0             |
| **Total**    |                         | **$6-7/month** |

## Migration Checklist

### Phase 1: Infrastructure Setup

- [ ] Create Railway account and project
- [ ] Provision PostgreSQL database on Railway
- [ ] Create AWS account and S3 bucket
- [ ] Generate IAM user with S3 permissions
- [ ] Set up environment variables

### Phase 2: Backend Development

- [ ] Create Express server structure
- [ ] Implement auth service (JWT + bcrypt)
- [ ] Create database schema with Prisma
- [ ] Build API routes (auth, challenges, progress)
- [ ] Implement S3 presigned URL service
- [ ] Set up Socket.io server
- [ ] Add error handling and logging

### Phase 3: Frontend Migration

- [ ] Create API client to replace Supabase client
- [ ] Update ChallengeRepository
- [ ] Update ProgressRepository
- [ ] Create AuthRepository
- [ ] Add Socket.io client hook
- [ ] Update components to use new repositories

### Phase 4: Data Migration

- [ ] Export data from Supabase
- [ ] Clean migration SQL files
- [ ] Import to Railway PostgreSQL
- [ ] Migrate files from Supabase Storage to S3
- [ ] Verify data integrity

### Phase 5: Testing & Deployment

- [ ] Unit tests for backend services
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical flows
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Monitor logs and errors

## Performance Considerations

### Database

- All foreign keys indexed
- Composite indexes on common query patterns
- Connection pooling (max 20 connections)

### API Response Times

- Target: <200ms for most endpoints
- Caching: None initially (add Redis if needed at scale)

### File Uploads

- Direct to S3 (bypasses backend server)
- Max file size: 5MB
- Allowed types: image/jpeg, image/png

### Realtime

- Socket.io with Redis adapter for horizontal scaling (future)
- Current: Single Railway instance sufficient for 500 concurrent users

## Scalability Roadmap

### Current (MVP)

- Single Railway backend instance
- Railway PostgreSQL
- Self-hosted Socket.io
- **Capacity**: 100-500 concurrent users

### Scale to 2000+ users

- Add Redis adapter for Socket.io
- Deploy multiple Railway instances with load balancer
- Add database read replicas
- Implement CDN for static assets (CloudFront)

### Scale to 10000+ users

- Migrate to AWS ECS/Fargate
- Use AWS RDS with read replicas
- Use AWS ElastiCache for Redis
- Implement AWS CloudFront CDN

## Security Best Practices

1. **Password Security**: bcrypt with 10 rounds minimum
2. **JWT Security**: Strong secrets (32+ characters), short expiry times
3. **HTTPS Only**: All traffic encrypted
4. **CORS**: Restricted to frontend domain only
5. **Rate Limiting**: Implement on auth endpoints (future)
6. **Input Validation**: Zod schemas for all inputs
7. **SQL Injection**: Prisma ORM prevents SQL injection
8. **XSS Protection**: httpOnly cookies, sanitize user inputs

## Monitoring & Observability

### Error Tracking

- **Sentry**: Automatic error capture and reporting
- **Railway Logs**: Request logs and server output

### Performance Monitoring

- **Vercel Analytics**: Frontend performance
- **Railway Metrics**: API response times

### Uptime Monitoring

- **Uptime Robot**: HTTP health checks (free tier)

## Troubleshooting Guide

### Common Issues

1. **Database Connection Errors**
   - Check DATABASE_URL in Railway dashboard
   - Verify PostgreSQL service is running
   - Check connection pool limits

2. **JWT Validation Failures**
   - Ensure JWT_SECRET matches between services
   - Check token expiry times
   - Verify httpOnly cookie settings

3. **S3 Upload Failures**
   - Verify AWS credentials
   - Check bucket permissions
   - Verify presigned URL expiry

4. **Socket.io Connection Issues**
   - Check CORS configuration
   - Verify JWT token in handshake
   - Check Railway WebSocket support

## Future Enhancements

1. **Redis Caching**: Cache frequently accessed data
2. **CDN**: CloudFront for static assets
3. **Email Service**: AWS SES for notifications
4. **Background Jobs**: AWS Lambda for async tasks
5. **Search**: Elasticsearch for challenge search
6. **Analytics**: Custom analytics dashboard
