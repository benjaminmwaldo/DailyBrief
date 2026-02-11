import type { NewsArticle, FetchNewsOptions } from "@/types/news";

/**
 * Fetch news articles from Google News RSS feeds.
 * Free, no API key required, covers all topics.
 */
export async function fetchNews(options: FetchNewsOptions): Promise<NewsArticle[]> {
  const {
    keywords,
    maxResults = 10,
    language = "en",
  } = options;

  // Build search query from keywords (Google News supports OR)
  const query = keywords
    .map((kw) => (kw.includes(" ") ? `"${kw}"` : kw))
    .join(" OR ");

  const params = new URLSearchParams({
    q: query,
    hl: `${language}-US`,
    gl: "US",
    ceid: `US:${language}`,
  });

  const url = `https://news.google.com/rss/search?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "DailyBrief/1.0",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`Google News RSS error: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    const articles = parseRssItems(xml);

    // Deduplicate and limit
    return deduplicateArticles(articles).slice(0, maxResults);
  } catch (error) {
    console.error("Error fetching news from Google News RSS:", error);
    return [];
  }
}

/**
 * Parse RSS XML into NewsArticle items.
 * Google News RSS has a predictable structure so we parse with regex
 * to avoid adding an XML parser dependency.
 */
function parseRssItems(xml: string): NewsArticle[] {
  const articles: NewsArticle[] = [];

  // Match each <item>...</item> block
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let itemMatch;

  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const itemXml = itemMatch[1];

    const title = extractTag(itemXml, "title");
    const link = extractTag(itemXml, "link");
    const pubDate = extractTag(itemXml, "pubDate");
    const source = extractSource(itemXml);
    const description = extractDescription(itemXml);

    if (title && link) {
      articles.push({
        title: decodeHtmlEntities(title),
        description: description ? decodeHtmlEntities(description) : "",
        content: description ? decodeHtmlEntities(description) : "",
        url: link,
        imageUrl: null, // Google News RSS doesn't include images
        source: source || "Unknown",
        publishedAt: pubDate ? new Date(pubDate) : new Date(),
      });
    }
  }

  return articles;
}

/**
 * Extract text content from an XML tag.
 */
function extractTag(xml: string, tag: string): string | null {
  // Handle CDATA sections
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`);
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  // Handle regular text content
  const textRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const textMatch = xml.match(textRegex);
  if (textMatch) return textMatch[1].trim();

  // Handle self-closed or empty-adjacent pattern (e.g., <link>URL\n<something>)
  if (tag === "link") {
    const linkRegex = /<link\s*\/?>\s*(https?:\/\/[^\s<]+)/;
    const linkMatch = xml.match(linkRegex);
    if (linkMatch) return linkMatch[1].trim();
  }

  return null;
}

/**
 * Extract source name from the <source> tag.
 */
function extractSource(xml: string): string | null {
  const sourceRegex = /<source[^>]*>([\s\S]*?)<\/source>/;
  const match = xml.match(sourceRegex);
  return match ? match[1].trim() : null;
}

/**
 * Extract a clean text description from the HTML description field.
 * Google News RSS descriptions contain HTML with links to related articles.
 * The HTML is often entity-encoded, so we decode entities first, then strip tags.
 */
function extractDescription(xml: string): string | null {
  const raw = extractTag(xml, "description");
  if (!raw) return null;

  // Decode HTML entities first (Google News encodes HTML as &lt;a href=...&gt;)
  const decoded = decodeHtmlEntities(raw);
  // Strip HTML tags to get plain text
  const text = decoded.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text || null;
}

/**
 * Decode common HTML entities.
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ")
    .replace(/&#160;/g, " ")
    .replace(/&#xa0;/gi, " ");
}

/**
 * Deduplicate articles by URL.
 */
function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  const unique: NewsArticle[] = [];

  for (const article of articles) {
    const normalizedUrl = article.url.split("?")[0].replace(/\/$/, "");

    if (!seen.has(normalizedUrl)) {
      seen.add(normalizedUrl);
      unique.push(article);
    }
  }

  return unique;
}

/**
 * Fetch news with retry logic.
 */
export async function fetchNewsWithRetry(options: FetchNewsOptions): Promise<NewsArticle[]> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fetchNews(options);
    } catch (error) {
      lastError = error as Error;
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  console.error("Failed to fetch news after retries:", lastError);
  return [];
}
