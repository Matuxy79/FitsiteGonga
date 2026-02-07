# FitsiteGonga Backend API

Express.js backend API for FitsiteGonga, hosted on Railway with PostgreSQL and AWS S3 integration.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io
- **File Storage**: AWS S3 (presigned URLs)
- **Validation**: Zod

## Setup

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Railway or local)
- AWS account with S3 bucket

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
```

### Environment Variables

See `.env.example` for required variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for access tokens (32+ chars)
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `PASSWORD_RESET_TTL_MINUTES` - Password reset link expiry (minutes, default: 60)
- `RESEND_API_KEY` - Resend API key (optional; if unset, reset links are logged)
- `RESEND_FROM_EMAIL` - From address for reset emails (optional)
- `AWS_REGION` - AWS region (e.g., us-east-1)
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_S3_BUCKET_NAME` - S3 bucket name
- `FRONTEND_URL` - Frontend URL for CORS
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Set to `production` in deployments so cookies are marked secure

### Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password` - Reset password using token

### Challenges

- `GET /api/challenges` - List all active challenges
- `GET /api/challenges/:id` - Get challenge by ID
- `POST /api/challenges` - Create challenge (trainer/admin)
- `PUT /api/challenges/:id` - Update challenge (trainer/admin)
- `DELETE /api/challenges/:id` - Delete challenge (trainer/admin)
- `POST /api/challenges/:id/join` - Join challenge
- `POST /api/challenges/:id/leave` - Leave challenge

### Progress

- `GET /api/progress?challengeId=:id` - Get progress logs for challenge
- `GET /api/progress?userId=:id` - Get user's progress logs
- `GET /api/progress/:id` - Get progress log by ID
- `POST /api/progress` - Create progress entry
- `PUT /api/progress/:id` - Update progress entry
- `DELETE /api/progress/:id` - Delete progress entry

### Storage

- `POST /api/storage/presigned-url` - Generate S3 presigned upload URL
- `POST /api/storage/presigned-url/progress-photo` - Generate presigned URL for progress photo
- `DELETE /api/storage/:key` - Delete file from S3

## Socket.io Events

### Client → Server

- `join:challenge` - Join challenge room
- `leave:challenge` - Leave challenge room

### Server → Client

- `progress:new` - New progress entry created
- `progress:updated` - Progress entry updated
- `progress:deleted` - Progress entry deleted
- `challenge:created` - New challenge created
- `challenge:updated` - Challenge updated
- `challenge:deleted` - Challenge deleted
- `challenge:joined` - User joined challenge
- `challenge:left` - User left challenge

## Authentication

All protected endpoints require JWT token in:

- Authorization header: `Bearer <token>`
- Or httpOnly cookie: `accessToken`

## Role-Based Access Control

- **CLIENT**: Can view challenges, join challenges, create/update own progress
- **TRAINER**: Can create/edit challenges, view all progress logs
- **ADMIN**: Full access

## Deployment

### Railway

1. Connect GitHub repository
2. Add PostgreSQL service
3. Set environment variables
4. Deploy

Railway will automatically:

- Detect Node.js
- Run `npm install`
- Run `npm run build`
- Start with `npm start`

## Project Structure

```
backend/
├── src/
│   ├── db/
│   │   └── client.ts          # Prisma client
│   ├── middleware/
│   │   └── authMiddleware.ts  # JWT auth & role checks
│   ├── repositories/
│   │   ├── userRepository.ts
│   │   ├── challengeRepository.ts
│   │   └── progressRepository.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── authRoutes.ts
│   │   ├── challengeRoutes.ts
│   │   ├── progressRoutes.ts
│   │   └── storageRoutes.ts
│   ├── services/
│   │   ├── authService.ts     # JWT & bcrypt
│   │   └── s3Service.ts       # S3 presigned URLs
│   ├── socket/
│   │   └── socketServer.ts    # Socket.io setup
│   └── server.ts              # Express app
├── prisma/
│   └── schema.prisma          # Database schema
├── package.json
└── tsconfig.json
```

## Testing

```bash
# Run tests (when implemented)
npm test
```

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` format: `postgresql://user:pass@host:5432/dbname`
- Check Railway PostgreSQL service is running
- Test connection: `psql $DATABASE_URL`

### JWT Errors

- Ensure `JWT_SECRET` is set and matches between services
- Check token expiry (15 minutes for access token)
- Verify httpOnly cookie settings in production

### S3 Upload Failures

- Verify AWS credentials in environment variables
- Check S3 bucket permissions
- Ensure IAM user has `PutObject` permission

### Socket.io Connection Issues

- Check CORS configuration matches frontend URL
- Verify JWT token sent in handshake
- Check Railway WebSocket support enabled
