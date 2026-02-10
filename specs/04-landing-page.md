# Spec 04 — Landing Page

## Goal
Build a beautiful, conversion-focused landing page that explains DailyBrief and drives sign-ups.

## Dependencies
- Spec 01 (project setup) must be complete
- Spec 02 (authentication) for the sign-in link

## Tasks

### 1. Create Marketing Layout

#### `src/app/(marketing)/layout.tsx`
- Shared layout for public/marketing pages
- Header with logo, navigation, and "Sign In" / "Get Started" buttons
- Footer with links

### 2. Build Landing Page

#### `src/app/(marketing)/page.tsx` (or `src/app/page.tsx`)
This is the homepage. Sections:

**Hero Section**
- Headline: "Your morning briefing, personalized by AI"
- Subheadline: Brief value proposition
- CTA button: "Get Started — It's Free"
- Visual element: mockup of a daily brief email

**How It Works**
- 3-step process with icons:
  1. "Sign in with your email"
  2. "Tell our AI what you care about"
  3. "Get your daily brief every morning"

**Features Section**
- AI-powered personalization
- Beautiful email digests
- Global events auto-included
- Customizable delivery time

**Social Proof / Trust**
- Clean, minimal trust indicators

**Final CTA**
- Repeated call to action
- Email input for quick sign-up

### 3. Create Shared UI Components

#### `src/components/ui/button.tsx`
- Variants: default, outline, ghost, link
- Sizes: sm, md, lg
- Uses `cn()` for class merging
- Supports `asChild` for composition

#### `src/components/ui/input.tsx`
- Styled text input component
- Support for labels, errors, icons

#### `src/components/ui/card.tsx`
- Card, CardHeader, CardContent, CardFooter
- Clean shadow and border styling

### 4. Create Header/Footer Components

#### `src/components/ui/header.tsx`
- Logo (text-based for now)
- Navigation links
- Auth-aware: show "Dashboard" if signed in, "Sign In" if not
- Mobile responsive (hamburger menu)

#### `src/components/ui/footer.tsx`
- Simple footer with copyright and links

## Design Guidelines
- Clean, modern, professional aesthetic
- Primary color: blue (#2563eb / blue-600)
- Lots of whitespace
- Responsive — mobile-first
- Smooth scroll behavior
- Subtle animations (fade in on scroll if desired, but keep it simple)

## Acceptance Criteria
- [ ] Landing page renders with all sections
- [ ] Responsive on mobile, tablet, desktop
- [ ] "Get Started" links to sign-in page
- [ ] Shared UI components created (Button, Input, Card)
- [ ] Header shows sign-in / dashboard link based on auth state
- [ ] Build passes
