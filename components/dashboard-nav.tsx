"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import { 
  BarChart3, 
  FilePlus, 
  Home, 
  Settings, 
  User,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import { cn } from "@/lib/utils";
import { useUser } from "./user-provider";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

export function DashboardNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get collapse state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);
  
  // Save collapse state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('sidebarStateChange'));
  }, [isCollapsed]);
  
  const navItems: NavItem[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <Home className="h-5 w-5" />
    },
    {
      href: "/dashboard/portfolio",
      label: "Portfolio",
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      href: "/dashboard/insert-data",
      label: "Insert Data",
      icon: <FilePlus className="h-5 w-5" />
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />
    },
  ];

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/sign-in');
  };
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex h-16 border-b fixed top-0 left-0 right-0 z-20 bg-background">
        <div className="flex items-center px-4">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-accent"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="ml-4 font-bold text-xl">
            PortofolioSiswa
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-4 px-4">
          <ThemeSwitcher />
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-medium">{user?.email?.split('@')[0]}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex h-screen flex-col fixed top-16 left-0 border-r bg-background z-10 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex-1 py-6 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isCollapsed ? "justify-center" : "",
                pathname === item.href 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              {item.icon}
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>
        <div className="p-4 border-t">
          {!isCollapsed && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <div className="text-sm font-medium">{user?.email?.split('@')[0]}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[140px]">{user?.email}</div>
                </div>
              </div>
            </div>
          )}
          <button 
            onClick={handleSignOut}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors",
              isCollapsed ? "justify-center w-full" : "w-full"
            )}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-10">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 flex-1 text-xs",
                pathname === item.href 
                  ? "text-primary font-medium" 
                  : "text-muted-foreground"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
} 