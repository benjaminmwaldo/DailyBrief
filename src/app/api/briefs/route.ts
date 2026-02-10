import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { BriefStatus } from "@prisma/client";

/**
 * GET /api/briefs
 * List user's briefs (paginated)
 */
export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid page or limit parameter" },
        { status: 400 }
      );
    }

    // Build where clause
    const where: {
      userId: string;
      status?: BriefStatus;
    } = {
      userId: session.user.id,
    };

    if (status) {
      // Validate status enum
      const validStatuses: BriefStatus[] = ["PENDING", "GENERATING", "READY", "SENT", "FAILED"];
      if (!validStatuses.includes(status as BriefStatus)) {
        return NextResponse.json(
          { error: "Invalid status parameter" },
          { status: 400 }
        );
      }
      where.status = status as BriefStatus;
    }

    // Fetch briefs with pagination
    const [briefs, total] = await Promise.all([
      prisma.brief.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          subject: true,
          status: true,
          sentAt: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              title: true,
              topicId: true,
            },
            take: 5, // Only return first 5 items for preview
          },
        },
      }),
      prisma.brief.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      data: briefs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Briefs fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch briefs" },
      { status: 500 }
    );
  }
}
