import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 text-center">
        <section className="container max-w-2xl space-y-8">
          <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-4xl font-bold text-transparent dark:from-gray-100 dark:to-gray-400 sm:text-5xl">
            Start building your next big idea
          </h1>

          <p className="text-lg text-muted-foreground sm:text-xl">
            This template is your foundation for creating something amazing.
            Clean, modern, and ready for your innovation.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button variant="default" asChild>
              <Link
                href="https://github.com/juanmaramos/nextjs-supabase-template"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-4">
              <p className="font-mono">
                Get started by editing{" "}
                <code className="rounded bg-muted px-1 py-0.5">
                  src/app/page.tsx
                </code>
              </p>
            </CardContent>
          </Card>

          <footer className="mt-8 text-sm text-muted-foreground">
            <Link
              href="https://www.juanmaramos.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors duration-200"
            >
              Made by Juan Ramos
            </Link>
          </footer>
        </section>
      </main>
    </>
  );
}
