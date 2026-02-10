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
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Total Briefs",
      value: totalBriefs,
      icon: EnvelopeIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "Next Delivery",
      value: nextDelivery,
      icon: ClockIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
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
                <p className="text-sm font-medium text-gray-600">
                  {stat.name}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
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
