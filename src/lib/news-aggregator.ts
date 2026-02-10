import type { TopicNews, ScoredArticle } from "@/types/news";
import type { Topic } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fetchNewsWithRetry } from "@/lib/news";
import { scoreArticles, deduplicateAcrossTopics } from "@/lib/news-scorer";
import { getCachedArticles, setCachedArticles, generateCacheKey } from "@/lib/news-cache";

/**
 * Fetch news for all of a user's subscribed topics
 * Returns articles grouped by topic, deduplicated across topics
 */
export async function aggregateNewsForUser(userId: string): Promise<TopicNews[]> {
  // Load user's subscriptions ordered by priority (highest first)
  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
    include: { topic: true },
    orderBy: { priority: "desc" },
  });

  if (subscriptions.length === 0) {
    return [];
  }

  // Fetch news for each topic in parallel
  const topicNewsPromises = subscriptions.map(async ({ topic, priority }) => {
    const articles = await fetchTopicNews(topic);
    const scored = scoreArticles(articles, topic.keywords);

    // Limit articles based on priority (higher priority = more articles)
    const maxArticles = calculateMaxArticles(priority);
    const limitedArticles = scored.slice(0, maxArticles);

    return {
      topicId: topic.id,
      topicName: topic.name,
      articles: limitedArticles,
    };
  });

  const allTopicNews = await Promise.all(topicNewsPromises);

  // Deduplicate articles that appear in multiple topics
  const deduplicated = deduplicateAcrossTopics(
    allTopicNews.map(({ topicId, articles }) => ({
      topicId,
      articles,
    }))
  );

  // Reconstruct TopicNews with deduplicated articles
  return deduplicated.map(({ topicId, articles }) => {
    const topicNews = allTopicNews.find((tn) => tn.topicId === topicId);
    return {
      topicId,
      topicName: topicNews?.topicName || "",
      articles,
    };
  });
}

/**
 * Fetch news articles for a single topic
 * Uses caching to avoid redundant API calls
 */
export async function fetchTopicNews(topic: Topic): Promise<ScoredArticle[]> {
  if (topic.keywords.length === 0) {
    console.warn(`Topic ${topic.name} has no keywords`);
    return [];
  }

  // Check cache first
  const cacheKey = generateCacheKey(topic.keywords);
  const cached = getCachedArticles(cacheKey);

  if (cached) {
    // Return cached results with scoring
    return scoreArticles(cached, topic.keywords);
  }

  // Fetch from API
  const articles = await fetchNewsWithRetry({
    keywords: topic.keywords,
    from: getDateDaysAgo(3), // Last 3 days
    maxResults: 20,
    language: "en",
  });

  // Cache the raw results (without scoring)
  setCachedArticles(cacheKey, articles);

  // Return scored articles
  return scoreArticles(articles, topic.keywords);
}

/**
 * Calculate maximum number of articles to include based on priority
 * Priority 1-3: 2 articles
 * Priority 4-6: 3 articles
 * Priority 7-9: 5 articles
 * Priority 10: 7 articles
 */
function calculateMaxArticles(priority: number): number {
  if (priority >= 10) return 7;
  if (priority >= 7) return 5;
  if (priority >= 4) return 3;
  return 2;
}

/**
 * Get a date N days ago
 */
function getDateDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Fetch news for a specific topic by ID
 * Useful for preview/testing
 */
export async function fetchNewsByTopicId(topicId: string): Promise<ScoredArticle[]> {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
  });

  if (!topic) {
    throw new Error(`Topic ${topicId} not found`);
  }

  return fetchTopicNews(topic);
}

/**
 * Fetch news for multiple topics
 * Returns results grouped by topic
 */
export async function fetchNewsForTopics(topicIds: string[]): Promise<TopicNews[]> {
  const topics = await prisma.topic.findMany({
    where: { id: { in: topicIds } },
  });

  const topicNewsPromises = topics.map(async (topic) => {
    const articles = await fetchTopicNews(topic);

    return {
      topicId: topic.id,
      topicName: topic.name,
      articles,
    };
  });

  return Promise.all(topicNewsPromises);
}
