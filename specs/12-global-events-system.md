# Spec 12 — Global Events System

## Goal
Build the system for managing global events (holidays, elections, cultural events) that are automatically included in every user's daily brief.

## Dependencies
- Spec 03 (database schema — GlobalEvent model)
- Spec 10 (brief generation — global events integration)

## Tasks

### 1. Seed Global Events

#### `prisma/seed-events.ts` (or extend existing seed)
Seed the database with notable global events for the current year:

**Categories:**
- **Holidays**: New Year's, Valentine's Day, Easter, July 4th, Halloween, Thanksgiving, Christmas, etc.
- **Cultural**: Super Bowl, Oscar's, Grammy's, World Cup, Olympics
- **Political**: Election days, inauguration, State of the Union
- **International**: International Women's Day, Earth Day, World Health Day

Each event:
```prisma
{
  title: "Super Bowl LXI",
  description: "The NFL championship game",
  date: new Date("2027-02-14"),
  category: "sports",
  country: "US",
  isActive: true
}
```

### 2. Global Events API

#### `src/app/api/events/route.ts`
- GET: List upcoming global events
- Query params: `?days=7`, `?category=`, `?country=`
- Returns events within the specified date range

#### `src/app/api/events/[id]/route.ts`
- GET: Get a specific event
- PUT: Update event (admin only for future use)

### 3. Events Management Page

#### `src/app/dashboard/events/page.tsx`
- Calendar view or timeline of upcoming global events
- Category filter
- Shows which events will appear in the user's next brief
- Toggle: "Include global events in my brief" (links to settings)

### 4. Events Integration in Brief Generation

Update `src/lib/brief-composer.ts`:
- Query GlobalEvent model for today's date (and next day for timezone coverage)
- Filter by user's country preference (or show worldwide events)
- Insert events section into the brief
- Use special styling in the email template for events

### 5. Auto-Event Detection (Stretch Goal)

#### `src/lib/event-detector.ts`
Optional: Use Claude to detect trending global events from news:
```typescript
export async function detectGlobalEvents(
  recentNews: NewsArticle[]
): Promise<SuggestedEvent[]>
```

- Analyze recent news for major events
- Suggest new GlobalEvent entries
- Requires manual approval (or auto-add with confidence threshold)

### 6. Events Widget on Dashboard

#### `src/components/dashboard/upcoming-events.tsx`
- Small widget showing next 3-5 upcoming events
- Displayed on the main dashboard page
- Clean calendar-style icons with dates

## Acceptance Criteria
- [ ] Global events seeded in database
- [ ] Events API returns upcoming events
- [ ] Events page shows upcoming events
- [ ] Brief generation includes global events
- [ ] Events appear with special styling in email
- [ ] Dashboard widget shows upcoming events
- [ ] Users can toggle global events on/off
- [ ] Build passes
