import { prisma } from "./prisma";
import { generateBriefForUser } from "./brief-generator";
import { sendBrief } from "./brief-sender";
import type { User } from "@prisma/client";

/**
 * Get users whose delivery hour matches the current hour in their timezone
 */
export async function getUsersForCurrentHour(): Promise<User[]> {
  const now = new Date();

  // Get all users with preferences
  const users = await prisma.user.findMany({
    include: {
      preference: true,
      subscriptions: {
        take: 1, // Just check if they have any subscriptions
      },
    },
  });

  // Filter users whose delivery hour matches current time in their timezone
  const matchingUsers: User[] = [];

  for (const user of users) {
    // Skip users without subscriptions
    if (!user.subscriptions || user.subscriptions.length === 0) {
      continue;
    }

    // Get user preferences (use defaults if not set)
    const timezone = user.preference?.timezone || "America/New_York";
    const deliveryHour = user.preference?.deliveryHour ?? 7;

    // Calculate the current hour in user's timezone
    const userLocalTime = new Date(
      now.toLocaleString("en-US", { timeZone: timezone })
    );
    const userLocalHour = userLocalTime.getHours();

    // Check if current hour matches delivery hour
    if (userLocalHour === deliveryHour) {
      matchingUsers.push(user);
    }
  }

  return matchingUsers;
}

/**
 * Check if user already received a brief today
 */
export async function hasReceivedBriefToday(
  userId: string,
  timezone: string = "America/New_York"
): Promise<boolean> {
  const now = new Date();

  // Get start and end of today in user's timezone
  const userLocalTime = new Date(
    now.toLocaleString("en-US", { timeZone: timezone })
  );
  const startOfDay = new Date(userLocalTime);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(userLocalTime);
  endOfDay.setHours(23, 59, 59, 999);

  // Check if brief exists for today
  const brief = await prisma.brief.findFirst({
    where: {
      userId,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        in: ["SENT", "READY"],
      },
    },
  });

  return brief !== null;
}

/**
 * Process a batch of users for brief generation and sending
 */
export async function processBriefBatch(
  userIds: string[],
  batchSize: number = 10
): Promise<BatchResult> {
  const results: BatchResult = {
    total: userIds.length,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  // Process in batches
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);

    // Process batch in parallel
    const batchPromises = batch.map(async (userId) => {
      try {
        // Get user timezone
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { preference: true },
        });

        if (!user) {
          results.skipped++;
          return;
        }

        const timezone = user.preference?.timezone || "America/New_York";

        // Check if already received brief today
        const alreadySent = await hasReceivedBriefToday(userId, timezone);
        if (alreadySent) {
          console.log(
            `User ${userId} already received a brief today, skipping`
          );
          results.skipped++;
          return;
        }

        // Generate brief
        const brief = await generateBriefForUser(userId);

        // Send brief
        await sendBrief(brief.id);

        results.succeeded++;
        console.log(
          `Successfully generated and sent brief for user ${userId}`
        );
      } catch (error) {
        results.failed++;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.errors.push({
          userId,
          error: errorMessage,
        });
        console.error(`Failed to process brief for user ${userId}:`, error);
      }
    });

    await Promise.all(batchPromises);

    // Small delay between batches to respect rate limits
    if (i + batchSize < userIds.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

export interface BatchResult {
  total: number;
  succeeded: number;
  failed: number;
  skipped: number;
  errors: Array<{
    userId: string;
    error: string;
  }>;
}
