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

  // Determine paragraph length guidance
  const lengthGuidance = getLengthGuidance(briefLength);

  // Build prompt for Claude
  const prompt = buildSynthesisPrompt(selectedArticles, topicName, lengthGuidance);

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

    // Parse the response into synthesis + sources
    const { synthesis, sources } = parseSynthesisResponse(content.text, selectedArticles);

    // Still build article-level summaries for DB storage
    const articleSummaries: ArticleSummary[] = selectedArticles.map((article) => ({
      title: article.title,
      summary: article.description.slice(0, 300),
      sourceUrl: article.url,
      sourceName: article.source,
      publishedAt: article.publishedAt,
      imageUrl: article.imageUrl || undefined,
    }));

    return {
      articles: articleSummaries,
      synthesizedSummary: synthesis,
      sources,
    };
  } catch (error) {
    console.error("Error summarizing articles with Claude:", error);
    // Fallback: build a basic synthesis from descriptions
    const fallbackArticles = selectedArticles.map((article) => ({
      title: article.title,
      summary: article.description.slice(0, 300),
      sourceUrl: article.url,
      sourceName: article.source,
      publishedAt: article.publishedAt,
      imageUrl: article.imageUrl || undefined,
    }));

    const fallbackSources = selectedArticles.map((article) => ({
      name: article.source,
      url: article.url,
    }));

    const fallbackSynthesis = selectedArticles
      .map((a) => a.description.slice(0, 200))
      .join(" ");

    return {
      articles: fallbackArticles,
      synthesizedSummary: fallbackSynthesis,
      sources: fallbackSources,
    };
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
      (article, index) => `
[${index + 1}] "${article.title}"
Source: ${article.source}
URL: ${article.url}
Content: ${article.content || article.description}
`
    )
    .join("\n---\n");

  return `You are a professional news editor writing a daily email briefing. Synthesize the following articles about "${topicName}" into a single cohesive briefing paragraph.

Write a fluid narrative of ${lengthGuidance} that captures the key developments. Do NOT list articles individually — weave the information together naturally. Reference sources by number like [1], [2], etc.

Articles:
${articleTexts}

Respond in EXACTLY this format:

SYNTHESIS:
[Your synthesized paragraph here, referencing sources as [1], [2], etc.]

SOURCES:
[1] Source Name - URL
[2] Source Name - URL
...and so on for each source used.`;
}

/**
 * Parse Claude's synthesis response into structured data
 */
function parseSynthesisResponse(
  response: string,
  articles: NewsArticle[]
): { synthesis: string; sources: { name: string; url: string }[] } {
  // Extract synthesis section
  const synthesisMatch = response.match(/SYNTHESIS:\s*\n([\s\S]*?)(?=\nSOURCES:|$)/i);
  const synthesis = synthesisMatch ? synthesisMatch[1].trim() : response.trim();

  // Extract sources section
  const sourcesMatch = response.match(/SOURCES:\s*\n([\s\S]*?)$/i);
  const sources: { name: string; url: string }[] = [];

  if (sourcesMatch) {
    const sourceLines = sourcesMatch[1].trim().split("\n");
    for (const line of sourceLines) {
      const match = line.match(/\[\d+\]\s*(.+?)\s*-\s*(https?:\/\/\S+)/);
      if (match) {
        sources.push({ name: match[1].trim(), url: match[2].trim() });
      }
    }
  }

  // Fallback: if no sources parsed, build from articles
  if (sources.length === 0) {
    for (const article of articles) {
      sources.push({ name: article.source, url: article.url });
    }
  }

  return { synthesis, sources };
}
