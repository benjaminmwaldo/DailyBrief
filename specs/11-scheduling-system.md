# Spec 11 — Scheduling System

## Goal
Build the cron/scheduling system that triggers daily brief generation and delivery at each user's preferred time.

## Dependencies
- Spec 10 (brief generation engine)
- Spec 03 (UserPreference model with timezone and deliveryHour)

## Tasks

### 1. Cron API Route

#### `src/app/api/cron/daily-briefs/route.ts`
Vercel Cron endpoint that runs every hour:

```typescript
export const runtime = "edge"; // or nodejs
export const maxDuration = 300; // 5 minutes

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find users whose delivery hour matches the current hour in their timezone
  // Generate and send briefs for those users
}
```

**Logic:**
1. Get current UTC time
2. Query users whose `deliveryHour` in their `timezone` matches the current hour
3. For each matching user:
   a. Check if they already received a brief today
   b. Generate brief (call `generateBriefForUser`)
   c. Send brief (call `sendBrief`)
   d. Log result
4. Return summary of processed users

### 2. Timezone-Aware User Query

#### `src/lib/scheduling.ts`
```typescript
export async function getUsersForCurrentHour(): Promise<User[]>
```

Logic:
- Get all distinct timezones from UserPreference
- For each timezone, check if the current time matches the deliveryHour
- Return users from matching timezone+hour combinations

### 3. Vercel Cron Configuration

#### `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-briefs",
      "schedule": "0 * * * *"
    }
  ]
}
```

### 4. Rate Limiting & Batching

For large user bases, implement batching:
```typescript
export async function processBriefBatch(
  userIds: string[],
  batchSize: number = 10
): Promise<BatchResult>
```

- Process users in batches of 10
- Add small delay between batches to respect API rate limits
- Track successes and failures
- Continue processing even if individual users fail

### 5. Cron Monitoring

#### `src/lib/cron-logger.ts`
Log cron execution results:
- Start time, end time, duration
- Number of users processed
- Successes vs failures
- Any errors encountered

Store in a simple `CronLog` model or just console.log for now.

### 6. Manual Trigger

#### `src/app/api/cron/trigger/route.ts`
- POST: Manually trigger brief generation for testing
- Requires authentication + admin check (or just use cron secret)
- Accepts `{ userId?: string }` to target specific user or all due users

### 7. Environment Variables

Add to `.env.example`:
```env
CRON_SECRET=your-cron-secret-here
```

## Acceptance Criteria
- [ ] Cron route processes users at their delivery hour
- [ ] Timezone handling is correct
- [ ] Users don't receive duplicate briefs
- [ ] Batching prevents API overload
- [ ] Cron is protected by secret
- [ ] Manual trigger works for testing
- [ ] vercel.json cron config is correct
- [ ] Build passes
