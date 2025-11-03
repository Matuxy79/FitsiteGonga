# FitsiteGonga Migration Setup Guide

## Quick Start

### Prerequisites

- Node.js 18+
- Railway account (free tier available)
- AWS account with $200 credits
- GitHub account

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (root directory)
npm install socket.io-client
```

### Step 2: Set Up Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project: "FitsiteGonga Backend"
4. Click "New" → "Database" → "PostgreSQL"
5. Copy the `postgresql://postgres:qVuJXNXFmOVogJXdwSPwerJGoJCESCRi@yamabiko.proxy.rlwy.net:26178/railway` from PostgreSQL service settings

### Step 3: Set Up AWS S3

1. Go to AWS Console → S3
2. Click "Create bucket"
3. Name: `fitsite-assets-[region]` (e.g., `fitsite-assets-us-east-1`)
4. Region: `us-east-1` (or closest to users)
5. **Uncheck** "Block all public access" temporarily for setup, then:
   - Create bucket policy allowing presigned URL uploads
   - Or keep private and use presigned URLs (recommended)

6. Create IAM User:
   - Go to IAM → Users → "Add users"
   - Username: `fitsite-s3-user`
   - Select "Attach policies directly"
   - Attach: `AmazonS3FullAccess` (or create custom policy for bucket only)
   - Create user → Generate access keys
   - **Save Access Key ID and Secret Access Key**

### Step 4: Generate JWT Secrets

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate refresh token secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save both secrets securely.

### Step 5: Configure Environment Variables

#### Backend (`backend/.env`)

Create `backend/.env` file:

```bash
# Database
DATABASE_URL=postgresql://postgres:[password]@[host].railway.app:5432/railway

# JWT
JWT_SECRET=<your-generated-secret>
JWT_REFRESH_SECRET=<your-generated-refresh-secret>

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
AWS_S3_BUCKET_NAME=fitsite-assets-[region]

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (`.env.local` or Vercel)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

For production, replace with Railway URL:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app
```

### Step 6: Set Up Database

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Create database tables
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### Step 7: Test Locally

#### Start Backend

```bash
cd backend
npm run dev
```

Backend should start on `http://localhost:3000`

Test health endpoint:

```bash
curl http://localhost:3000/health
```

#### Start Frontend

```bash
# In project root
npm run dev
```

Frontend should start on `http://localhost:3000` (Next.js default)

### Step 8: Deploy to Railway

1. Push code to GitHub
2. In Railway dashboard:
   - Click "New" → "GitHub Repo"
   - Select your repository
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/server.js`
3. Add environment variables in Railway dashboard (Settings → Variables)
4. Railway will auto-deploy on push to main branch

### Step 9: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import project from GitHub
3. Framework Preset: Next.js
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = Railway backend URL
   - `NEXT_PUBLIC_SOCKET_URL` = Railway backend URL
5. Deploy

### Step 10: Migrate Data from Supabase

#### Export Data

```bash
# Using Supabase CLI
npx supabase db dump --data-only -f supabase_export.sql

# Or using pg_dump
pg_dump "postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres" \
  --data-only \
  --table=users \
  --table=challenges \
  --table=progress_logs \
  > supabase_data.sql
```

#### Clean and Import

1. Edit `supabase_data.sql` to remove Supabase-specific functions/policies
2. Import to Railway PostgreSQL:

```bash
# Get connection string from Railway PostgreSQL service
psql $DATABASE_URL < cleaned_supabase_data.sql
```

Or use Railway's database dashboard → Connect → Run SQL

### Step 11: Migrate Files from Supabase Storage

Create migration script (see `docs/migration-guide.md` for full script):

```typescript
// scripts/migrate-files.ts
// Run: npx ts-node scripts/migrate-files.ts
```

## Verification Checklist

- [ ] Backend running on Railway
- [ ] Frontend running on Vercel
- [ ] Database connected and migrations applied
- [ ] Can register new user
- [ ] Can login
- [ ] Can create challenge (as trainer)
- [ ] Can upload progress with photo
- [ ] Realtime updates working
- [ ] Socket.io connections stable
- [ ] All Supabase dependencies removed from frontend

## Troubleshooting

### Backend won't start

- Check `DATABASE_URL` format
- Verify all environment variables set
- Check Railway logs: Railway dashboard → Deployments → View logs

### Database connection errors

- Verify PostgreSQL service running in Railway
- Check `DATABASE_URL` includes correct password
- Test connection: `psql $DATABASE_URL`

### S3 upload failures

- Verify AWS credentials
- Check bucket permissions
- Verify bucket name matches `AWS_S3_BUCKET_NAME`

### Socket.io won't connect

- Check CORS configuration in `backend/src/server.ts`
- Verify `NEXT_PUBLIC_SOCKET_URL` matches Railway backend URL
- Check Railway logs for connection errors
- Verify JWT token in localStorage/cookie

### Frontend API calls fail

- Check `NEXT_PUBLIC_API_URL` environment variable
- Verify backend is running and accessible
- Check browser console for CORS errors
- Verify JWT token is being sent in requests

## Next Steps

1. Monitor costs in Railway and AWS dashboards
2. Set up billing alerts
3. Configure monitoring (Sentry, UptimeRobot)
4. Remove Supabase project (after verification)
5. Update documentation with production URLs

## Support

- Backend README: `backend/README.md`
- Architecture docs: `docs/architecture-post-supabase.md`
- Migration guide: `docs/migration-guide.md`
- Migration summary: `MIGRATION_SUMMARY.md`
