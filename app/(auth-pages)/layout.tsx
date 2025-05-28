"use client";

import { usePathname } from "next/navigation";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRegisterPage = pathname === "/register";

  if (isRegisterPage) {
    // For register page, don't add any wrapper - let the page handle its own layout
    return <>{children}</>;
  }

  // For other auth pages, use the centered layout
  return (
    <div className="min-h-[calc(100vh-16rem)] w-full flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
