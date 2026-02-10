import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { BriefStatus } from "@prisma/client";
import { EnvelopeOpenIcon } from "@heroicons/react/24/outline";

function getBriefStatusBadge(status: BriefStatus) {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-800",
    GENERATING: "bg-blue-100 text-blue-800",
    READY: "bg-green-100 text-green-800",
    SENT: "bg-gray-100 text-gray-800",
    FAILED: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default async function BriefsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || "1", 10);
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const [briefs, totalCount] = await Promise.all([
    prisma.brief.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip,
    }),
    prisma.brief.count({
      where: { userId: session.user.id },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your Briefs</h1>
        <p className="mt-2 text-gray-600">
          View all your daily briefings in one place
        </p>
      </div>

      {briefs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <EnvelopeOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No briefs yet
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Your daily briefings will appear here once you&apos;ve set up
              your topics
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {briefs.map((brief) => (
                  <Link
                    key={brief.id}
                    href={`/dashboard/briefs/${brief.id}`}
                    className="block hover:bg-gray-50 transition-colors"
                  >
                    <div className="px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="text-base font-medium text-gray-900">
                              {brief.subject}
                            </h3>
                            {getBriefStatusBadge(brief.status)}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            {brief.sentAt
                              ? `Sent ${new Date(brief.sentAt).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}`
                              : `Created ${new Date(brief.createdAt).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}`}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/dashboard/briefs?page=${page - 1}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/dashboard/briefs?page=${page + 1}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
