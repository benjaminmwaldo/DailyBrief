# DailyBrief - Project Context

## What This Is
A Next.js 15 app that sends personalized daily news briefing emails. Users pick topics, the app fetches news via Google News RSS, synthesizes it with Claude AI, and emails a polished briefing.

## Tech Stack
- **Framework**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Auth**: NextAuth.js v5 (email magic links via Resend)
- **Database**: Prisma + Supabase (PostgreSQL)
- **AI**: Anthropic Claude API (Haiku for synthesis, Haiku for subject lines)
- **Email**: React Email + Resend
- **Deployment**: Vercel
- **Dark Mode**: next-themes (class-based)

## Key Architecture
- `src/lib/news.ts` — Fetches from Google News RSS, parses XML with regex, strips source suffixes from titles
- `src/lib/brief-generator.ts` — Orchestrates brief creation: fetches news per topic, composes, saves to DB
- `src/lib/brief-composer.ts` — Runs AI synthesis in parallel (Promise.all) across all topics, generates subject line
- `src/lib/brief-summarizer.ts` — The Claude prompt that synthesizes articles into editorial paragraphs (not headline lists)
- `src/lib/brief-sender.ts` — Renders React Email template and sends via Resend
- `src/components/emails/daily-brief.tsx` — Email template (React Email components)
- `src/app/dashboard/` — All authenticated pages (topics, briefs, chat, settings)
- `src/app/api/briefs/generate/route.ts` — On-demand brief generation (maxDuration=60)
- `src/app/api/briefs/test-send/route.ts` — Generate + send email for testing (maxDuration=60)

## Recent Work Completed (Feb 2026)
1. **Dark mode** — next-themes with class-based toggle, dark: variants on all dashboard components
2. **Chat moved to dashboard** — `/chat` → `/dashboard/chat` so sidebar stays visible
3. **Synthesized briefings** — AI writes editorial paragraphs per topic instead of article lists. Sources shown as compact inline links (NYT · Reuters · etc.)
4. **Fixed Vercel timeouts** — maxDuration=60 on API routes, parallel synthesis, switched to Haiku model
5. **Fixed title/source duplication** — stripSourceSuffix() removes Google News " - Source" from titles
6. **Fixed HTML entities** — &nbsp;, &#160;, &#xa0; decoded properly

## Known Issues / Next Steps
- Test the synthesis quality with a real "Generate & Send Email" — the timeout fixes should make Claude actually respond now instead of hitting fallback
- The synthesis prompt has editorial discretion: it skips opinion pieces, trivial news, and writes clean prose
- If synthesis still hits fallback, check Vercel function logs for timeout or API errors
- Landing page and sign-in page have dark mode support but could use more polish

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build (must pass before push)
- `npx prisma db push` — Push schema changes to Supabase
- `npx prisma generate` — Regenerate Prisma client

## Environment Variables (in .env.local)
- `ANTHROPIC_API_KEY` — Claude API
- `RESEND_API_KEY` — Email sending
- `DATABASE_URL` / `DIRECT_URL` — Supabase PostgreSQL
- `NEXTAUTH_URL` — App URL for auth callbacks
- `NEXTAUTH_SECRET` — Auth encryption
- `AUTH_RESEND_KEY` — Magic link emails
