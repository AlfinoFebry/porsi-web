"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteFooter() {
  const pathname = usePathname();
  // Hide footer on dashboard (and nested) pages
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="border-t py-12 md:py-16">
      <div className="container grid gap-8 md:grid-cols-2">
        <div>
          <Link href="/" className="font-bold text-xl">
            PortofolioSiswa
          </Link>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Platform modern untuk menyimpan data akademik siswa.
          </p>
        </div>
        {/* <div className="grid grid-cols-2 gap-8 md:grid-cols-3 md:gap-12">
          <div className="space-y-3">
            <div className="text-sm font-medium">Platform</div>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <div className="text-sm font-medium">Legal</div>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div> */}
      </div>
    </footer>
  );
}
