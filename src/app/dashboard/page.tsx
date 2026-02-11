import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentBriefs } from "@/components/dashboard/recent-briefs";
import { TopicGrid } from "@/components/dashboard/topic-grid";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { TestModePanel } from "@/components/dashboard/test-mode-panel";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  // Fetch user data
  const [subscriptions, briefs, preference, upcomingEvents] = await Promise.all([
    prisma.subscription.findMany({
      where: { userId: session.user.id },
      include: { topic: true },
      orderBy: { priority: "desc" },
    }),
    prisma.brief.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.userPreference.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.globalEvent.findMany({
      where: {
        date: {
          gte: new Date(),
        },
        isActive: true,
      },
      orderBy: {
        date: "asc",
      },
      take: 5,
    }),
  ]);

  const totalBriefs = await prisma.brief.count({
    where: { userId: session.user.id },
  });

  // Calculate next delivery time
  const deliveryHour = preference?.deliveryHour ?? 7;
  const now = new Date();
  const nextDelivery = new Date(now);
  nextDelivery.setHours(deliveryHour, 0, 0, 0);
  if (nextDelivery <= now) {
    nextDelivery.setDate(nextDelivery.getDate() + 1);
  }

  const userName = session.user.name?.split(" ")[0] || "there";
  const greeting = getGreeting();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {greeting}, {userName}!
        </h1>
        <p className="mt-2 text-gray-600">{formatDate()}</p>
      </div>

      {/* Quick Stats */}
      <StatsCards
        activeTopics={subscriptions.length}
        totalBriefs={totalBriefs}
        nextDelivery={nextDelivery.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
      />

      {/* Recent Briefs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Recent Briefs
          </h2>
          <Link href="/dashboard/briefs">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <RecentBriefs briefs={briefs} />
      </div>

      {/* Active Topics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Active Topics
          </h2>
          <Link href="/dashboard/topics">
            <Button variant="outline" size="sm">
              Manage Topics
            </Button>
          </Link>
        </div>
        <TopicGrid subscriptions={subscriptions} />
      </div>

      {/* Upcoming Events Widget */}
      {preference?.includeGlobal && upcomingEvents.length > 0 && (
        <UpcomingEvents events={upcomingEvents} />
      )}

      {/* Test Mode */}
      <TestModePanel />

      {/* Quick Actions */}
      {subscriptions.length === 0 && briefs.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Get Started with DailyBrief
          </h3>
          <p className="text-gray-600 mb-4">
            Chat with our AI to discover topics and start receiving personalized
            daily briefings
          </p>
          <Link href="/chat">
            <Button size="lg">Start Chat</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
