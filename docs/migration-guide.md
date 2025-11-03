# Supabase to Railway + AWS Migration Guide

## Overview

This guide provides step-by-step instructions for migrating FitsiteGonga from Supabase to Railway + AWS infrastructure.

## Prerequisites

- Node.js 18+ installed
- Railway account (free tier available)
- AWS account with $200 credits
- GitHub account (for CI/CD)
- Supabase project access (for data export)

## Phase 1: Infrastructure Setup (Day 1-2)

### Step 1.1: Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Create new project: "FitsiteGonga Backend"
4. Add PostgreSQL service
5. Note the `DATABASE_URL` from PostgreSQL service settings

### Step 1.2: Create AWS S3 Bucket

1. Go to AWS Console → S3
2. Create bucket: `fitsite-assets-[your-region]`
3. Configure:
   - Region: `us-east-1` (or closest to users)
   - Block public access: **Enabled** (we'll use presigned URLs)
   - Versioning: Disabled (for cost savings)
4. Create IAM user for S3 access:
   - Go to IAM → Users → Create User
   - Name: `fitsite-s3-user`
   - Attach policy: `AmazonS3FullAccess` (or custom policy for bucket only)
   - Generate Access Key ID and Secret Access Key
   - **Save these credentials securely**

### Step 1.3: Generate JWT Secrets

```bash
# Generate JWT secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate refresh token secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 1.4: Set Railway Environment Variables

In Railway project dashboard, add these environment variables:

```bash
DATABASE_URL=<from-postgres-service>
JWT_SECRET=<generated-secret>
JWT_REFRESH_SECRET=<generated-secret>
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<from-iam-user>
AWS_SECRET_ACCESS_KEY=<from-iam-user>
AWS_S3_BUCKET_NAME=fitsite-assets-[your-region]
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
PORT=3000
```

## Phase 2: Backend Development (Day 3-14)

### Step 2.1: Create Backend Structure

```bash
# In project root
mkdir backend
cd backend
npm init -y
```

Install dependencies:

```bash
npm install express cors helmet morgan dotenv
npm install jsonwebtoken bcryptjs
npm install @prisma/client pg
npm install socket.io
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install zod express-rate-limit

npm install -D typescript @types/node @types/express @types/bcryptjs @types/jsonwebtoken @types/cors
npm install -D ts-node nodemon @types/morgan
npm install -D prisma
```

### Step 2.2: Initialize Prisma

```bash
npx prisma init
```

Configure `prisma/schema.prisma` (see backend/prisma/schema.prisma in codebase)

### Step 2.3: Run Initial Migration

```bash
# Generate Prisma Client
npx prisma generate

# Create migration from schema
npx prisma migrate dev --name init
```

### Step 2.4: Export Supabase Data

```bash
# Using Supabase CLI
npx supabase db dump --data-only -f supabase_export.sql

# Or using pg_dump directly
pg_dump "postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres" \
  --data-only \
  --table=users \
  --table=challenges \
  --table=progress_logs \
  --table=achievements \
  > supabase_data_export.sql
```

### Step 2.5: Clean and Import Data

1. Open `supabase_data_export.sql`
2. Remove Supabase-specific extensions and RLS policies
3. Update table names if different
4. Import to Railway PostgreSQL:

```bash
# Get Railway PostgreSQL connection string
psql $DATABASE_URL < cleaned_supabase_data.sql
```

Or use Railway's database dashboard → Connect → Run SQL

## Phase 3: Frontend Migration (Day 15-21)

### Step 3.1: Create API Client

Replace `src/lib/supabase.ts` with `src/lib/apiClient.ts` (see codebase)

### Step 3.2: Update Repositories

Modify repositories to use HTTP API calls instead of Supabase client:

- `src/repositories/ChallengeRepository.ts`
- `src/repositories/ProgressRepository.ts`
- Create `src/repositories/AuthRepository.ts`

### Step 3.3: Add Socket.io Client

Create `src/lib/socketClient.ts` and `src/hooks/useRealtime.ts`

### Step 3.4: Update Environment Variables

In Vercel dashboard, add:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app
```

## Phase 4: File Migration (Day 22-23)

### Step 4.1: Create Migration Script

Create `scripts/migrate-files.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const supabase = createClient(process.env.OLD_SUPABASE_URL!, process.env.OLD_SUPABASE_KEY!);

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function migrateFiles() {
  // List all files in Supabase Storage
  const { data: files, error } = await supabase.storage.from('progress-photos').list();

  if (error) throw error;

  for (const file of files) {
    // Download from Supabase
    const { data, error: downloadError } = await supabase.storage
      .from('progress-photos')
      .download(file.name);

    if (downloadError) {
      console.error(`Failed to download ${file.name}:`, downloadError);
      continue;
    }

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: `progress-photos/${file.name}`,
      Body: data,
      ContentType: file.metadata?.mimetype || 'image/jpeg',
    });

    await s3.send(uploadCommand);
    console.log(`Migrated ${file.name}`);
  }
}

migrateFiles().catch(console.error);
```

Run migration:

```bash
node scripts/migrate-files.ts
```

## Phase 5: Testing & Deployment (Day 24-28)

### Step 5.1: Local Testing

```bash
# Backend
cd backend
npm run dev

# Frontend
cd ..
npm run dev
```

Test:

- User registration
- User login
- Create challenge (as trainer)
- Upload progress with photo
- Realtime updates

### Step 5.2: Deploy Backend to Railway

1. Push backend code to GitHub
2. In Railway dashboard:
   - New Service → GitHub Repo
   - Select your repository
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/server.js`

### Step 5.3: Deploy Frontend to Vercel

1. Push frontend code to GitHub
2. Go to Vercel dashboard
3. Import project from GitHub
4. Set environment variables
5. Deploy

### Step 5.4: Verify Deployment

1. Test API endpoints:

```bash
curl https://your-backend.railway.app/api/health
```

2. Test authentication:

```bash
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

3. Verify realtime:
   - Open app in browser
   - Open browser console
   - Check Socket.io connection logs

## Verification Checklist

- [ ] Backend deployed to Railway
- [ ] Database connected and migrations applied
- [ ] All API endpoints responding
- [ ] Authentication working (login/register)
- [ ] JWT tokens being generated and validated
- [ ] File uploads to S3 working
- [ ] Socket.io connections established
- [ ] Realtime updates broadcasting
- [ ] Frontend deployed to Vercel
- [ ] Frontend connecting to Railway API
- [ ] All Supabase dependencies removed
- [ ] Data successfully migrated
- [ ] Files migrated to S3
- [ ] Monitoring and logging set up

## Rollback Plan

If migration fails:

1. **Keep Supabase running** until migration is verified
2. **Database rollback**: Restore from Supabase backup
3. **Code rollback**: Revert to previous commit with Supabase
4. **Deploy previous version** to Railway/Vercel

## Post-Migration Tasks

1. **Monitor costs** for first month
2. **Set up billing alerts** in AWS ($5, $10 thresholds)
3. **Review Railway usage** dashboard
4. **Update documentation** with actual URLs
5. **Notify users** of any downtime (if applicable)

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` in Railway environment variables
- Check PostgreSQL service is running
- Test connection with `psql $DATABASE_URL`

### S3 Upload Failures

- Verify AWS credentials
- Check bucket permissions
- Verify IAM policy includes S3 access

### Socket.io Connection Issues

- Check CORS configuration
- Verify JWT token in handshake
- Check Railway WebSocket support enabled

### API 404 Errors

- Verify routes are registered in Express app
- Check Railway deployment logs
- Verify API_URL in frontend matches Railway URL

## Cost Monitoring

### AWS

- Set up CloudWatch billing alerts
- Monitor S3 storage usage
- Track API request costs

### Railway

- Check usage dashboard weekly
- Monitor database size
- Watch for unexpected resource usage

## Success Metrics

Migration is successful when:

- All Supabase dependencies removed
- Monthly cost < $10
- API response times < 200ms
- 99%+ uptime
- Zero data loss
- All features working as before
