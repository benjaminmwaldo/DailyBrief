import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/dashboard/settings-form";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  // Fetch or create user preferences
  let preference = await prisma.userPreference.findUnique({
    where: { userId: session.user.id },
  });

  // Create default preferences if they don't exist
  if (!preference) {
    preference = await prisma.userPreference.create({
      data: {
        userId: session.user.id,
        timezone: "America/New_York",
        deliveryHour: 7,
        briefLength: "medium",
        includeGlobal: true,
      },
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your delivery preferences and customize your daily briefings
        </p>
      </div>

      <SettingsForm preference={preference} />
    </div>
  );
}
