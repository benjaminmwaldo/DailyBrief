# Spec 02 — Authentication

## Goal
Set up NextAuth.js v5 with email magic link authentication using Resend as the email provider.

## Dependencies
- Spec 01 (project setup) must be complete

## Tasks

### 1. Configure NextAuth

#### `src/lib/auth.ts`
Set up NextAuth with:
- **Prisma Adapter** for database session/user storage
- **Email provider** using Resend for magic link delivery
- Callbacks for session handling (include user ID in session)
- Pages config pointing to custom sign-in page

#### `src/app/api/auth/[...nextauth]/route.ts`
Export the NextAuth route handler.

### 2. Create Auth Pages

#### `src/app/(auth)/sign-in/page.tsx`
- Clean, centered sign-in form
- Email input + "Send magic link" button
- Server action or API call to trigger magic link
- Success state: "Check your email" message
- Error handling for invalid emails

#### `src/app/(auth)/verify/page.tsx`
- Verification landing page for magic link clicks
- Show loading state while verifying
- Redirect to dashboard on success
- Error message on failure

### 3. Add Auth Middleware

#### `src/middleware.ts`
- Protect `/dashboard/*` and `/chat/*` routes
- Redirect unauthenticated users to `/sign-in`
- Allow public access to `/`, `/sign-in`, `/verify`, `/api/auth/*`

### 4. Create Auth Components

#### `src/components/ui/user-menu.tsx`
- Show user avatar/email when signed in
- Dropdown with "Sign out" option
- Uses `useSession()` from NextAuth

### 5. Update Prisma Schema
Add NextAuth required models:
- `User` (id, name, email, emailVerified, image)
- `Account` (provider details)
- `Session` (sessionToken, userId, expires)
- `VerificationToken` (identifier, token, expires)

Run `npx prisma generate` after schema changes.

## Acceptance Criteria
- [ ] Magic link sign-in flow works end-to-end
- [ ] Protected routes redirect to sign-in
- [ ] User data stored in database via Prisma
- [ ] Sign-out works
- [ ] Build passes
