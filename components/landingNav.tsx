"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function LandingNav() {
  const [signedIn, setSignedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClientComponentClient();

    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(!!data.session);
      setAuthChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSignedIn(!!session);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Hide navigation on dashboard pages and auth pages
  const isDashboardPage = pathname?.startsWith('/dashboard');
  const isAuthPage = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up') || pathname?.startsWith('/register') || pathname?.startsWith('/admin-register');

  if (!authChecked) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <div className="h-16 w-16 border-4 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-6 text-white/90 text-lg font-medium">Please wait...</p>
      </div>
    );
  }

  // Don't render navigation on dashboard pages or auth pages
  if (isDashboardPage || isAuthPage) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">
            Porsi
          </Link>
          <div className="hidden md:flex gap-6">
            <Link
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          {!signedIn && (
            <div className="hidden sm:flex gap-2">
              <Link
                href="/sign-in"
                className="px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
