# Spec 05 — User Dashboard

## Goal
Build the authenticated user dashboard — the main hub after sign-in, showing subscribed topics, recent briefs, and quick actions.

## Dependencies
- Spec 02 (authentication)
- Spec 03 (database schema)
- Spec 04 (shared UI components)

## Tasks

### 1. Create Dashboard Layout

#### `src/app/dashboard/layout.tsx`
- Authenticated layout wrapper
- Sidebar navigation (desktop) / bottom nav (mobile)
- Navigation items: Dashboard, Chat, Topics, Briefs, Settings
- User menu in sidebar header

### 2. Build Dashboard Page

#### `src/app/dashboard/page.tsx`
Server component that shows:

**Welcome Header**
- "Good morning, {name}" (time-aware greeting)
- Date display

**Quick Stats**
- Number of active topic subscriptions
- Total briefs received
- Next brief delivery time

**Recent Briefs**
- List of last 5 briefs with date, subject, status
- Click to view full brief
- Empty state: "No briefs yet — chat with our AI to set up your topics!"

**Active Topics**
- Grid of subscribed topic cards
- Each shows: topic name, category badge, priority indicator
- Quick unsubscribe button
- Empty state: "Start a chat to discover topics"

**Quick Actions**
- "Chat with AI" button → /chat
- "Manage Topics" button → /dashboard/topics
- "View All Briefs" button → /dashboard/briefs

### 3. Create Dashboard Components

#### `src/components/dashboard/stats-cards.tsx`
- Grid of stat cards with icons and numbers

#### `src/components/dashboard/recent-briefs.tsx`
- List component for recent briefs
- Brief status badge (Pending, Sent, etc.)

#### `src/components/dashboard/topic-grid.tsx`
- Grid of topic subscription cards
- Category color coding

### 4. Create Brief Viewer

#### `src/app/dashboard/briefs/page.tsx`
- Paginated list of all briefs
- Filter by date range
- Status indicators

#### `src/app/dashboard/briefs/[id]/page.tsx`
- Full brief viewer
- Renders the HTML content of the brief
- Shows metadata: date sent, topics included

### 5. Create Settings Page

#### `src/app/dashboard/settings/page.tsx`
- Timezone selector
- Delivery hour picker (with timezone-aware preview)
- Brief length preference (short/medium/long)
- Toggle for global events inclusion
- Save button (server action)

## Acceptance Criteria
- [ ] Dashboard renders with all sections
- [ ] Stats display correctly (even with zero data)
- [ ] Recent briefs list works with empty and populated states
- [ ] Topic grid shows subscribed topics
- [ ] Brief viewer renders HTML content
- [ ] Settings page saves preferences
- [ ] Responsive layout (sidebar → bottom nav on mobile)
- [ ] Build passes
