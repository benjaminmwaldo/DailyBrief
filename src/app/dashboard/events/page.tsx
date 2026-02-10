import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Category badge color mapping
const categoryColors: Record<string, string> = {
  holiday: "bg-red-100 text-red-800",
  cultural: "bg-purple-100 text-purple-800",
  sports: "bg-blue-100 text-blue-800",
  election: "bg-green-100 text-green-800",
};

function formatEventDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const eventDate = new Date(date);
  const diffTime = eventDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
  return `In ${Math.ceil(diffDays / 30)} months`;
}

export default async function EventsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  // Fetch user preference
  const preference = await prisma.userPreference.findUnique({
    where: { userId: session.user.id },
  });

  // Fetch upcoming events (next 90 days)
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 90);
  endDate.setHours(23, 59, 59, 999);

  const events = await prisma.globalEvent.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      isActive: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  // Group events by month
  const eventsByMonth = events.reduce(
    (acc, event) => {
      const month = new Date(event.date).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(event);
      return acc;
    },
    {} as Record<string, typeof events>
  );

  const includeGlobalEvents = preference?.includeGlobal ?? true;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Global Events</h1>
          <p className="mt-2 text-gray-600">
            Upcoming holidays, cultural events, and important dates
          </p>
        </div>
        <Link href="/dashboard/settings">
          <Button variant="outline">
            {includeGlobalEvents ? "Events Enabled" : "Events Disabled"}
          </Button>
        </Link>
      </div>

      {/* Settings Notice */}
      {!includeGlobalEvents && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800">
              Global events are currently disabled in your preferences.{" "}
              <Link
                href="/dashboard/settings"
                className="underline font-medium"
              >
                Enable them in settings
              </Link>{" "}
              to include these events in your daily brief.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Events Timeline */}
      {Object.entries(eventsByMonth).length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600">No upcoming events found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
            <div key={month}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {month}
              </h2>
              <div className="space-y-3">
                {monthEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {event.title}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                categoryColors[event.category] ||
                                "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {event.category}
                            </span>
                            {event.country && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                {event.country}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            {event.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{formatEventDate(event.date)}</span>
                            <span className="text-blue-600 font-medium">
                              {getRelativeTime(event.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
