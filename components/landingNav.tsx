"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function LandingNav() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClientComponentClient();
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(!!data.session);
    });
    // Optional: Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Hide on md+ if signed in, show always on mobile, show always if not signed in
  const navClass = [
    "sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
    signedIn ? "md:hidden" : ""
  ].join(" ");

  return (
    <nav className={navClass}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">
            PortofolioSiswa
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <div className="hidden sm:flex">
            <Link 
              href="/sign-in" 
              className="px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}