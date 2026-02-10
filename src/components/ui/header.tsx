import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "./button";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          DailyBrief
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#features" className="text-sm hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-sm hover:text-primary transition-colors">
            How It Works
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {session ? (
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-in">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
