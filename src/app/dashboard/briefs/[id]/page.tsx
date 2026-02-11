import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { BriefStatus } from "@prisma/client";

function getBriefStatusBadge(status: BriefStatus) {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    GENERATING: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 dark:bg-blue-900 dark:text-blue-300",
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

export default async function BriefViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const { id } = await params;

  const brief = await prisma.brief.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          topic: true,
        },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!brief) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Link href="/dashboard/briefs">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Briefs
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {brief.subject}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {brief.sentAt
                ? `Sent on ${new Date(brief.sentAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}`
                : `Created on ${new Date(brief.createdAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}`}
            </p>
          </div>
          {getBriefStatusBadge(brief.status)}
        </div>
      </div>

      {/* Brief Items */}
      {brief.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Topics Covered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from(
                new Set(brief.items.map((item) => item.topic?.name).filter(Boolean))
              ).map((topicName) => (
                <span
                  key={topicName}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  {topicName}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Brief Content */}
      <Card>
        <CardContent className="p-8">
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: brief.htmlContent }}
          />
        </CardContent>
      </Card>

      {/* Alternative: Plain text view */}
      {brief.status !== "SENT" && (
        <details className="text-sm">
          <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white">
            View plain text version
          </summary>
          <Card className="mt-2">
            <CardContent className="p-6">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300">
                {brief.textContent}
              </pre>
            </CardContent>
          </Card>
        </details>
      )}
    </div>
  );
}
