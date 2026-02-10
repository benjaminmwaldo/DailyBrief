import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      take: 50, // Last 50 messages
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Failed to load chat history:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
