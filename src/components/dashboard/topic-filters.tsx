"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface TopicFiltersProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showSubscribedOnly: boolean;
  onShowSubscribedOnlyChange: (show: boolean) => void;
}

const categories = [
  { id: null, name: "All" },
  { id: "technology", name: "Technology" },
  { id: "business", name: "Business" },
  { id: "science", name: "Science" },
  { id: "politics", name: "Politics" },
  { id: "sports", name: "Sports" },
  { id: "entertainment", name: "Entertainment" },
  { id: "health", name: "Health" },
  { id: "world", name: "World" },
];

export function TopicFilters({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  showSubscribedOnly,
  onShowSubscribedOnlyChange,
}: TopicFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search topics..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id || "all"}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className="rounded-full"
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Show Subscribed Only Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="show-subscribed"
          checked={showSubscribedOnly}
          onChange={(e) => onShowSubscribedOnlyChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label
          htmlFor="show-subscribed"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          Show subscribed only
        </label>
      </div>
    </div>
  );
}
