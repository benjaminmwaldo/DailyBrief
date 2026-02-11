import type { User, UserPreference, GlobalEvent } from "@prisma/client";
import type { TopicNews } from "@/types/news";
import type { DailyBriefProps, TopicSection, GlobalEventItem } from "@/types/email";
import { summarizeArticles } from "./brief-summarizer";
import { anthropic } from "./claude";

export interface ComposeBriefOptions {
  user: User;
  topicNews: TopicNews[];
  globalEvents: GlobalEvent[];
  preferences: UserPreference;
}

export interface BriefData {
  subject: string;
  briefProps: DailyBriefProps;
}

/**
 * Compose a complete brief from news articles and global events
 * Returns structured data ready for email rendering
 */
export async function composeBrief(
  options: ComposeBriefOptions
): Promise<BriefData> {
  const { user, topicNews, globalEvents, preferences } = options;

  // Sort topics by priority (not in TopicNews, so we keep original order from generator)
  const sortedTopicNews = topicNews;

  // Summarize all topics in parallel for speed
  const topicsWithArticles = sortedTopicNews.filter((t) => t.articles.length > 0);

  const results = await Promise.all(
    topicsWithArticles.map((topicItem) =>
      summarizeArticles({
        articles: topicItem.articles,
        topicName: topicItem.topicName,
        briefLength: preferences.briefLength as "short" | "medium" | "long",
      })
    )
  );

  const topicSections: TopicSection[] = [];
  for (let i = 0; i < topicsWithArticles.length; i++) {
    const result = results[i];
    if (result.articles.length > 0) {
      topicSections.push({
        name: topicsWithArticles[i].topicName,
        category: "general",
        articles: result.articles,
        synthesizedSummary: result.synthesizedSummary,
        sources: result.sources,
      });
    }
  }

  // Include global events if user preference is enabled
  const globalEventItems: GlobalEventItem[] = preferences.includeGlobal
    ? globalEvents.map((event) => ({
        title: event.title,
        description: event.description,
        date: event.date,
        category: event.category,
      }))
    : [];

  // Generate catchy subject line
  const subject = await generateSubject(user.name || "there", topicSections);

  // Build brief props for email template
  const briefProps: DailyBriefProps = {
    userName: user.name || "there",
    date: new Date(),
    topics: topicSections,
    globalEvents: globalEventItems.length > 0 ? globalEventItems : undefined,
    unsubscribeUrl: `${process.env.NEXTAUTH_URL}/dashboard/settings`,
    manageTopicsUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
  };

  return {
    subject,
    briefProps,
  };
}

/**
 * Generate a catchy subject line using Claude
 */
async function generateSubject(
  userName: string,
  topicSections: TopicSection[]
): Promise<string> {
  // Fallback subject if Claude fails
  const fallbackSubject = `Your Daily Brief — ${new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date())}`;

  if (topicSections.length === 0) {
    return fallbackSubject;
  }

  // Get topic names and the start of the synthesized summaries
  const topicInfo = topicSections
    .slice(0, 3)
    .map((topic) => {
      const preview = topic.synthesizedSummary
        ? topic.synthesizedSummary.slice(0, 100)
        : topic.articles[0]?.title || "";
      return `${topic.name}: ${preview}`;
    })
    .join("\n");

  const prompt = `Generate a short, catchy email subject line (max 60 characters) for a daily news briefing email.

The brief covers these topics and headlines:
${topicInfo}

The subject should be:
- Brief and punchy (under 60 characters)
- Engaging and clickable
- Reflect the most interesting story of the day
- Not use emojis

Just respond with the subject line, nothing else.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 100,
      temperature: 0.8,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === "text" && content.text.trim()) {
      const subject = content.text.trim().replace(/^["']|["']$/g, ""); // Remove quotes if present

      // Ensure subject is not too long
      if (subject.length <= 80) {
        return subject;
      }
    }
  } catch (error) {
    console.error("Error generating subject with Claude:", error);
  }

  return fallbackSubject;
}
