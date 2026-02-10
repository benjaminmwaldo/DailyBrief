import { prisma } from "./prisma";
import { sendEmail } from "./resend";

/**
 * Send a brief via email and update its status
 */
export async function sendBrief(briefId: string): Promise<void> {
  // Load brief from database
  const brief = await prisma.brief.findUnique({
    where: { id: briefId },
    include: {
      user: true,
    },
  });

  if (!brief) {
    throw new Error(`Brief ${briefId} not found`);
  }

  if (brief.status === "SENT") {
    console.log(`Brief ${briefId} has already been sent`);
    return;
  }

  if (brief.status !== "READY") {
    throw new Error(
      `Brief ${briefId} is not ready to send (status: ${brief.status})`
    );
  }

  if (!brief.user.email) {
    throw new Error(`User ${brief.userId} has no email address`);
  }

  try {
    // Send email via Resend
    await sendEmail({
      to: brief.user.email,
      subject: brief.subject,
      html: brief.htmlContent,
      text: brief.textContent,
    });

    // Update brief status to SENT
    await prisma.brief.update({
      where: { id: briefId },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    console.log(`Brief ${briefId} sent successfully to ${brief.user.email}`);
  } catch (error) {
    // Update brief status to FAILED
    await prisma.brief.update({
      where: { id: briefId },
      data: {
        status: "FAILED",
      },
    });

    console.error(`Failed to send brief ${briefId}:`, error);
    throw error;
  }
}

/**
 * Send multiple briefs in batch
 */
export async function sendBriefs(briefIds: string[]): Promise<void> {
  const errors: Array<{ briefId: string; error: string }> = [];

  for (const briefId of briefIds) {
    try {
      await sendBrief(briefId);
    } catch (error) {
      console.error(`Failed to send brief ${briefId}:`, error);
      errors.push({
        briefId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (errors.length > 0) {
    console.error(`Failed to send ${errors.length} briefs:`, errors);
    throw new Error(`Failed to send ${errors.length} briefs`);
  }
}

/**
 * Send all ready briefs
 */
export async function sendAllReadyBriefs(): Promise<void> {
  const readyBriefs = await prisma.brief.findMany({
    where: {
      status: "READY",
    },
    select: {
      id: true,
    },
  });

  const briefIds = readyBriefs.map((b) => b.id);

  if (briefIds.length === 0) {
    console.log("No ready briefs to send");
    return;
  }

  console.log(`Sending ${briefIds.length} ready briefs...`);
  await sendBriefs(briefIds);
}
