import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Your morning briefing,{" "}
                <span className="text-primary">personalized by AI</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Wake up to a beautifully crafted email digest tailored to your interests.
                No noise, just the news and insights you care about.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg">
                  <Link href="/sign-in">Get Started — It&apos;s Free</Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link href="#how-it-works">Learn More</Link>
                </Button>
              </div>
            </div>

            {/* Visual Element - Email Mockup */}
            <div className="hidden md:block">
              <div className="bg-white rounded-lg shadow-2xl border p-6 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    DB
                  </div>
                  <div>
                    <p className="font-semibold">Your Daily Brief</p>
                    <p className="text-sm text-muted-foreground">Today&apos;s top stories</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-100 rounded w-full"></div>
                    <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                  </div>

                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-2 bg-gray-100 rounded w-full"></div>
                    <div className="h-2 bg-gray-100 rounded w-4/5"></div>
                  </div>

                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-3/5"></div>
                    <div className="h-2 bg-gray-100 rounded w-full"></div>
                    <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting your personalized daily brief is simple. Just three steps to stay informed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <CardTitle>Sign in with your email</CardTitle>
                <CardDescription>
                  No password needed. We&apos;ll send you a magic link to get started.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <CardTitle>Tell our AI what you care about</CardTitle>
                <CardDescription>
                  Chat with our AI to select topics that interest you, or choose from popular categories.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <CardTitle>Get your brief every morning</CardTitle>
                <CardDescription>
                  Wake up to a beautiful email digest with the stories and insights you care about.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for busy people who want to stay informed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              DailyBrief combines AI personalization with beautiful design to deliver
              exactly what you need to know.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>🤖 AI-Powered Personalization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI learns what matters to you and curates content that matches
                  your interests perfectly. No more scrolling through irrelevant news.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>✨ Beautiful Email Digests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every brief is carefully designed for readability. Clean layouts,
                  clear summaries, and easy-to-scan formatting.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🌍 Global Events Included</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Important global events, holidays, and breaking news are automatically
                  included so you never miss what matters.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>⏰ Customizable Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Choose when you want to receive your brief. Perfect timing for your
                  morning routine or commute.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Trusted by professionals worldwide
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Join thousands of busy professionals who start their day with DailyBrief
          </p>

          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            <div className="text-2xl font-bold">Forbes</div>
            <div className="text-2xl font-bold">TechCrunch</div>
            <div className="text-2xl font-bold">Wired</div>
            <div className="text-2xl font-bold">The Verge</div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to transform your mornings?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Start receiving personalized daily briefs tailored to your interests.
            No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white text-foreground"
            />
            <Button asChild size="lg" variant="outline" className="bg-white text-primary hover:bg-gray-100 sm:whitespace-nowrap">
              <Link href="/sign-in">Get Started</Link>
            </Button>
          </div>

          <p className="text-sm mt-4 opacity-75">
            Free forever. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  );
}
