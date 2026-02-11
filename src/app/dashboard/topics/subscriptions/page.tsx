"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

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

const categoryColors: Record<string, string> = {
  technology: "bg-blue-100 text-blue-800",
  sports: "bg-green-100 text-green-800",
  politics: "bg-red-100 text-red-800",
  business: "bg-yellow-100 text-yellow-800",
  entertainment: "bg-purple-100 text-purple-800",
  science: "bg-teal-100 text-teal-800",
  health: "bg-pink-100 text-pink-800",
  world: "bg-indigo-100 text-indigo-800",
  default: "bg-gray-100 text-gray-800",
};

function getCategoryColor(category: string) {
  return categoryColors[category.toLowerCase()] || categoryColors.default;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/subscriptions");
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.data);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleUnsubscribe = async (topicId: string) => {
    setRemovingId(topicId);
    try {
      const response = await fetch(`/api/topics/${topicId}/subscribe`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchSubscriptions();
      } else {
        console.error("Failed to unsubscribe");
      }
    } catch (error) {
      console.error("Error unsubscribing:", error);
    } finally {
      setRemovingId(null);
    }
  };

  const handleBulkUnsubscribe = async () => {
    if (selectedIds.size === 0) return;

    const confirmMessage = `Are you sure you want to unsubscribe from ${selectedIds.size} topic(s)?`;
    if (!confirm(confirmMessage)) return;

    setIsLoading(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((topicId) =>
          fetch(`/api/topics/${topicId}/subscribe`, {
            method: "DELETE",
          })
        )
      );
      setSelectedIds(new Set());
      await fetchSubscriptions();
    } catch (error) {
      console.error("Error bulk unsubscribing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriorityChange = async (
    topicId: string,
    newPriority: number
  ) => {
    try {
      await fetch(`/api/topics/${topicId}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });
      await fetchSubscriptions();
    } catch (error) {
      console.error("Error updating priority:", error);
    }
  };

  const toggleSelection = (topicId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(topicId)) {
      newSelected.delete(topicId);
    } else {
      newSelected.add(topicId);
    }
    setSelectedIds(newSelected);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Subscriptions
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your subscribed topics and priorities
            </p>
          </div>
          <div className="flex gap-2">
            {selectedIds.size > 0 && (
              <Button
                variant="outline"
                onClick={handleBulkUnsubscribe}
                disabled={isLoading}
              >
                Unsubscribe Selected ({selectedIds.size})
              </Button>
            )}
            <Link href="/dashboard/topics">
              <Button variant="outline">Browse Topics</Button>
            </Link>
          </div>
        </div>
      </div>

      {subscriptions.length === 0 ? (
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
              No active subscriptions
            </h3>
            <p className="mt-2 text-sm text-gray-600 mb-4">
              Browse topics to find what interests you, or chat with AI for
              personalized recommendations
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/dashboard/topics">
                <Button>Browse Topics</Button>
              </Link>
              <Link href="/dashboard/chat">
                <Button variant="outline">Chat with AI</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(subscription.topic.id)}
                    onChange={() => toggleSelection(subscription.topic.id)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          {subscription.topic.name}
                        </h3>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleUnsubscribe(subscription.topic.id)
                        }
                        disabled={removingId === subscription.topic.id}
                        className="h-8 w-8 p-0"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    {subscription.topic.description && (
                      <p className="text-sm text-gray-600 mb-4">
                        {subscription.topic.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4">
                      <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
                        Priority: {subscription.priority}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={subscription.priority}
                        onChange={(e) =>
                          handlePriorityChange(
                            subscription.topic.id,
                            Number(e.target.value)
                          )
                        }
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-xs text-gray-500 gap-8">
                        <span>Low</span>
                        <span>High</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
