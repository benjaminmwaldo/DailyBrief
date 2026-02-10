# Spec 08 — News Aggregation Engine

## Goal
Build the news fetching and aggregation system that pulls relevant articles based on users' subscribed topics.

## Dependencies
- Spec 03 (database schema — Topic model with keywords)
- Spec 07 (topics with keywords defined)

## Tasks

### 1. News API Client

#### `src/lib/news.ts`
Create a news fetching module that:
- Supports multiple news API providers (start with NewsAPI.org)
- Fetches articles based on keyword queries
- Deduplicates results
- Normalizes article format across providers

```typescript
interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  imageUrl: string | null;
  source: string;
  publishedAt: Date;
}

interface FetchNewsOptions {
  keywords: string[];
  from?: Date;
  to?: Date;
  maxResults?: number;
  language?: string;
}

async function fetchNews(options: FetchNewsOptions): Promise<NewsArticle[]>
```

### 2. Topic-Based Aggregation

#### `src/lib/news-aggregator.ts`
```typescript
interface TopicNews {
  topicId: string;
  topicName: string;
  articles: NewsArticle[];
}

// Fetch news for a specific user's subscriptions
async function aggregateNewsForUser(userId: string): Promise<TopicNews[]>

// Fetch news for a single topic
async function fetchTopicNews(topic: Topic): Promise<NewsArticle[]>
```

Logic:
- Load user's subscribed topics (ordered by priority)
- For each topic, fetch news using topic keywords
- Deduplicate articles that appear across multiple topics
- Score and rank articles by relevance
- Limit results per topic based on priority (higher priority = more articles)
- Cache results for a configurable TTL to avoid redundant API calls

### 3. Article Scoring

#### `src/lib/news-scorer.ts`
Simple relevance scoring:
- Keyword match density in title (highest weight)
- Keyword match in description
- Recency (newer = higher score)
- Source reliability (optional, can be a simple allowlist)

### 4. News API Route (for testing/preview)

#### `src/app/api/news/preview/route.ts`
- GET: `?topicId=xxx` — preview news for a specific topic
- Requires authentication
- Returns aggregated articles for the topic
- Useful for debugging and for the dashboard

### 5. Caching Layer

#### `src/lib/news-cache.ts`
Simple in-memory or file-based cache:
- Cache key: topic keywords hash + date
- TTL: 1 hour (configurable)
- Prevents hitting API rate limits
- Falls back gracefully if cache is unavailable

### 6. Error Handling
- Handle API rate limits gracefully (429 responses)
- Handle network errors with retries (max 3)
- Log failures but don't crash the pipeline
- Return partial results if some topics fail

## Environment Variables
Add to `.env.example`:
```env
NEWS_API_KEY=your-newsapi-key
NEWS_API_URL=https://newsapi.org/v2
NEWS_CACHE_TTL=3600
```

## Acceptance Criteria
- [ ] News client fetches articles from NewsAPI
- [ ] Aggregation fetches news for all user topics
- [ ] Articles are deduplicated and scored
- [ ] Caching prevents redundant API calls
- [ ] Preview API route works
- [ ] Error handling is robust (no crashes on API failures)
- [ ] Build passes
