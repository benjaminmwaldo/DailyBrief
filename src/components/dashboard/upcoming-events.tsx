import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { GlobalEvent } from "@prisma/client";

interface UpcomingEventsProps {
  events: GlobalEvent[];
}

// Category badge color mapping
const categoryColors: Record<string, string> = {
  holiday: "bg-red-100 text-red-800",
  cultural: "bg-purple-100 text-purple-800",
  sports: "bg-blue-100 text-blue-800",
  election: "bg-green-100 text-green-800",
};

// Category icons (using text symbols for simplicity)
const categoryIcons: Record<string, string> = {
  holiday: "🎉",
  cultural: "🎭",
  sports: "⚽",
  election: "🗳️",
};

function getRelativeTime(date: Date): string {
  const now = new Date();
  const eventDate = new Date(date);
  const diffTime = eventDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;
  return `In ${Math.ceil(diffDays / 7)} weeks`;
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>
            Notable holidays and events in your calendar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 text-center py-4">
            No upcoming events at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>
              Notable holidays and events in your calendar
            </CardDescription>
          </div>
          <Link href="/dashboard/events">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.slice(0, 5).map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 pb-4 border-b last:border-b-0 last:pb-0"
            >
              {/* Date Badge */}
              <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                <span className="text-xs font-medium text-gray-600 uppercase">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    month: "short",
                  })}
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {new Date(event.date).getDate()}
                </span>
              </div>

              {/* Event Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      {event.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          categoryColors[event.category] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {categoryIcons[event.category] || "📅"}{" "}
                        {event.category}
                      </span>
                      <span className="text-xs text-blue-600 font-medium">
                        {getRelativeTime(event.date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
