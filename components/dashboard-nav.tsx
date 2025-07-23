"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState, useEffect, useRef } from "react";
import {
  BarChart3,
  FilePlus,
  Home,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  UserCog,
  Users,
} from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import { cn } from "@/lib/utils";
import { useUser } from "./user-provider";
import { createRobustClient, robustAuth, robustDb } from "@/utils/supabase/robust-client";
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
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [userType, setUserType] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get collapse state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }

    // Set a small timeout to prevent flash
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Save collapse state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("sidebarStateChange"));
  }, [isCollapsed]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check if the user's profile data is complete to decide whether to show the
  // "Inisialisasi Data" tab. A profile is considered complete when both
  // `name` and `user_type` are filled.
  useEffect(() => {
    const checkProfileCompletion = async () => {
      try {
        const { data: { user }, error: userError } = await robustAuth.getUser();

        if (userError || !user) {
          setIsProfileComplete(false);
          setUserType(null);
          return;
        }

        const profileResult = await robustDb.safeQuery(
          async (client) => {
            return await client
              .from("profil")
              .select("name:nama, user_type:tipe_user")
              .eq("id", user.id)
              .single();
          },
          null,
          'checkProfileCompletion'
        );

        if (
          !profileResult ||
          profileResult.error ||
          !profileResult.data ||
          !profileResult.data.name ||
          !profileResult.data.user_type
        ) {
          setIsProfileComplete(false);
          setUserType(profileResult?.data?.user_type || null);
        } else {
          setIsProfileComplete(true);
          setUserType(profileResult.data.user_type);
        }
      } catch (err) {
        console.error("Error checking profile completeness:", err);
        setIsProfileComplete(false);
        setUserType(null);
      } finally {
        setProfileLoading(false);
      }
    };

    checkProfileCompletion();
  }, []);

  // Define navigation items based on user type
  const getNavItems = (): NavItem[] => {
    if (userType === 'admin') {
      // Admin navigation items
      return [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: <Home className="h-5 w-5" />,
        },
        {
          href: "/dashboard/data-siswa",
          label: "Data Siswa",
          icon: <Users className="h-5 w-5" />,
        },
        {
          href: "/dashboard/settings",
          label: "Settings",
          icon: <Settings className="h-5 w-5" />,
        },
      ];
    }

    // Student/Alumni navigation items (default)
    return [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: <Home className="h-5 w-5" />,
      },
      {
        href: "/dashboard/portfolio",
        label: "Portfolio",
        icon: <BarChart3 className="h-5 w-5" />,
      },
      {
        href: "/dashboard/inisialisasi-data",
        label: "Inisialisasi Data",
        icon: <UserCog className="h-5 w-5" />,
      },
      {
        href: "/dashboard/insert-data",
        label: "Insert Data",
        icon: <FilePlus className="h-5 w-5" />,
      },
      {
        href: "/dashboard/settings",
        label: "Settings",
        icon: <Settings className="h-5 w-5" />,
      },
    ];
  };

  const navItems = getNavItems();

  // Filter out the "Inisialisasi Data" tab if the profile is complete (only for non-admin users)
  const filteredNavItems = userType === 'admin'
    ? navItems
    : isProfileComplete === true
      ? navItems.filter((item) => item.href !== "/dashboard/inisialisasi-data")
      : navItems;

  const handleSignOut = async () => {
    await robustAuth.signOut();
    router.push("/sign-in");
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  if (isLoading || profileLoading) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <div className="h-16 w-16 border-4 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-6 text-white/90 text-lg font-medium">Please wait...</p>
      </div>
    );
  }

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
            {userType === 'admin' ? 'PortofolioSiswa Admin' : 'PortofolioSiswa'}
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-4 px-4">
          <ThemeSwitcher />
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleUserDropdown}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1">
                <div className="text-sm font-medium">
                  {user?.email?.split("@")[0]}
                </div>
                <ChevronDown className="h-4 w-4" />
              </div>
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 py-1 bg-background border rounded-md shadow-lg z-30">
                <div className="px-4 py-2 text-xs text-muted-foreground border-b">
                  {user?.email}
                </div>
                <div className="pt-2">
                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-2 text-sm hover:bg-accent"
                  >
                    Account Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex h-screen flex-col fixed top-16 left-0 border-r bg-background z-10 transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex-1 py-6 px-2 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => (
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
                  <div className="text-sm font-medium">
                    {user?.email?.split("@")[0]}
                  </div>
                  <div className="text-xs text-muted-foreground truncate max-w-[140px]">
                    {user?.email}
                  </div>
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
          {filteredNavItems.map((item) => (
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
