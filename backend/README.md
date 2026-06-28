# FitsiteGonga Backend API

Express.js backend API for FitsiteGonga, hosted on Railway with PostgreSQL and AWS S3 integration.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io
- **File Storage**: S3-compatible object storage (Railway Object Storage / Tigris, presigned URLs)
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
- `RAILWAY_OBJECT_STORAGE_ENDPOINT` - S3-compatible object storage endpoint (e.g. `https://your-project.railway.app`)
- `RAILWAY_OBJECT_STORAGE_ACCESS_KEY_ID` - Object storage access key
- `RAILWAY_OBJECT_STORAGE_SECRET_ACCESS_KEY` - Object storage secret key
- `RAILWAY_OBJECT_STORAGE_BUCKET_NAME` - Object storage bucket name
- `FRONTEND_URL` - Frontend URL for CORS (comma-separated for multiple origins)
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Set to `production` in deployments so cookies are marked secure and CORS is strict

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
- `POST /api/auth/forgot-password` - Return password-reset guidance; email delivery is disabled
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
4. (Optional) Add `backend/railway.json` to make build/start commands explicit
5. Deploy

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

### Railway Migration Recovery: `ChannelType` Already Exists

If Railway fails on `prisma migrate deploy` with `ERROR: type "ChannelType" already exists`
for migration `20260628030334_init`, the database was likely synced before Prisma
recorded that migration as applied.

Run the recovery helper against the Railway database:

```bash
npm run db:recover:20260628030334
npx prisma migrate deploy
```

The helper only marks `20260628030334_init` as applied when every enum and table from
that migration already exists. If it reports missing objects, do not mark the migration
applied yet. Roll the database forward first:

```bash
npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script > forward.sql
npx prisma db execute --stdin --url "$DATABASE_URL" < forward.sql
npx prisma migrate resolve --applied 20260628030334_init
npx prisma migrate deploy
```

### JWT Errors

- Ensure `JWT_SECRET` is set and matches between services
- Check token expiry (15 minutes for access token)
- Verify httpOnly cookie settings in production

### Object Storage Upload Failures

- Verify `RAILWAY_OBJECT_STORAGE_*` credentials in environment variables
- Check object storage bucket permissions
- Ensure the access key has `PutObject` permission
- In local development, storage endpoints return 503 when object storage is not configured; this is expected

### Socket.io Connection Issues

- Check CORS configuration matches frontend URL
- Verify JWT token sent in handshake
- Check Railway WebSocket support enabled
