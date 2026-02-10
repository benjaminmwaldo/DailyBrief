import { anthropic } from "./claude";
import type { NewsArticle } from "@/types/news";
import type { ArticleSummary } from "@/types/email";

export interface SummarizeOptions {
  articles: NewsArticle[];
  topicName: string;
  briefLength: "short" | "medium" | "long";
}

/**
 * Summarize news articles using Claude AI
 * Returns concise, engaging summaries for email briefing
 */
export async function summarizeArticles(
  options: SummarizeOptions
): Promise<ArticleSummary[]> {
  const { articles, topicName, briefLength } = options;

  if (articles.length === 0) {
    return [];
  }

  // Determine how many articles to include based on brief length
  const articleCount = getArticleCount(briefLength);
  const selectedArticles = articles.slice(0, articleCount);

  // Determine sentence count per summary
  const sentenceCount = getSentenceCount(briefLength);

  // Build prompt for Claude
  const prompt = buildSummarizationPrompt(
    selectedArticles,
    topicName,
    sentenceCount
  );

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Parse the response into structured summaries
    const summaries = parseClaudeResponse(content.text, selectedArticles);
    return summaries;
  } catch (error) {
    console.error("Error summarizing articles with Claude:", error);
    // Fallback: use article descriptions as summaries
    return selectedArticles.map((article) => ({
      title: article.title,
      summary: article.description.slice(0, 300),
      sourceUrl: article.url,
      sourceName: article.source,
      publishedAt: article.publishedAt,
      imageUrl: article.imageUrl || undefined,
    }));
  }
}

/**
 * Get number of articles to include based on brief length
 */
function getArticleCount(briefLength: "short" | "medium" | "long"): number {
  switch (briefLength) {
    case "short":
      return 2;
    case "medium":
      return 3;
    case "long":
      return 4;
    default:
      return 3;
  }
}

/**
 * Get sentence count per summary based on brief length
 */
function getSentenceCount(briefLength: "short" | "medium" | "long"): string {
  switch (briefLength) {
    case "short":
      return "1-2 sentences";
    case "medium":
      return "2-3 sentences";
    case "long":
      return "3-4 sentences";
    default:
      return "2-3 sentences";
  }
}

/**
 * Build the summarization prompt for Claude
 */
function buildSummarizationPrompt(
  articles: NewsArticle[],
  topicName: string,
  sentenceCount: string
): string {
  const articleTexts = articles
    .map(
      (article, index) => `
Article ${index + 1}:
Title: ${article.title}
Source: ${article.source}
Content: ${article.content || article.description}
URL: ${article.url}
`
    )
    .join("\n---\n");

  return `You are a professional news editor writing for a daily email briefing. Your task is to summarize the following news articles about "${topicName}".

For each article, write a concise summary of ${sentenceCount}. Your summaries should:
- Be informative, neutral, and engaging
- Include key facts and why the story matters
- Provide relevant context when needed
- Be written for a general audience

${articleTexts}

Please provide your summaries in the following format:

ARTICLE 1:
[Your ${sentenceCount} summary here]

ARTICLE 2:
[Your ${sentenceCount} summary here]

...and so on for each article.`;
}

/**
 * Parse Claude's response into structured ArticleSummary objects
 */
function parseClaudeResponse(
  response: string,
  articles: NewsArticle[]
): ArticleSummary[] {
  const summaries: ArticleSummary[] = [];

  // Split by "ARTICLE N:" pattern
  const sections = response.split(/ARTICLE \d+:/i).filter((s) => s.trim());

  sections.forEach((section, index) => {
    if (index < articles.length) {
      const article = articles[index];
      const summary = section.trim();

      summaries.push({
        title: article.title,
        summary,
        sourceUrl: article.url,
        sourceName: article.source,
        publishedAt: article.publishedAt,
        imageUrl: article.imageUrl || undefined,
      });
    }
  });

  // If parsing failed, fall back to using descriptions
  if (summaries.length === 0) {
    return articles.map((article) => ({
      title: article.title,
      summary: article.description.slice(0, 300),
      sourceUrl: article.url,
      sourceName: article.source,
      publishedAt: article.publishedAt,
      imageUrl: article.imageUrl || undefined,
    }));
  }

  return summaries;
}
