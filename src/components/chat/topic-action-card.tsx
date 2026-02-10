"use client";

import { CheckCircleIcon } from "@heroicons/react/24/solid";

interface TopicActionCardProps {
  action: "subscribed" | "unsubscribed";
  topicName: string;
}

export function TopicActionCard({ action, topicName }: TopicActionCardProps) {
  return (
    <div className="my-2 flex items-start space-x-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
      <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
      <div>
        <p className="font-medium text-green-900 dark:text-green-100">
          {action === "subscribed" ? "Subscribed!" : "Unsubscribed"}
        </p>
        <p className="text-sm text-green-700 dark:text-green-300">
          {action === "subscribed"
            ? `You'll now receive updates about ${topicName} in your daily brief.`
            : `You'll no longer receive updates about ${topicName}.`}
        </p>
      </div>
    </div>
  );
}
