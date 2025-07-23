"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState, useEffect, useRef } from "react";
import {
    Home,
    Settings,
    Users,
    LogOut,
    Menu,
    User,
    ChevronDown,
} from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import { AdminErrorBoundary } from "./admin-error-boundary";
import { cn } from "@/lib/utils";
import { useUser } from "./user-provider";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface AdminNavItem {
    href: string;
    label: string;
    icon: ReactNode;
}

export function AdminNav() {
    const pathname = usePathname();
    const { user, profile } = useUser();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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

    const adminNavItems: AdminNavItem[] = [
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

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/sign-in");
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const toggleUserDropdown = () => {
        setIsUserDropdownOpen(!isUserDropdownOpen);
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                <div className="h-16 w-16 border-4 border-t-primary rounded-full animate-spin"></div>
                <p className="mt-6 text-white/90 text-lg font-medium">Please wait...</p>
            </div>
        );
    }

    return (
        <AdminErrorBoundary>
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
                        PortofolioSiswa Admin
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
                                    {profile?.nama || user?.email?.split("@")[0]}
                                </div>
                                <ChevronDown className="h-4 w-4" />
                            </div>
                        </button>

                        {isUserDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 py-1 bg-background border rounded-md shadow-lg z-30">
                                <div className="px-4 py-2 text-xs text-muted-foreground border-b">
                                    {user?.email}
                                    <div className="text-xs text-primary mt-1">Admin</div>
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
                    {adminNavItems.map((item) => (
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
                                        {profile?.nama || user?.email?.split("@")[0]}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate max-w-[140px]">
                                        {user?.email}
                                    </div>
                                    <div className="text-xs text-primary">Admin</div>
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
                    {adminNavItems.map((item) => (
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
        </AdminErrorBoundary>
    );
}