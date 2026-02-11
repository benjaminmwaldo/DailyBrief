import { Card, CardContent } from "@/components/ui/card";
import {
  TagIcon,
  EnvelopeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface StatsCardsProps {
  activeTopics: number;
  totalBriefs: number;
  nextDelivery: string;
}

export function StatsCards({
  activeTopics,
  totalBriefs,
  nextDelivery,
}: StatsCardsProps) {
  const stats = [
    {
      name: "Active Topics",
      value: activeTopics,
      icon: TagIcon,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      name: "Total Briefs",
      value: totalBriefs,
      icon: EnvelopeIcon,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      name: "Next Delivery",
      value: nextDelivery,
      icon: ClockIcon,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.name}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
