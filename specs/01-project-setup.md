# Spec 01 — Project Setup

## Goal
Scaffold the Next.js application with all dependencies and configuration files.

## Tasks

### 1. Initialize Next.js Project
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

### 2. Install Dependencies
```bash
# Core
npm install prisma @prisma/client
npm install next-auth@beta @auth/prisma-adapter
npm install @anthropic-ai/sdk
npm install resend @react-email/components react-email
npm install zod
npm install clsx tailwind-merge

# Dev
npm install -D prisma @types/node
```

### 3. Create Configuration Files

#### `src/lib/utils.ts`
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### `.env.example`
Create with all environment variables documented in AGENTS.md (no real values).

#### `prisma/schema.prisma`
Initialize with a basic datasource config pointing to `DATABASE_URL`.

### 4. Configure TypeScript
Ensure `tsconfig.json` has:
- `"strict": true`
- Path alias `@/*` pointing to `./src/*`

### 5. Update `globals.css`
Set up Tailwind with CSS custom properties for the color palette:
- Primary: blue tones (for trust/professionalism)
- Background, foreground, muted, accent colors
- Dark mode support via CSS variables

### 6. Verify
- `npm run build` succeeds
- `npm run lint` passes
- Project structure matches AGENTS.md

## Acceptance Criteria
- [ ] Next.js app scaffolded with App Router and TypeScript
- [ ] All dependencies installed
- [ ] Utility functions created (`cn`, etc.)
- [ ] `.env.example` created with all variable names
- [ ] Prisma initialized
- [ ] Build passes cleanly
