import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const settingsSchema = z.object({
  timezone: z.string(),
  deliveryHour: z.number().min(0).max(23),
  briefLength: z.enum(["short", "medium", "long"]),
  includeGlobal: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = settingsSchema.parse(body);

    // Update or create user preferences
    const preference = await prisma.userPreference.upsert({
      where: { userId: session.user.id },
      update: {
        timezone: validated.timezone,
        deliveryHour: validated.deliveryHour,
        briefLength: validated.briefLength,
        includeGlobal: validated.includeGlobal,
      },
      create: {
        userId: session.user.id,
        timezone: validated.timezone,
        deliveryHour: validated.deliveryHour,
        briefLength: validated.briefLength,
        includeGlobal: validated.includeGlobal,
      },
    });

    return NextResponse.json({ data: preference });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
