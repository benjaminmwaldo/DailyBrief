import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/briefs/[id]
 * Get a specific brief by ID (only accessible by the brief owner)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch brief with all items
    const brief = await prisma.brief.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: {
            position: "asc",
          },
          include: {
            topic: {
              select: {
                name: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    // Check ownership
    if (brief.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ data: brief });
  } catch (error) {
    console.error("Brief fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch brief" },
      { status: 500 }
    );
  }
}
