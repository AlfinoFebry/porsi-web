"use client";

import { useState, useEffect } from "react";
import { PasswordGate } from "@/components/password-gate";
import { AdminAuthStep } from "@/components/registration/admin-auth-step";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";

const ADMIN_PASSWORD = "RegisterAdminPortofolioSiswa123";

export default function AdminRegisterPage() {
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    // User is already authenticated, redirect directly to dashboard
                    window.location.href = '/dashboard';
                    return;
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
            } finally {
                setIsCheckingAuth(false);
            }
        };

        checkAuthStatus();
    }, [supabase]);

    const handlePasswordSuccess = () => {
        setIsPasswordVerified(true);
    };

    const handleAuthSuccess = () => {
        // Redirect directly to dashboard after successful authentication
        window.location.href = '/dashboard';
    };

    // Show loading while checking authentication status
    if (isCheckingAuth) {
        return (
            <div className="min-h-[calc(100vh-16rem)] w-full flex flex-col items-center justify-center px-4 py-12">
                <div className="text-center">
                    <p className="text-muted-foreground">Memeriksa status autentikasi...</p>
                </div>
            </div>
        );
    }

    // Show password gate first
    if (!isPasswordVerified) {
        return (
            <PasswordGate
                onSuccess={handlePasswordSuccess}
                correctPassword={ADMIN_PASSWORD}
            />
        );
    }

    // Show admin registration form after password verification
    return (
        <div className="min-h-[calc(100vh-16rem)] w-full flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <Card className="shadow-xl border-0 bg-white/80 dark:bg-black/70 backdrop-blur-sm">
                    <CardHeader className="text-center space-y-4">
                        <CardTitle className="text-2xl font-bold">
                            Registrasi Admin
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Buat akun admin untuk mengelola data siswa
                        </p>
                    </CardHeader>

                    <CardContent>
                        <AdminAuthStep
                            onSuccess={handleAuthSuccess}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}