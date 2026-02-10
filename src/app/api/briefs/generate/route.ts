import { auth } from "@/lib/auth";
import { generateBriefForUser } from "@/lib/brief-generator";
import { NextResponse } from "next/server";

/**
 * POST /api/briefs/generate
 * Generate a brief for the authenticated user (on-demand)
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate brief for the current user
    const brief = await generateBriefForUser(session.user.id);

    return NextResponse.json({
      data: {
        id: brief.id,
        subject: brief.subject,
        status: brief.status,
        createdAt: brief.createdAt,
      },
    });
  } catch (error) {
    console.error("Brief generation error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate brief";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
