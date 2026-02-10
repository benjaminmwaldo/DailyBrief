import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { UserMenu } from "@/components/ui/user-menu";
import {
  HomeIcon,
  ChatBubbleLeftIcon,
  TagIcon,
  EnvelopeIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Chat", href: "/chat", icon: ChatBubbleLeftIcon },
  { name: "Topics", href: "/dashboard/topics", icon: TagIcon },
  { name: "Briefs", href: "/dashboard/briefs", icon: EnvelopeIcon },
  { name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-white">
        {/* Sidebar Header */}
        <div className="flex items-center h-16 px-6 border-b">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            DailyBrief
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Menu */}
        <div className="border-t p-4">
          <UserMenu />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            DailyBrief
          </Link>
          <UserMenu />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden border-t bg-white">
          <nav className="flex justify-around px-2 py-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center px-3 py-2 text-xs font-medium text-gray-700 hover:text-gray-900"
              >
                <item.icon className="w-6 h-6 mb-1" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
