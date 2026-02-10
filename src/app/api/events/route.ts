import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");
    const category = searchParams.get("category");
    const country = searchParams.get("country");

    // Calculate date range
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    endDate.setHours(23, 59, 59, 999);

    // Build where clause
    interface WhereClause {
      date: {
        gte: Date;
        lte: Date;
      };
      isActive: boolean;
      category?: string;
      OR?: Array<{ country: string | null }>;
    }

    const where: WhereClause = {
      date: {
        gte: startDate,
        lte: endDate,
      },
      isActive: true,
    };

    if (category) {
      where.category = category;
    }

    if (country) {
      where.OR = [{ country: country }, { country: null }];
    }

    // Fetch events
    const events = await prisma.globalEvent.findMany({
      where,
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json({ data: events });
  } catch (error) {
    console.error("Error fetching global events:", error);
    return NextResponse.json(
      { error: "Failed to fetch global events" },
      { status: 500 }
    );
  }
}
