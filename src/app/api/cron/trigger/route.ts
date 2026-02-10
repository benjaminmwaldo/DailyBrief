import { NextRequest } from "next/server";
import {
  getUsersForCurrentHour,
  processBriefBatch,
} from "@/lib/scheduling";
import { generateBriefForUser } from "@/lib/brief-generator";
import { sendBrief } from "@/lib/brief-sender";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes

interface TriggerRequest {
  userId?: string;
}

interface TriggerResponse {
  success: boolean;
  message: string;
  stats?: {
    usersProcessed: number;
    succeeded: number;
    failed: number;
    skipped: number;
  };
  errors?: Array<{
    userId: string;
    error: string;
  }>;
}

export async function POST(request: NextRequest): Promise<Response> {
  const startTime = Date.now();

  try {
    // Verify cron secret for authentication
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET is not configured");
      return Response.json(
        {
          success: false,
          message: "Cron secret not configured",
        } as TriggerResponse,
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("Unauthorized trigger request");
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        } as TriggerResponse,
        { status: 401 }
      );
    }

    // Parse request body
    let body: TriggerRequest = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is okay
    }

    const { userId } = body;

    console.log(
      `Manual trigger started ${userId ? `for user ${userId}` : "for all due users"}`
    );

    if (userId) {
      // Process specific user
      try {
        const brief = await generateBriefForUser(userId);
        await sendBrief(brief.id);

        const duration = Date.now() - startTime;
        console.log(
          `Manual trigger completed in ${duration}ms for user ${userId}`
        );

        return Response.json({
          success: true,
          message: `Successfully generated and sent brief for user ${userId}`,
          stats: {
            usersProcessed: 1,
            succeeded: 1,
            failed: 0,
            skipped: 0,
          },
        } as TriggerResponse);
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(
          `Manual trigger failed after ${duration}ms for user ${userId}:`,
          error
        );

        return Response.json(
          {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
            stats: {
              usersProcessed: 1,
              succeeded: 0,
              failed: 1,
              skipped: 0,
            },
            errors: [
              {
                userId,
                error:
                  error instanceof Error ? error.message : "Unknown error",
              },
            ],
          } as TriggerResponse,
          { status: 500 }
        );
      }
    } else {
      // Process all users due for current hour
      const users = await getUsersForCurrentHour();

      if (users.length === 0) {
        console.log("No users to process for current hour");
        return Response.json({
          success: true,
          message: "No users to process for current hour",
          stats: {
            usersProcessed: 0,
            succeeded: 0,
            failed: 0,
            skipped: 0,
          },
        } as TriggerResponse);
      }

      console.log(`Found ${users.length} users to process`);

      const userIds = users.map((u) => u.id);
      const result = await processBriefBatch(userIds, 10);

      const duration = Date.now() - startTime;
      console.log(
        `Manual trigger completed in ${duration}ms. Success: ${result.succeeded}, Failed: ${result.failed}, Skipped: ${result.skipped}`
      );

      return Response.json({
        success: true,
        message: `Processed ${result.total} users`,
        stats: {
          usersProcessed: result.total,
          succeeded: result.succeeded,
          failed: result.failed,
          skipped: result.skipped,
        },
        errors: result.errors.length > 0 ? result.errors : undefined,
      } as TriggerResponse);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Manual trigger failed after ${duration}ms:`, error);

    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      } as TriggerResponse,
      { status: 500 }
    );
  }
}
