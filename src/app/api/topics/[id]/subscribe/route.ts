import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const subscribeSchema = z.object({
  priority: z.number().min(1).max(10).optional().default(5),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: topicId } = await params;

    // Verify topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const body = await req.json();
    const { priority } = subscribeSchema.parse(body);

    // Create or update subscription
    const subscription = await prisma.subscription.upsert({
      where: {
        userId_topicId: {
          userId: session.user.id,
          topicId: topicId,
        },
      },
      create: {
        userId: session.user.id,
        topicId: topicId,
        priority: priority,
      },
      update: {
        priority: priority,
      },
    });

    return NextResponse.json({ data: subscription });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: topicId } = await params;

    // Delete subscription if exists
    await prisma.subscription.deleteMany({
      where: {
        userId: session.user.id,
        topicId: topicId,
      },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
