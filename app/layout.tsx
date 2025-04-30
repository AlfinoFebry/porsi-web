import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import LandingNav from "@/components/landingNav";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "PortofolioSiswa - Student Academic Records",
  description: "A platform to store and manage student academic records",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <LandingNav />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t py-12 md:py-16">
              <div className="container grid gap-8 md:grid-cols-2">
                <div>
                  <Link href="/" className="font-bold text-xl">
                    PortofolioSiswa
                  </Link>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md">
                    A modern platform for tracking and managing student academic records.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-8 md:grid-cols-3 md:gap-12">
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Platform</div>
                    <ul className="space-y-2">
                      <li>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                      </li>
                      <li>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Legal</div>
                    <ul className="space-y-2">
                      <li>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
                      </li>
                      <li>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
