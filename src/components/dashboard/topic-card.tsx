"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@heroicons/react/24/solid";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Topic {
  id: string;
  name: string;
  description: string | null;
  category: string;
  isSubscribed: boolean;
  subscription: {
    id: string;
    priority: number;
  } | null;
}

interface TopicCardProps {
  topic: Topic;
  onSubscriptionChange?: () => void;
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

export function TopicCard({ topic, onSubscriptionChange }: TopicCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [priority, setPriority] = useState(topic.subscription?.priority || 5);

  const handleToggleSubscribe = async () => {
    setIsLoading(true);
    try {
      if (topic.isSubscribed) {
        // Unsubscribe
        const response = await fetch(`/api/topics/${topic.id}/subscribe`, {
          method: "DELETE",
        });

        if (response.ok) {
          onSubscriptionChange?.();
        } else {
          console.error("Failed to unsubscribe");
        }
      } else {
        // Subscribe
        const response = await fetch(`/api/topics/${topic.id}/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority }),
        });

        if (response.ok) {
          onSubscriptionChange?.();
        } else {
          console.error("Failed to subscribe");
        }
      }
    } catch (error) {
      console.error("Error toggling subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriorityChange = async (newPriority: number) => {
    setPriority(newPriority);

    if (topic.isSubscribed) {
      try {
        await fetch(`/api/topics/${topic.id}/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority: newPriority }),
        });
        onSubscriptionChange?.();
      } catch (error) {
        console.error("Error updating priority:", error);
      }
    }
  };

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        topic.isSubscribed && "ring-2 ring-primary"
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(
                  topic.category
                )}`}
              >
                {topic.category}
              </span>
              {topic.isSubscribed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                  <CheckIcon className="h-3 w-3" />
                  Subscribed
                </span>
              )}
            </div>
            <CardTitle className="text-lg">{topic.name}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {topic.description || "No description available"}
        </p>

        {topic.isSubscribed && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Priority: {priority}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={priority}
              onChange={(e) => handlePriorityChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        )}

        <Button
          onClick={handleToggleSubscribe}
          disabled={isLoading}
          variant={topic.isSubscribed ? "outline" : "default"}
          className="w-full"
          size="sm"
        >
          {isLoading ? (
            "Loading..."
          ) : topic.isSubscribed ? (
            <>
              <CheckIcon className="h-4 w-4 mr-2" />
              Subscribed
            </>
          ) : (
            <>
              <PlusIcon className="h-4 w-4 mr-2" />
              Subscribe
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
