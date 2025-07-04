"use client";

import { AuthStep } from "@/components/registration/auth-step";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const handleAuthSuccess = () => {
    // Redirect to dashboard after successful authentication
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] w-full flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-black/70 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl font-bold">
              Registrasi PortofolioSiswa
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Buat akun baru untuk memulai
            </p>
          </CardHeader>
          
          <CardContent>
            <AuthStep onSuccess={handleAuthSuccess} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 