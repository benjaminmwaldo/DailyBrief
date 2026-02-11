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
 * How many articles to FEED to Claude (more = better judgement).
 * Claude will decide which ones matter.
 */
function getInputArticleCount(briefLength: "short" | "medium" | "long"): number {
  switch (briefLength) {
    case "short":
      return 5;
    case "medium":
      return 7;
    case "long":
      return 10;
    default:
      return 7;
  }
}

/**
 * Get length guidance for the synthesis
 */
function getLengthGuidance(briefLength: "short" | "medium" | "long"): string {
  switch (briefLength) {
    case "short":
      return "2-4 sentences";
    case "medium":
      return "4-6 sentences";
    case "long":
      return "6-10 sentences";
    default:
      return "4-6 sentences";
  }
}

/**
 * Summarize news articles using Claude AI.
 * Feeds Claude many articles and lets it judge importance,
 * filter opinion, and write a real briefing paragraph.
 */
export async function summarizeArticles(
  options: SummarizeOptions
): Promise<SynthesisResult> {
  const { articles, topicName, briefLength } = options;

  if (articles.length === 0) {
    return { articles: [], synthesizedSummary: "", sources: [] };
  }

  // Give Claude more articles than we'd ever show — it picks what matters
  const inputCount = getInputArticleCount(briefLength);
  const candidateArticles = articles.slice(0, inputCount);

  // Clean all text
  const cleaned = candidateArticles.map((a) => ({
    ...a,
    title: cleanText(a.title),
    description: cleanText(a.description),
    content: cleanText(a.content || a.description),
    source: cleanText(a.source),
  }));

  const lengthGuidance = getLengthGuidance(briefLength);

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      temperature: 0.5,
      messages: [
        {
          role: "user",
          content: buildPrompt(cleaned, topicName, lengthGuidance),
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    const { paragraph, usedIndices } = parseResponse(content.text, cleaned.length);

    if (paragraph.length < 80) {
      throw new Error("Synthesis too short — likely a parsing failure");
    }

    // Build sources only from the articles Claude actually used
    const usedArticles = usedIndices.length > 0
      ? usedIndices.map((i) => candidateArticles[i]).filter(Boolean)
      : candidateArticles.slice(0, 3); // safety fallback

    const sources = usedArticles.map((a) => ({
      name: cleanText(a.source),
      url: a.url,
    }));

    // DB storage — keep all candidate articles as brief items
    const articleSummaries: ArticleSummary[] = candidateArticles.map((a) => ({
      title: cleanText(a.title),
      summary: cleanText(a.description).slice(0, 300),
      sourceUrl: a.url,
      sourceName: cleanText(a.source),
      publishedAt: a.publishedAt,
      imageUrl: a.imageUrl || undefined,
    }));

    return { articles: articleSummaries, synthesizedSummary: paragraph, sources };
  } catch (error) {
    console.error("Error summarizing articles with Claude:", error);
    return buildFallback(candidateArticles, topicName);
  }
}

/**
 * The prompt: give Claude editorial judgement
 */
function buildPrompt(
  articles: NewsArticle[],
  topicName: string,
  lengthGuidance: string,
): string {
  const feed = articles
    .map(
      (a, i) =>
        `[${i + 1}] "${a.title}" — ${a.source}\n${a.content || a.description}`
    )
    .join("\n\n");

  return `You are writing the "${topicName}" section of a daily news briefing email. Your reader is a busy professional who wants to know what actually matters today — not a list of every headline.

Here are the articles available:

${feed}

Your job:
1. Read all the articles and decide which developments are genuinely important or noteworthy. You do NOT need to cover every article — skip anything trivial, redundant, or that doesn't add real information.
2. Skip opinion pieces and editorials unless they reflect a major shift or are from a very significant figure.
3. Write a single flowing paragraph (${lengthGuidance}) that tells the reader what's happening in ${topicName} today. Write like a sharp, concise newspaper columnist — not a list of headlines. Explain WHY things matter when relevant.
4. Do NOT include bracketed numbers, source citations, or any references in the paragraph text. Just write clean prose.
5. If there's really only one important story, that's fine — write about just that one. Quality over quantity.

After the paragraph, on a new line write USED: followed by a comma-separated list of the article numbers you drew from (e.g., USED: 1, 3, 5).

Output the briefing paragraph first, then the USED line. Nothing else.`;
}

/**
 * Parse Claude's response: extract the paragraph and which articles were used
 */
function parseResponse(
  response: string,
  articleCount: number,
): { paragraph: string; usedIndices: number[] } {
  let text = response.trim();

  // Strip any prefix labels
  text = text.replace(/^(SYNTHESIS|BRIEFING|SUMMARY|PARAGRAPH):\s*/i, "");

  // Extract USED line
  const usedMatch = text.match(/\n\s*USED:\s*(.+)$/im);
  const usedIndices: number[] = [];

  if (usedMatch) {
    const nums = usedMatch[1].match(/\d+/g);
    if (nums) {
      for (const n of nums) {
        const idx = parseInt(n, 10) - 1; // convert 1-based to 0-based
        if (idx >= 0 && idx < articleCount) {
          usedIndices.push(idx);
        }
      }
    }
    // Remove the USED line from the paragraph
    text = text.slice(0, usedMatch.index).trim();
  }

  // Also strip any trailing source/reference sections
  const trailingIdx = text.search(/\n\s*(SOURCES|REFERENCES|Source):/i);
  if (trailingIdx > 0) {
    text = text.slice(0, trailingIdx).trim();
  }

  // Strip any leftover bracketed numbers from the paragraph
  text = text.replace(/\s*\[\d+\]/g, "");

  return { paragraph: text, usedIndices };
}

/**
 * Fallback when Claude fails — still readable, not raw concatenation
 */
function buildFallback(articles: NewsArticle[], topicName: string): SynthesisResult {
  const cleaned = articles.slice(0, 3).map((a) => ({
    title: cleanText(a.title),
    source: cleanText(a.source),
    description: cleanText(a.description),
  }));

  const paragraph = cleaned.length === 1
    ? `Today in ${topicName}, ${cleaned[0].source} reports: ${cleaned[0].title}.`
    : `Today in ${topicName}: ${cleaned.map((a) => `${a.title} (${a.source})`).join(". ")}.`;

  const sources = articles.slice(0, 3).map((a) => ({
    name: cleanText(a.source),
    url: a.url,
  }));

  const articleSummaries: ArticleSummary[] = articles.slice(0, 3).map((a) => ({
    title: cleanText(a.title),
    summary: cleanText(a.description).slice(0, 300),
    sourceUrl: a.url,
    sourceName: cleanText(a.source),
    publishedAt: a.publishedAt,
    imageUrl: a.imageUrl || undefined,
  }));

  return { articles: articleSummaries, synthesizedSummary: paragraph, sources };
}
