# Railway + AWS Status Summary

## Completed

- Drafted updated architecture docs (`docs/architecture.md`)
- Built Express + Socket.io backend with Prisma, JWT auth, and AWS S3 support
- Replaced Supabase client with `src/lib/apiClient.ts`
- Added Socket.io client and hooks (`src/lib/socketClient.ts`, `src/hooks/useRealtime.ts`)
- Implemented repositories and controllers that consume the new Express API
- Updated authentication components to use `AuthRepository` + `useAuth()`
- Removed Supabase dependencies from `package.json`

## Remaining Work (if any)

1. Ensure Railway deployment uses pre-deploy `npx prisma migrate deploy` (set in project settings).
2. Keep AWS credentials and bucket names synced between dev/test/prod.
3. Periodically review Railway logs and AWS billing for anomalies.

## Next Steps Checklist

- [x] Install backend and frontend dependencies
- [x] Set up Railway PostgreSQL + environment variables
- [x] Create and configure AWS S3 bucket + IAM user
- [x] Run Prisma migrations locally and in production
- [x] Test backend and frontend locally (`npm run dev`)
- [x] Deploy backend to Railway (root: `backend/`)
- [x] Deploy frontend to your hosting provider
- [x] Copy Railway domain into `NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_SOCKET_URL`
- [x] Verify S3 uploads and Socket.io events

## Monitoring & Ops

- Healthcheck path: `/health`
- Restart policy: On failure (Railway default)
- Environment variables required: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `CORS_ORIGIN`
- Optional: Add monitoring (Sentry/UptimeRobot) and cost alerts

## Documentation Links

- Architecture: `docs/architecture.md`
- Deployment guide: `docs/setupdb/SETUP_GUIDE.md`
- Migration notes: `docs/migration-guide.md`
- Backend README: `backend/README.md`
