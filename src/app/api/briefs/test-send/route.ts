import { auth } from "@/lib/auth";
import { generateBriefForUser } from "@/lib/brief-generator";
import { sendBrief } from "@/lib/brief-sender";
import { NextResponse } from "next/server";

// Allow up to 60s for AI summarization + email send
export const maxDuration = 60;

/**
 * POST /api/briefs/test-send
 * Generate a brief AND send it via email (test mode).
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 1: Generate the brief
    const brief = await generateBriefForUser(session.user.id);

    // Step 2: Send it via email
    await sendBrief(brief.id);

    // Step 3: Count items
    const { prisma } = await import("@/lib/prisma");
    const itemCount = await prisma.briefItem.count({
      where: { briefId: brief.id },
    });

    return NextResponse.json({
      data: {
        id: brief.id,
        subject: brief.subject,
        status: "SENT",
        itemCount,
      },
    });
  } catch (error) {
    console.error("Test send error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate and send brief";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
