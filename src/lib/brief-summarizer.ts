import { anthropic } from "./claude";
import type { NewsArticle } from "@/types/news";
import type { ArticleSummary } from "@/types/email";

export interface SummarizeOptions {
  articles: NewsArticle[];
  topicName: string;
  briefLength: "short" | "medium" | "long";
}

export interface SynthesisResult {
  articles: ArticleSummary[];
  synthesizedSummary: string;
  sources: { name: string; url: string }[];
}

/**
 * Strip residual HTML entities and tags from text
 */
function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Summarize news articles using Claude AI
 * Returns a synthesized narrative plus source list
 */
export async function summarizeArticles(
  options: SummarizeOptions
): Promise<SynthesisResult> {
  const { articles, topicName, briefLength } = options;

  if (articles.length === 0) {
    return { articles: [], synthesizedSummary: "", sources: [] };
  }

  // Determine how many articles to include based on brief length
  const articleCount = getArticleCount(briefLength);
  const selectedArticles = articles.slice(0, articleCount);

  // Clean all article text before sending to Claude
  const cleanedArticles = selectedArticles.map((a) => ({
    ...a,
    title: cleanText(a.title),
    description: cleanText(a.description),
    content: cleanText(a.content || a.description),
  }));

  // Build sources list from articles (always available regardless of AI success)
  const sources = selectedArticles.map((article) => ({
    name: cleanText(article.source),
    url: article.url,
  }));

  // Build article summaries for DB storage
  const articleSummaries: ArticleSummary[] = selectedArticles.map((article) => ({
    title: cleanText(article.title),
    summary: cleanText(article.description).slice(0, 300),
    sourceUrl: article.url,
    sourceName: cleanText(article.source),
    publishedAt: article.publishedAt,
    imageUrl: article.imageUrl || undefined,
  }));

  // Determine paragraph length guidance
  const lengthGuidance = getLengthGuidance(briefLength);

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: buildSynthesisPrompt(cleanedArticles, topicName, lengthGuidance),
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    const synthesis = parseSynthesis(content.text);

    if (synthesis.length < 50) {
      throw new Error("Synthesis too short, likely a parsing failure");
    }

    return { articles: articleSummaries, synthesizedSummary: synthesis, sources };
  } catch (error) {
    console.error("Error summarizing articles with Claude:", error);

    // Build a readable fallback from article titles
    const fallback = buildFallbackSynthesis(cleanedArticles, topicName);
    return { articles: articleSummaries, synthesizedSummary: fallback, sources };
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
 * Get length guidance for the synthesis paragraph
 */
function getLengthGuidance(briefLength: "short" | "medium" | "long"): string {
  switch (briefLength) {
    case "short":
      return "2-3 sentences";
    case "medium":
      return "4-5 sentences";
    case "long":
      return "6-8 sentences";
    default:
      return "4-5 sentences";
  }
}

/**
 * Build the synthesis prompt for Claude
 */
function buildSynthesisPrompt(
  articles: NewsArticle[],
  topicName: string,
  lengthGuidance: string
): string {
  const articleTexts = articles
    .map(
      (article, index) =>
        `[${index + 1}] "${article.title}" (${article.source})\n${article.content || article.description}`
    )
    .join("\n\n");

  return `You are writing a concise daily briefing paragraph about "${topicName}" for an email newsletter.

Here are today's articles:

${articleTexts}

Write a single cohesive paragraph of ${lengthGuidance} that synthesizes these stories into a flowing narrative. Do NOT list headlines — write it like a newspaper briefing column. Naturally reference which source reported what using bracketed numbers like [1], [2], etc.

Important: Output ONLY the briefing paragraph. No headings, no labels, no "SYNTHESIS:" prefix, no source list. Just the paragraph text.`;
}

/**
 * Parse the synthesis from Claude's response
 */
function parseSynthesis(response: string): string {
  let text = response.trim();

  // Strip any prefix labels Claude might add despite instructions
  text = text.replace(/^(SYNTHESIS|BRIEFING|SUMMARY|PARAGRAPH):\s*/i, "");

  // Strip any trailing sources section
  const sourcesIdx = text.search(/\n\s*(SOURCES|REFERENCES):/i);
  if (sourcesIdx > 0) {
    text = text.slice(0, sourcesIdx).trim();
  }

  return text;
}

/**
 * Build a readable fallback when Claude fails
 */
function buildFallbackSynthesis(articles: NewsArticle[], topicName: string): string {
  if (articles.length === 0) return "";

  const headlines = articles.map(
    (a, i) => `${a.title} [${i + 1}]`
  );

  if (articles.length === 1) {
    return `In ${topicName} today: ${headlines[0]}.`;
  }

  const last = headlines.pop();
  return `In ${topicName} today: ${headlines.join("; ")}; and ${last}.`;
}
