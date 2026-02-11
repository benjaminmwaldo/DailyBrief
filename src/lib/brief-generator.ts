import { prisma } from "./prisma";
import { fetchNewsWithRetry } from "./news";
import { composeBrief } from "./brief-composer";
import { renderDailyBrief } from "./email-renderer";
import type { Brief } from "@prisma/client";
import type { TopicNews } from "@/types/news";

/**
 * Main pipeline: Generate a personalized brief for a user
 * Returns the generated Brief record
 */
export async function generateBriefForUser(userId: string): Promise<Brief> {
  // Step 1: Load user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        include: {
          topic: true,
        },
        orderBy: {
          priority: "desc", // Higher priority first
        },
      },
      preference: true,
    },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  if (user.subscriptions.length === 0) {
    throw new Error(`User ${userId} has no topic subscriptions`);
  }

  // Get or create user preferences
  let preferences = user.preference;
  if (!preferences) {
    preferences = await prisma.userPreference.create({
      data: {
        userId: user.id,
      },
    });
  }

  // Create a brief record with GENERATING status
  const brief = await prisma.brief.create({
    data: {
      userId: user.id,
      subject: "", // Will be updated later
      htmlContent: "",
      textContent: "",
      status: "GENERATING",
    },
  });

  try {
    // Step 2: Fetch news for all subscribed topics
    const topicNews: TopicNews[] = [];

    for (const subscription of user.subscriptions) {
      const topic = subscription.topic;

      // Fetch news for this topic (last 24 hours)
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const articles = await fetchNewsWithRetry({
        keywords: topic.keywords,
        from: yesterday,
        to: now,
        maxResults: 10,
      });

      if (articles.length > 0) {
        topicNews.push({
          topicId: topic.id,
          topicName: topic.name,
          articles,
        });
      }
    }

    // Step 3: Fetch global events for today (if user wants them)
    const globalEvents = preferences.includeGlobal
      ? await prisma.globalEvent.findMany({
          where: {
            isActive: true,
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
          orderBy: {
            date: "asc",
          },
        })
      : [];

    // Step 4: Compose the brief (includes AI summarization)
    const { subject, briefProps } = await composeBrief({
      user,
      topicNews,
      globalEvents,
      preferences,
    });

    // Step 5: Render email HTML and text
    const { html, text } = await renderDailyBrief(briefProps);

    // Step 6: Save brief items to database
    const briefItems = [];
    let position = 0;

    for (const topicSection of briefProps.topics) {
      for (const article of topicSection.articles) {
        briefItems.push({
          topicId: topicNews.find((tn) => tn.topicName === topicSection.name)
            ?.topicId ?? null,
          title: article.title,
          summary: article.summary,
          sourceUrl: article.sourceUrl,
          imageUrl: article.imageUrl ?? null,
          position: position++,
        });
      }
    }

    // Add global events as brief items
    if (briefProps.globalEvents) {
      for (const event of briefProps.globalEvents) {
        briefItems.push({
          topicId: null,
          title: event.title,
          summary: event.description,
          sourceUrl: null,
          imageUrl: null,
          position: position++,
        });
      }
    }

    // Step 7: Update brief with content and items
    const updatedBrief = await prisma.brief.update({
      where: { id: brief.id },
      data: {
        subject,
        htmlContent: html,
        textContent: text,
        status: "READY",
        items: {
          createMany: {
            data: briefItems,
          },
        },
      },
      include: {
        items: true,
      },
    });

    return updatedBrief;
  } catch (error) {
    // If generation fails, mark brief as FAILED
    await prisma.brief.update({
      where: { id: brief.id },
      data: {
        status: "FAILED",
      },
    });

    console.error(`Failed to generate brief for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Generate briefs for multiple users (batch operation)
 * Returns array of generated briefs
 */
export async function generateBriefsForUsers(
  userIds: string[]
): Promise<Brief[]> {
  const briefs: Brief[] = [];
  const errors: Array<{ userId: string; error: string }> = [];

  for (const userId of userIds) {
    try {
      const brief = await generateBriefForUser(userId);
      briefs.push(brief);
    } catch (error) {
      console.error(`Failed to generate brief for user ${userId}:`, error);
      errors.push({
        userId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (errors.length > 0) {
    console.error(`Failed to generate ${errors.length} briefs:`, errors);
  }

  return briefs;
}

/**
 * Generate briefs for all active users
 */
export async function generateBriefsForAllUsers(): Promise<Brief[]> {
  // Get all users who have subscriptions
  const users = await prisma.user.findMany({
    where: {
      subscriptions: {
        some: {},
      },
    },
    select: {
      id: true,
    },
  });

  const userIds = users.map((u) => u.id);
  return generateBriefsForUsers(userIds);
}
