import { NextRequest } from "next/server";
import {
  getUsersForCurrentHour,
  processBriefBatch,
} from "@/lib/scheduling";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes

interface CronResponse {
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

export async function GET(request: NextRequest): Promise<Response> {
  const startTime = Date.now();

  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET is not configured");
      return Response.json(
        {
          success: false,
          message: "Cron secret not configured",
        } as CronResponse,
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("Unauthorized cron request");
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        } as CronResponse,
        { status: 401 }
      );
    }

    console.log("Starting daily brief cron job...");

    // Get users whose delivery hour matches the current hour
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
      } as CronResponse);
    }

    console.log(`Found ${users.length} users to process`);

    // Process users in batches
    const userIds = users.map((u) => u.id);
    const result = await processBriefBatch(userIds, 10);

    const duration = Date.now() - startTime;
    console.log(
      `Cron job completed in ${duration}ms. Success: ${result.succeeded}, Failed: ${result.failed}, Skipped: ${result.skipped}`
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
    } as CronResponse);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Cron job failed after ${duration}ms:`, error);

    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      } as CronResponse,
      { status: 500 }
    );
  }
}
