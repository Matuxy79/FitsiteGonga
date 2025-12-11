# Railway + AWS Migration Notes

This document records the high-level steps needed to keep FitsiteGonga running on your current Railway + AWS stack. It assumes Supabase has already been retired, so no Supabase-specific commands are included.

## Goals

1. Keep the Express + Socket.io backend deployed via Railway.
2. Store progress photos in AWS S3 via signed URLs.
3. Serve the frontend through Next.js while pointing it at the Railway domain.
4. Maintain a PostgreSQL schema managed by Prisma migrations.

## Infrastructure Setup

- **Railway**: Host the backend service (folder `backend/`). Railway runs `npm run build` and `npm run start` as defined in `package.json`. The domain becomes the base `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL`.
- **PostgreSQL**: Railway provides the `DATABASE_URL` environment variable to the backend. Run migrations with `npx prisma migrate deploy`.
- **AWS S3**: Create a bucket (e.g., `fitsite-assets-{region}`), and set these env vars on Railway: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`. The backend issues signed URLs from `storageRoutes.ts`.

## Backend Overview

- **Auth**: JWT-based login/register flows (`backend/src/routes/authRoutes.ts`), hashed via `bcryptjs` and signed with secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`).
- **API**: Express routes under `/api/*` are consumed by `src/lib/apiClient.ts`, which attaches `Authorization: Bearer <token>` and handles cookies/sessions.
- **Realtime**: Socket.io namespaces/rooms (e.g., `challenge:{id}`) broadcast `progress:new/updated/deleted` and `achievement:earned`. The frontend uses `src/lib/socketClient.ts` to connect once the user is authenticated.
- **Storage**: File uploads go through AWS S3, not Supabase Storage. The backend signs uploads/downloads, and the frontend handles file selection.

## Deployment Checklist

1. Ensure `backend/.env` mirrors Railway variables (database, JWT secrets, AWS creds, CORS).
2. Locally test `npm run dev` in backend and frontend.
3. Run `npx prisma migrate dev` (local) or `npx prisma migrate deploy` (production) before releasing.
4. Push to GitHub; Railway builds and deploys automatically.
5. Update frontend env vars (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`) to the Railway domain.
6. Monitor Railway logs and AWS billing after deploys.

## Troubleshooting Notes

- **Build fails**: Check TypeScript errors (Socket.io event typings, Prisma client generation).
- **Auth fails**: Verify tokens stored in cookies/localStorage and the backend’s JWT_SECRET matches the frontend config.
- **Realtime issues**: Confirm Socket.io handshake uses `NEXT_PUBLIC_SOCKET_URL` and that JWT is present in `socketClient`.
- **S3 errors**: Ensure IAM policy allows `s3:PutObject`/`s3:GetObject` for the target bucket.

## Documentation References

- New API client: `src/lib/apiClient.ts`
- Socket.io client: `src/lib/socketClient.ts`
- Auth repository: `src/repositories/AuthRepository.ts`
- Backend README: `backend/README.md`
