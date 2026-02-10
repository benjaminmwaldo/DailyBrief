import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const event = await prisma.globalEvent.findUnique({
      where: { id: params.id },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: event });
  } catch (error) {
    console.error("Error fetching global event:", error);
    return NextResponse.json(
      { error: "Failed to fetch global event" },
      { status: 500 }
    );
  }
}

// Admin-only PUT handler for future use
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const body = await request.json();

    const event = await prisma.globalEvent.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        date: body.date ? new Date(body.date) : undefined,
        category: body.category,
        country: body.country,
        isActive: body.isActive,
      },
    });

    return NextResponse.json({ data: event });
  } catch (error) {
    console.error("Error updating global event:", error);
    return NextResponse.json(
      { error: "Failed to update global event" },
      { status: 500 }
    );
  }
}
