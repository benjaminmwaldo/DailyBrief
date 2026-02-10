# Spec 10 — Brief Generation Engine

## Goal
Build the engine that combines news articles with AI summarization to generate personalized daily briefs for each user.

## Dependencies
- Spec 03 (database schema — Brief, BriefItem models)
- Spec 06 (Claude client)
- Spec 08 (news aggregation)
- Spec 09 (email templates)

## Tasks

### 1. Brief Generation Pipeline

#### `src/lib/brief-generator.ts`
Main orchestration module:

```typescript
export async function generateBriefForUser(userId: string): Promise<Brief>
```

**Pipeline steps:**
1. **Load user data**: subscriptions, preferences, timezone
2. **Fetch news**: call news aggregator for all subscribed topics
3. **Fetch global events**: get today's global events (if user has `includeGlobal`)
4. **Summarize articles**: use Claude to generate concise summaries
5. **Compose brief**: assemble topic sections with summaries
6. **Render email**: use email template to generate HTML/text
7. **Save to database**: create Brief + BriefItems records
8. **Return brief**: ready for sending

### 2. AI Summarization

#### `src/lib/brief-summarizer.ts`
Use Claude to summarize news articles:

```typescript
export async function summarizeArticles(
  articles: NewsArticle[],
  topicName: string,
  briefLength: "short" | "medium" | "long"
): Promise<ArticleSummary[]>
```

**Prompt design:**
- Role: "You are a professional news editor writing for a daily email briefing"
- Task: Summarize each article in 2-3 concise sentences
- Tone: Informative, neutral, engaging
- Include: key facts, why it matters, any relevant context
- Brief length controls how many articles and summary length:
  - Short: 1-2 articles per topic, 1-2 sentences each
  - Medium: 2-3 articles per topic, 2-3 sentences each
  - Long: 3-4 articles per topic, 3-4 sentences each

### 3. Brief Composition

#### `src/lib/brief-composer.ts`
Assembles the final brief structure:

```typescript
export async function composeBrief(
  user: User,
  topicNews: TopicNews[],
  globalEvents: GlobalEvent[],
  preferences: UserPreference
): Promise<BriefData>
```

Logic:
- Order topics by subscription priority
- Apply brief length limits
- Insert global events section
- Generate email subject line (use Claude for a catchy subject)
- Build the BriefData object for the email template

### 4. Brief Generation API Route

#### `src/app/api/briefs/generate/route.ts`
- POST: Generate a brief for the authenticated user (on-demand)
- Used for testing and "Generate now" feature in dashboard
- Returns the generated brief data

#### `src/app/api/briefs/route.ts`
- GET: List user's briefs (paginated)
- Query params: `?page=`, `?limit=`, `?status=`

#### `src/app/api/briefs/[id]/route.ts`
- GET: Get a specific brief by ID
- Only accessible by the brief owner

### 5. Brief Sending

#### `src/lib/brief-sender.ts`
```typescript
export async function sendBrief(briefId: string): Promise<void>
```

- Load brief from database
- Send via Resend
- Update brief status to SENT
- Record sentAt timestamp
- Handle failures: update status to FAILED, log error

### 6. Dashboard Integration
Add a "Generate Preview" button to the dashboard that:
- Triggers brief generation for the current user
- Shows a preview of the generated brief
- Option to send it immediately

## Acceptance Criteria
- [ ] Brief generation pipeline works end-to-end
- [ ] Articles are summarized by Claude
- [ ] Brief respects user preferences (length, topics, priorities)
- [ ] Global events included when enabled
- [ ] Brief saved to database with correct status
- [ ] Brief can be sent via email
- [ ] Preview/generate API route works
- [ ] Build passes
