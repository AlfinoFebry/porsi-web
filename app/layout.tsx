import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";
import "./globals.css";
import LandingNav from "@/components/landingNav";
import { ToastContainer } from "@/components/ui/toast";
import SiteFooter from "@/components/site-footer";
import { CookieCleanup } from "@/components/cookie-cleanup";

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
          <CookieCleanup />
          <div className="min-h-screen flex flex-col">
            <LandingNav />
            <main className="flex-1">
              {children}
            </main>
            <ToastContainer />
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
