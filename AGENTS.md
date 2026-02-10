# DailyBrief — Agent Conventions

## Project Overview

DailyBrief is a Next.js web application that delivers personalized daily email briefings. Users sign in, chat with an AI agent to pick topics of interest, and receive a beautifully formatted daily digest email.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js v5 (magic link email) |
| AI | Anthropic Claude API (`@anthropic-ai/sdk`) |
| Email | Resend + React Email |
| Deployment | Vercel |

## Build Commands

```bash
# Development
npm run dev           # Start dev server (port 3000)
npm run build         # Production build — ALWAYS run after changes
npm run lint          # ESLint check
npm run type-check    # TypeScript check (tsc --noEmit)

# Database
npx prisma generate   # Regenerate Prisma client after schema changes
npx prisma db push    # Push schema to database (dev)
npx prisma migrate dev --name <name>  # Create migration (production)
npx prisma studio     # Visual database browser

# Email
npm run email:dev     # Preview React Email templates
```

## Project Structure

```
DailyBrief/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth pages (sign-in, verify)
│   │   ├── (marketing)/       # Public pages (landing, about)
│   │   ├── dashboard/         # Authenticated user dashboard
│   │   ├── chat/              # AI chat interface
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── chat/          # AI chat API
│   │   │   ├── topics/        # Topic CRUD
│   │   │   ├── briefs/        # Brief generation/retrieval
│   │   │   └── cron/          # Scheduled jobs
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles + Tailwind
│   ├── components/            # Shared React components
│   │   ├── ui/                # Primitive UI components
│   │   ├── chat/              # Chat-specific components
│   │   ├── dashboard/         # Dashboard components
│   │   └── emails/            # React Email templates
│   ├── lib/                   # Shared utilities
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── claude.ts          # Claude API client
│   │   ├── resend.ts          # Resend email client
│   │   ├── news.ts            # News aggregation
│   │   └── utils.ts           # General utilities
│   ├── types/                 # TypeScript type definitions
│   └── hooks/                 # Custom React hooks
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── emails/                    # React Email templates (for preview)
├── specs/                     # Build specifications
├── .env.example               # Environment variable template
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── package.json
```

## Coding Conventions

### TypeScript
- Use strict mode (`"strict": true` in tsconfig)
- Prefer `interface` over `type` for object shapes
- Use `const` by default, `let` only when reassignment is needed
- No `any` — use `unknown` and narrow types instead
- Export types from `src/types/` for shared use

### React / Next.js
- Use Server Components by default; add `"use client"` only when needed
- Use the App Router file conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`)
- Colocate server actions in the same file or in `actions.ts` next to the page
- Use `next/image` for images, `next/link` for navigation
- Form handling: use server actions for mutations, React Hook Form for complex client forms

### Styling
- Tailwind CSS utility classes — no custom CSS unless absolutely necessary
- Use `cn()` helper (from `lib/utils.ts`) for conditional classes
- Design system: consistent spacing (4/8/12/16/24/32/48/64), rounded-lg, shadow-sm
- Color palette: Use CSS variables defined in `globals.css` for theming

### Database (Prisma)
- Use the singleton pattern in `lib/prisma.ts`
- Always run `npx prisma generate` after schema changes
- Use meaningful model names (PascalCase) and field names (camelCase)
- Add `@@index` for frequently queried fields
- Use `@default(cuid())` for IDs

### API Routes
- Use Next.js Route Handlers (`route.ts`)
- Always validate input (use Zod schemas)
- Return consistent JSON response shapes: `{ data }` or `{ error: string }`
- Use proper HTTP status codes
- Protect authenticated routes with `auth()` from NextAuth

### Error Handling
- Use `error.tsx` boundary files for page-level errors
- API routes: try/catch with proper status codes
- Client components: use error boundaries and loading states
- Log errors server-side, show friendly messages client-side

## Environment Variables

All required env vars are documented in `.env.example`. Never commit `.env.local`.

```env
# Database
DATABASE_URL=postgresql://...

# Auth (NextAuth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-secret

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=briefs@yourdomain.com

# AI (Anthropic)
ANTHROPIC_API_KEY=sk-ant-...

# News API
NEWS_API_KEY=...
NEWS_API_URL=https://newsapi.org/v2
```

## Git Conventions

- Commit messages: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- One logical change per commit
- Always run `npm run build` before committing
