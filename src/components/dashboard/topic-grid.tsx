"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface Topic {
  id: string;
  name: string;
  description: string | null;
  category: string;
}

interface Subscription {
  id: string;
  priority: number;
  topic: Topic;
}

interface TopicGridProps {
  subscriptions: Subscription[];
}

const categoryColors: Record<string, string> = {
  technology: "bg-blue-100 text-blue-800",
  sports: "bg-green-100 text-green-800",
  politics: "bg-red-100 text-red-800",
  business: "bg-yellow-100 text-yellow-800",
  entertainment: "bg-purple-100 text-purple-800",
  science: "bg-teal-100 text-teal-800",
  health: "bg-pink-100 text-pink-800",
  default: "bg-gray-100 text-gray-800",
};

function getCategoryColor(category: string) {
  return categoryColors[category.toLowerCase()] || categoryColors.default;
}

export function TopicGrid({ subscriptions }: TopicGridProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleUnsubscribe = async (subscriptionId: string) => {
    setRemovingId(subscriptionId);
    try {
      const response = await fetch(`/api/topics/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });

      if (response.ok) {
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        console.error("Failed to unsubscribe");
        setRemovingId(null);
      }
    } catch (error) {
      console.error("Error unsubscribing:", error);
      setRemovingId(null);
    }
  };

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6h.008v.008H6V6z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No active topics
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Start a chat to discover topics that interest you
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {subscriptions.map((subscription) => (
        <Card key={subscription.id} className="relative">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(
                      subscription.topic.category
                    )}`}
                  >
                    {subscription.topic.category}
                  </span>
                  {subscription.priority >= 8 && (
                    <span className="text-yellow-500 text-sm">⭐</span>
                  )}
                </div>
                <CardTitle className="text-lg">
                  {subscription.topic.name}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUnsubscribe(subscription.id)}
                disabled={removingId === subscription.id}
                className="ml-2 -mr-2 -mt-2 h-8 w-8 p-0"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          {subscription.topic.description && (
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-2">
                {subscription.topic.description}
              </p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
