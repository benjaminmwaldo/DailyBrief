import type { NewsArticle, ScoredArticle } from "@/types/news";

const TRUSTED_SOURCES = [
  "BBC News",
  "The New York Times",
  "Reuters",
  "Associated Press",
  "The Guardian",
  "NPR",
  "The Wall Street Journal",
  "Bloomberg",
  "Financial Times",
  "The Economist",
  "CNN",
  "CNBC",
  "TechCrunch",
  "Ars Technica",
  "The Verge",
  "Wired",
];

interface ScoringWeights {
  titleMatch: number;
  descriptionMatch: number;
  recency: number;
  sourceReliability: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  titleMatch: 5.0,
  descriptionMatch: 2.0,
  recency: 1.5,
  sourceReliability: 1.0,
};

/**
 * Score articles based on relevance to topic keywords
 */
export function scoreArticles(
  articles: NewsArticle[],
  keywords: string[],
  weights: ScoringWeights = DEFAULT_WEIGHTS
): ScoredArticle[] {
  return articles
    .map((article) => ({
      ...article,
      score: calculateRelevanceScore(article, keywords, weights),
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Calculate relevance score for a single article
 */
function calculateRelevanceScore(
  article: NewsArticle,
  keywords: string[],
  weights: ScoringWeights
): number {
  let score = 0;

  // Title keyword match (highest weight)
  score += calculateKeywordScore(article.title, keywords) * weights.titleMatch;

  // Description keyword match
  score += calculateKeywordScore(article.description, keywords) * weights.descriptionMatch;

  // Recency score (newer = higher)
  score += calculateRecencyScore(article.publishedAt) * weights.recency;

  // Source reliability
  score += calculateSourceScore(article.source) * weights.sourceReliability;

  return score;
}

/**
 * Calculate keyword match density in text
 * Returns a score between 0 and 1
 */
function calculateKeywordScore(text: string, keywords: string[]): number {
  if (!text) return 0;

  const normalizedText = text.toLowerCase();
  let matches = 0;

  for (const keyword of keywords) {
    const normalizedKeyword = keyword.toLowerCase();

    // Count occurrences of the keyword
    const regex = new RegExp(`\\b${escapeRegex(normalizedKeyword)}\\b`, "gi");
    const occurrences = (normalizedText.match(regex) || []).length;

    matches += occurrences;
  }

  // Normalize by text length to get density
  const wordCount = text.split(/\s+/).length;
  return Math.min(matches / Math.max(wordCount, 1), 1);
}

/**
 * Calculate recency score based on article age
 * Returns a score between 0 and 1, with recent articles scoring higher
 */
function calculateRecencyScore(publishedAt: Date): number {
  const now = new Date();
  const ageInHours = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);

  // Score decays exponentially over 72 hours
  // Articles from last 24 hours: ~0.8-1.0
  // Articles from 24-48 hours: ~0.5-0.8
  // Articles from 48-72 hours: ~0.3-0.5
  // Articles older than 72 hours: <0.3
  const decayRate = 0.02; // Adjust this to change decay speed
  return Math.exp(-decayRate * ageInHours);
}

/**
 * Calculate source reliability score
 * Returns 1.0 for trusted sources, 0.5 for others
 */
function calculateSourceScore(source: string): number {
  const isTrusted = TRUSTED_SOURCES.some(
    (trustedSource) => source.toLowerCase().includes(trustedSource.toLowerCase())
  );
  return isTrusted ? 1.0 : 0.5;
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Deduplicate articles across topics
 * When an article matches multiple topics, assign it to the topic with highest relevance
 */
export function deduplicateAcrossTopics(
  topicArticles: Array<{ topicId: string; articles: ScoredArticle[] }>
): Array<{ topicId: string; articles: ScoredArticle[] }> {
  // Track which articles have been assigned to which topic
  const articleToTopic = new Map<string, { topicId: string; score: number }>();

  // First pass: find the best topic for each article
  for (const { topicId, articles } of topicArticles) {
    for (const article of articles) {
      const existing = articleToTopic.get(article.url);

      if (!existing || article.score > existing.score) {
        articleToTopic.set(article.url, { topicId, score: article.score });
      }
    }
  }

  // Second pass: filter articles to only include those assigned to this topic
  return topicArticles.map(({ topicId, articles }) => ({
    topicId,
    articles: articles.filter(
      (article) => articleToTopic.get(article.url)?.topicId === topicId
    ),
  }));
}
