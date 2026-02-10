import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Build where clause
    const where: {
      category?: string;
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        description?: { contains: string; mode: "insensitive" };
      }>;
    } = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch all topics with user's subscription status
    const topics = await prisma.topic.findMany({
      where,
      include: {
        subscriptions: {
          where: {
            userId: session.user.id,
          },
        },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    // Transform to include subscription info
    const topicsWithSubscription = topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
      description: topic.description,
      category: topic.category,
      keywords: topic.keywords,
      isGlobal: topic.isGlobal,
      isSubscribed: topic.subscriptions.length > 0,
      subscription: topic.subscriptions[0] || null,
    }));

    return NextResponse.json({ data: topicsWithSubscription });
  } catch (error) {
    console.error("Topics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}
