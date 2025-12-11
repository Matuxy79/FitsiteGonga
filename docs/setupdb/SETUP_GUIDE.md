# FitsiteGonga Deployment Prep Guide

This guide walks through the current Railway + self-hosted backend stack so the documentation reflects the code you have in the repo.

## 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (root) – already has dependencies installed in repo
npm install
```

Socket.io is already pulled in via `socket.io-client` in the frontend `package.json`, so no manual install is required beyond `npm install`.

## 2. Set Up Railway

1. Create a Railway project and connect your GitHub repo.
2. Add a PostgreSQL plugin or bring your own database endpoint.
3. Configure the Railway service:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Healthcheck Path**: `/health`
4. Every deploy will run your Express/Socket.io backend, then expose the domain that becomes `NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_SOCKET_URL`.

## 3. Prepare AWS S3

1. Create an S3 bucket (e.g., `fitsite-assets-{region}`).
2. Create an IAM user with at least `AmazonS3FullAccess` scoped to that bucket.
3. Grab the Access Key ID, Secret, and Region; you’ll use these as env vars.
4. Keep the bucket private; the backend issues signed URLs for uploads/downloads.

## 4. Generate Secrets

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Store the values for `JWT_SECRET` and `JWT_REFRESH_SECRET` securely.

## 5. Environment Variables

### Backend (`backend/.env`)

```bash
DATABASE_URL=<Railway Postgres connection string>
JWT_SECRET=<your secret>
JWT_REFRESH_SECRET=<your refresh secret>
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<access key>
AWS_SECRET_ACCESS_KEY=<secret key>
AWS_S3_BUCKET_NAME=fitsite-assets-{region}
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### Frontend (`.env.local` or production variable)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

In production, point both `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` to the Railway domain (e.g., `https://your-backend.up.railway.app`).

## 6. Database Migrations

```bash
cd backend
npm run prisma:generate
npx prisma migrate dev --name init
```

For production/Railway deploys use `npx prisma migrate deploy` (Railway can run this as a pre-deploy command).

## 7. Local Testing

Start backend:

```bash
cd backend
npm run dev
```

Start frontend:

```bash
npm run dev
```

Verify `/health` and API endpoints work before pushing.

## 8. Deploy to Railway

1. Push to GitHub (main branch).
2. Railway auto-triggers builds; ensure the new domain is copied into `NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_SOCKET_URL`.
3. Add service variables:
   - `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`
   - `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`
   - `CORS_ORIGIN`, `FRONTEND_URL` (if needed)
4. Optionally add a pre-deploy command: `cd backend && npx prisma migrate deploy`.

## 9. Deploy Frontend (Vercel/Netlify)

1. Configure the Next.js frontend in your preferred platform.
2. Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` to the Railway backend domain.
3. Ensure JWT cookies are allowed (same-site and secure settings are handled in the backend).

## 10. Data Migration (Optional)

If you are migrating from an older Postgres instance:

1. Dump the tables you need (`users`, `challenges`, `progress_logs`, etc.).
2. Clean up any Supabase-specific SQL (RLS policies, functions).
3. Import into the Railway/Postgres instance via `psql $DATABASE_URL < data.sql`.

## Verification Checklist

- [ ] Backend builds without Supabase dependencies (`npm run build` in `backend/`)
- [ ] Frontend builds (`npm run build`)
- [ ] Can register and log in
- [ ] Challenges load and progress logs display
- [ ] S3 uploads work with signed URLs
- [ ] Socket.io events broadcast to connected clients

## Troubleshooting

- **Build errors**: Inspect Railway logs; ensure `tsconfig` targets Node 18+ and Socket.io types match.
- **Database issues**: Run `npx prisma studio` to inspect tables and check `DATABASE_URL`.
- **S3 failures**: Verify AWS IAM permissions and bucket name env variable.
- **Realtime socket errors**: Confirm tokens are present (localStorage/cookie) and `NEXT_PUBLIC_SOCKET_URL` matches the backend domain.

## Support

- Backend README: `backend/README.md`
- Architecture doc: `docs/architecture.md`
- Migration summary: `docs/setupdb/MIGRATION_SUMMARY.md`
