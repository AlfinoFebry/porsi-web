"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "./user-provider";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";

interface AdminGuardProps {
    children: React.ReactNode;
    fallbackPath?: string;
}

export function AdminGuard({ children, fallbackPath = "/dashboard" }: AdminGuardProps) {
    const { user, userType, isLoading, isProfileLoading } = useUser();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Wait for user and profile data to load
        if (isLoading || isProfileLoading) {
            return;
        }

        // If no user is authenticated, redirect to login
        if (!user) {
            router.push("/sign-in");
            return;
        }

        // If user type is not admin, redirect to fallback path
        if (userType && userType !== "admin") {
            router.push(fallbackPath);
            return;
        }

        // If user type is still null (profile not loaded), wait a bit more
        if (userType === null) {
            const timer = setTimeout(() => {
                // If still no user type after timeout, redirect
                if (userType === null) {
                    router.push(fallbackPath);
                }
            }, 2000);

            return () => clearTimeout(timer);
        }

        // All checks passed
        setIsChecking(false);
    }, [user, userType, isLoading, isProfileLoading, router, fallbackPath]);

    // Show loading while checking authentication and authorization
    if (isLoading || isProfileLoading || isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Verifying Access</h3>
                        <p className="text-muted-foreground text-center">
                            Checking admin permissions...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show error if user is not authenticated
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
                        <p className="text-muted-foreground text-center">
                            You need to be logged in to access this page.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show error if user is not admin
    if (userType !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
                        <p className="text-muted-foreground text-center">
                            You don't have admin permissions to access this page.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // User is authenticated and authorized, render children
    return <>{children}</>;
}