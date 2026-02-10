import type { NewsArticle } from "@/types/news";
import crypto from "crypto";

const CACHE_TTL = parseInt(process.env.NEWS_CACHE_TTL || "3600", 10) * 1000; // Convert to milliseconds

interface CacheEntry {
  articles: NewsArticle[];
  timestamp: number;
}

// In-memory cache (could be replaced with Redis in production)
const cache = new Map<string, CacheEntry>();

/**
 * Generate a cache key from keywords and date range
 */
export function generateCacheKey(keywords: string[], date?: Date): string {
  const keywordsStr = keywords.sort().join("|");
  const dateStr = date ? date.toISOString().split("T")[0] : "today";
  const combined = `${keywordsStr}:${dateStr}`;

  // Hash the key to keep it manageable
  return crypto.createHash("md5").update(combined).digest("hex");
}

/**
 * Get cached articles if available and not expired
 */
export function getCachedArticles(cacheKey: string): NewsArticle[] | null {
  const entry = cache.get(cacheKey);

  if (!entry) {
    return null;
  }

  // Check if cache has expired
  const age = Date.now() - entry.timestamp;
  if (age > CACHE_TTL) {
    cache.delete(cacheKey);
    return null;
  }

  return entry.articles;
}

/**
 * Cache articles with current timestamp
 */
export function setCachedArticles(cacheKey: string, articles: NewsArticle[]): void {
  cache.set(cacheKey, {
    articles,
    timestamp: Date.now(),
  });
}

/**
 * Clear all cached entries
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Clear expired cache entries
 * Call this periodically to prevent memory leaks
 */
export function clearExpiredCache(): void {
  const now = Date.now();

  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  oldestEntry: number | null;
  newestEntry: number | null;
} {
  let oldestEntry: number | null = null;
  let newestEntry: number | null = null;

  for (const entry of cache.values()) {
    if (oldestEntry === null || entry.timestamp < oldestEntry) {
      oldestEntry = entry.timestamp;
    }
    if (newestEntry === null || entry.timestamp > newestEntry) {
      newestEntry = entry.timestamp;
    }
  }

  return {
    size: cache.size,
    oldestEntry,
    newestEntry,
  };
}

// Clean up expired cache entries every 10 minutes
if (typeof globalThis !== "undefined") {
  setInterval(clearExpiredCache, 10 * 60 * 1000);
}
