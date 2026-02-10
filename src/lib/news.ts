import type { NewsArticle, FetchNewsOptions } from "@/types/news";

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = process.env.NEWS_API_URL || "https://newsapi.org/v2";

interface NewsAPIArticle {
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  urlToImage: string | null;
  source: {
    id: string | null;
    name: string;
  };
  publishedAt: string;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

/**
 * Fetch news articles from NewsAPI.org
 * Handles deduplication and normalization of results
 */
export async function fetchNews(options: FetchNewsOptions): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) {
    console.error("NEWS_API_KEY is not configured");
    return [];
  }

  const {
    keywords,
    from,
    to,
    maxResults = 10,
    language = "en",
  } = options;

  // Build search query from keywords
  const query = keywords.join(" OR ");

  // Build URL parameters
  const params = new URLSearchParams({
    q: query,
    language,
    sortBy: "publishedAt",
    pageSize: Math.min(maxResults, 100).toString(), // NewsAPI max is 100
  });

  if (from) {
    params.append("from", from.toISOString());
  }

  if (to) {
    params.append("to", to.toISOString());
  }

  const url = `${NEWS_API_URL}/everything?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        "X-Api-Key": NEWS_API_KEY,
      },
      // Cache for 5 minutes
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("NewsAPI rate limit exceeded");
        return [];
      }
      throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as NewsAPIResponse;

    // Normalize and deduplicate articles
    const articles = data.articles
      .filter((article) => article.title && article.url)
      .map(normalizeArticle);

    return deduplicateArticles(articles);
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

/**
 * Normalize NewsAPI article format to our NewsArticle interface
 */
function normalizeArticle(article: NewsAPIArticle): NewsArticle {
  return {
    title: article.title,
    description: article.description || "",
    content: article.content || article.description || "",
    url: article.url,
    imageUrl: article.urlToImage,
    source: article.source.name,
    publishedAt: new Date(article.publishedAt),
  };
}

/**
 * Deduplicate articles by URL
 */
function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  const unique: NewsArticle[] = [];

  for (const article of articles) {
    // Normalize URL for comparison (remove trailing slashes, query params)
    const normalizedUrl = article.url.split("?")[0].replace(/\/$/, "");

    if (!seen.has(normalizedUrl)) {
      seen.add(normalizedUrl);
      unique.push(article);
    }
  }

  return unique;
}

/**
 * Retry a fetch operation with exponential backoff
 */
async function retryFetch<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        // Wait before retrying with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}

/**
 * Fetch news with retry logic
 */
export async function fetchNewsWithRetry(options: FetchNewsOptions): Promise<NewsArticle[]> {
  try {
    return await retryFetch(() => fetchNews(options));
  } catch (error) {
    console.error("Failed to fetch news after retries:", error);
    return [];
  }
}
