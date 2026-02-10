import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { fetchNewsByTopicId, aggregateNewsForUser } from "@/lib/news-aggregator";

/**
 * GET /api/news/preview?topicId=xxx
 * Preview news articles for a specific topic or all user topics
 */
export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get("topicId");

    // If topicId is provided, fetch news for that specific topic
    if (topicId) {
      try {
        const articles = await fetchNewsByTopicId(topicId);
        return NextResponse.json({
          data: {
            topicId,
            articles,
          },
        });
      } catch (error) {
        console.error("Topic news fetch error:", error);
        return NextResponse.json(
          { error: "Topic not found or failed to fetch news" },
          { status: 404 }
        );
      }
    }

    // Otherwise, fetch news for all user's topics
    const topicNews = await aggregateNewsForUser(session.user.id);

    return NextResponse.json({
      data: topicNews,
    });
  } catch (error) {
    console.error("News preview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news preview" },
      { status: 500 }
    );
  }
}
