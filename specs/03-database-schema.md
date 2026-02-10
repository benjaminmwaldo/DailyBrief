# Spec 03 — Database Schema

## Goal
Define the complete Prisma database schema for DailyBrief beyond the base NextAuth models.

## Dependencies
- Spec 02 (authentication) must be complete

## Tasks

### 1. Add Application Models to `prisma/schema.prisma`

#### `Topic`
```prisma
model Topic {
  id          String   @id @default(cuid())
  name        String
  description String?
  category    String   // e.g., "technology", "sports", "politics"
  keywords    String[] // search terms for news aggregation
  isGlobal    Boolean  @default(false) // auto-included for all users
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  subscriptions Subscription[]
  briefItems    BriefItem[]

  @@index([category])
  @@index([isGlobal])
}
```

#### `Subscription`
```prisma
model Subscription {
  id        String   @id @default(cuid())
  userId    String
  topicId   String
  priority  Int      @default(5) // 1-10, higher = more important
  createdAt DateTime @default(now())

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  topic Topic @relation(fields: [topicId], references: [id], onDelete: Cascade)

  @@unique([userId, topicId])
  @@index([userId])
}
```

#### `ChatMessage`
```prisma
model ChatMessage {
  id        String   @id @default(cuid())
  userId    String
  role      String   // "user" | "assistant"
  content   String
  metadata  Json?    // store extracted topics, actions taken
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}
```

#### `Brief`
```prisma
model Brief {
  id          String      @id @default(cuid())
  userId      String
  subject     String
  htmlContent String
  textContent String
  status      BriefStatus @default(PENDING)
  sentAt      DateTime?
  createdAt   DateTime    @default(now())

  user  User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  items BriefItem[]

  @@index([userId, createdAt])
  @@index([status])
}

enum BriefStatus {
  PENDING
  GENERATING
  READY
  SENT
  FAILED
}
```

#### `BriefItem`
```prisma
model BriefItem {
  id       String @id @default(cuid())
  briefId  String
  topicId  String?
  title    String
  summary  String
  sourceUrl String?
  imageUrl  String?
  position Int    // ordering within the brief

  brief Brief  @relation(fields: [briefId], references: [id], onDelete: Cascade)
  topic Topic? @relation(fields: [topicId], references: [id], onDelete: SetNull)

  @@index([briefId])
}
```

#### `GlobalEvent`
```prisma
model GlobalEvent {
  id          String   @id @default(cuid())
  title       String
  description String
  date        DateTime
  category    String   // "holiday", "election", "sports", "cultural"
  country     String?  // ISO country code, null = worldwide
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  @@index([date])
  @@index([isActive])
}
```

#### `UserPreference`
```prisma
model UserPreference {
  id              String   @id @default(cuid())
  userId          String   @unique
  timezone        String   @default("America/New_York")
  deliveryHour    Int      @default(7) // 0-23, hour to send brief
  briefLength     String   @default("medium") // "short", "medium", "long"
  includeGlobal   Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### 2. Update User Model
Add relations to the User model:
```prisma
model User {
  // ... existing NextAuth fields ...
  subscriptions  Subscription[]
  chatMessages   ChatMessage[]
  briefs         Brief[]
  preference     UserPreference?
}
```

### 3. Generate and Push
```bash
npx prisma generate
npx prisma db push  # or migrate dev
```

## Acceptance Criteria
- [ ] All models defined in schema.prisma
- [ ] Relations and indexes are correct
- [ ] `npx prisma generate` succeeds
- [ ] Build passes
