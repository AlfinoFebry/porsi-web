"use client";

import { DashboardNav } from "@/components/dashboard-nav";
import { AuthGuard } from "@/components/auth-guard";
import { UserProvider } from "@/components/user-provider";
import { AdminProfileHandler } from "@/components/admin-profile-handler";
import { useSidebarState } from "@/hooks/use-sidebar-state";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <UserProvider>
        <AdminProfileHandler />
        <DashboardNav />
        <ResponsiveLayout>
          {children}
        </ResponsiveLayout>
      </UserProvider>
    </AuthGuard>
  );
}

// Separate client component to use the hook
function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const isCollapsed = useSidebarState();

  return (
    <div className="md:pt-16">
      <main className={`min-h-screen pt-4 pb-20 md:pb-4 px-4 md:px-8 max-w-7xl mx-auto transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {children}
      </main>
    </div>
  );
} 