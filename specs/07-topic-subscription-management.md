# Spec 07 — Topic Subscription Management

## Goal
Build the topic browsing and subscription management interface, allowing users to discover, subscribe to, and manage topics outside of the chat.

## Dependencies
- Spec 03 (database schema)
- Spec 04 (shared UI components)
- Spec 05 (dashboard layout)

## Tasks

### 1. Seed Default Topics

#### `prisma/seed.ts`
Create a seed script with ~20-30 default topics across categories:

**Categories and example topics:**
- **Technology**: AI & Machine Learning, Cybersecurity, Web Development, Startups, Gadgets & Reviews
- **Business**: Stock Market, Crypto & Blockchain, Entrepreneurship, Personal Finance
- **Science**: Space & Astronomy, Climate & Environment, Medical Research, Physics
- **Politics**: US Politics, International Relations, Policy & Legislation
- **Sports**: NFL, NBA, Soccer/Football, Tennis, Motorsports
- **Entertainment**: Movies & TV, Music, Gaming, Books
- **Health**: Fitness, Nutrition, Mental Health
- **World**: Breaking News, Economics, Geopolitics

Each topic should have:
- Meaningful `keywords` array for news search
- Appropriate `category`
- `isGlobal: false` (global topics handled in Spec 12)

Add seed script to `package.json`:
```json
"prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }
```

### 2. Topics API Routes

#### `src/app/api/topics/route.ts`
- GET: List all available topics (with user's subscription status)
- Query params: `?category=`, `?search=`

#### `src/app/api/topics/[id]/subscribe/route.ts`
- POST: Subscribe to a topic `{ priority?: number }`
- DELETE: Unsubscribe from a topic

### 3. Topics Browse Page

#### `src/app/dashboard/topics/page.tsx`
- Category filter tabs/pills at top
- Search bar for finding topics
- Grid of topic cards
- Each card shows:
  - Topic name and description
  - Category badge
  - Subscribe/Unsubscribe toggle button
  - Priority slider (if subscribed)
- Subscribed topics visually distinct (highlighted border, checkmark)

### 4. Topic Components

#### `src/components/dashboard/topic-card.tsx`
- Displays a single topic
- Subscribe/unsubscribe toggle
- Priority control (1-10 slider or select)
- Optimistic UI updates

#### `src/components/dashboard/topic-filters.tsx`
- Category filter pills
- Search input
- "Show subscribed only" toggle

### 5. Subscription Management

#### `src/app/dashboard/topics/subscriptions/page.tsx`
- Table/list of current subscriptions
- Drag-to-reorder for priority (or simple number input)
- Bulk unsubscribe option
- Empty state with link to browse topics or chat with AI

## Acceptance Criteria
- [ ] Seed script creates default topics
- [ ] Topics browsing page with category filtering and search
- [ ] Users can subscribe/unsubscribe with a click
- [ ] Priority can be adjusted for subscribed topics
- [ ] Subscription management page works
- [ ] Optimistic UI updates (no page reload needed)
- [ ] Build passes
