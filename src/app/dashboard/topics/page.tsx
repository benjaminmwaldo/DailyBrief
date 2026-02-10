"use client";

import { useEffect, useState, useCallback } from "react";
import { TopicCard } from "@/components/dashboard/topic-card";
import { TopicFilters } from "@/components/dashboard/topic-filters";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Topic {
  id: string;
  name: string;
  description: string | null;
  category: string;
  keywords: string[];
  isGlobal: boolean;
  isSubscribed: boolean;
  subscription: {
    id: string;
    priority: number;
  } | null;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSubscribedOnly, setShowSubscribedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTopics = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) {
        params.append("category", selectedCategory);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/topics?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTopics(data.data);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  useEffect(() => {
    // Apply client-side filtering for "show subscribed only"
    if (showSubscribedOnly) {
      setFilteredTopics(topics.filter((t) => t.isSubscribed));
    } else {
      setFilteredTopics(topics);
    }
  }, [topics, showSubscribedOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Topics</h1>
            <p className="text-gray-600 mt-1">
              Discover and subscribe to topics you care about
            </p>
          </div>
          <Link href="/dashboard/topics/subscriptions">
            <Button variant="outline">Manage Subscriptions</Button>
          </Link>
        </div>

        <TopicFilters
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showSubscribedOnly={showSubscribedOnly}
          onShowSubscribedOnlyChange={setShowSubscribedOnly}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-600">Loading topics...</p>
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="text-center py-12">
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
            No topics found
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Try adjusting your filters or search query
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTopics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onSubscriptionChange={fetchTopics}
            />
          ))}
        </div>
      )}
    </div>
  );
}
