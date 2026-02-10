# Spec 09 — Email Templates

## Goal
Build beautiful, responsive email templates using React Email for the daily brief and system emails.

## Dependencies
- Spec 01 (React Email installed)
- Spec 08 (news article data structure)

## Tasks

### 1. Set Up React Email Preview

Add script to `package.json`:
```json
"email:dev": "email dev --dir src/components/emails"
```

### 2. Create Email Templates

#### `src/components/emails/daily-brief.tsx`
The main daily briefing email template:

**Layout:**
- Header: DailyBrief logo + date
- Greeting: "Good morning, {name}"
- Brief summary: "Today's brief covers {n} topics"
- For each topic section:
  - Topic heading with category badge
  - 2-4 article summaries:
    - Article title (linked to source)
    - 2-3 sentence AI-generated summary
    - Source name + publish time
    - Optional thumbnail image
  - Divider between topics
- Global events section (if any):
  - Special styling (different background)
  - Event title + description
- Footer:
  - "Manage your topics" link
  - "Unsubscribe" link
  - DailyBrief branding

**Design:**
- Clean, readable typography
- Max-width: 600px
- Works in Gmail, Outlook, Apple Mail
- Light/dark mode support if feasible
- Professional color scheme matching the app

#### `src/components/emails/magic-link.tsx`
Magic link authentication email:
- DailyBrief branding
- "Sign in to DailyBrief" heading
- Magic link button
- "This link expires in 24 hours"
- Footer

#### `src/components/emails/welcome.tsx`
Welcome email for new users:
- Welcome message
- Quick start guide (3 steps)
- CTA: "Set up your first topics"
- What to expect (daily briefs overview)

### 3. Email Rendering Utility

#### `src/lib/email-renderer.ts`
```typescript
import { render } from "@react-email/render";

export async function renderDailyBrief(props: DailyBriefProps): Promise<{
  html: string;
  text: string;
  subject: string;
}>

export async function renderMagicLink(props: MagicLinkProps): Promise<{
  html: string;
  text: string;
  subject: string;
}>
```

### 4. Email Sending Utility

#### `src/lib/resend.ts`
```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ id: string }>

export async function sendDailyBrief(
  userId: string,
  briefData: BriefData
): Promise<void>
```

### 5. Type Definitions

#### `src/types/email.ts`
```typescript
interface DailyBriefProps {
  userName: string;
  date: Date;
  topics: TopicSection[];
  globalEvents?: GlobalEventItem[];
  unsubscribeUrl: string;
  manageTopicsUrl: string;
}

interface TopicSection {
  name: string;
  category: string;
  articles: ArticleSummary[];
}

interface ArticleSummary {
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: Date;
  imageUrl?: string;
}
```

## Acceptance Criteria
- [ ] Daily brief email template renders correctly
- [ ] Magic link email template renders correctly
- [ ] Welcome email template renders correctly
- [ ] Email preview works (`npm run email:dev`)
- [ ] Templates render valid HTML for major email clients
- [ ] Plain text fallbacks generated
- [ ] Build passes
