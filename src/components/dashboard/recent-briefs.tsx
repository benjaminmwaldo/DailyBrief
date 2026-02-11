import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EnvelopeOpenIcon } from "@heroicons/react/24/outline";
import { BriefStatus } from "@prisma/client";

interface Brief {
  id: string;
  subject: string;
  status: BriefStatus;
  sentAt: Date | null;
  createdAt: Date;
}

interface RecentBriefsProps {
  briefs: Brief[];
}

function getBriefStatusBadge(status: BriefStatus) {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    GENERATING: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    READY: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    SENT: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    FAILED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export function RecentBriefs({ briefs }: RecentBriefsProps) {
  if (briefs.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <EnvelopeOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No briefs yet
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Chat with our AI to set up your topics and start receiving daily
            briefings
          </p>
          <Link href="/dashboard/chat" className="mt-4 inline-block">
            <Button>Start Chat</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {briefs.map((brief) => (
            <Link
              key={brief.id}
              href={`/dashboard/briefs/${brief.id}`}
              className="block hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {brief.subject}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {brief.sentAt
                        ? new Date(brief.sentAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : new Date(brief.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {getBriefStatusBadge(brief.status)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
