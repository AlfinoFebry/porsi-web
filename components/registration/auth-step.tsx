"use client";

import { useState } from "react";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

interface AuthStepProps {
  onSuccess: () => void;
}

export function AuthStep({ onSuccess }: AuthStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const supabase = createClient();

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const email = formData.get("email")?.toString();
      const password = formData.get("password")?.toString();

      if (!email || !password) {
        setMessage({ error: "Email dan password wajib diisi" });
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect_to=/register`,
        },
      });

      if (error) {
        setMessage({ error: error.message });
      } else {
        // Check if user is immediately signed in (email confirmation disabled)
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          onSuccess();
        } else {
          setMessage({
            success:
              "Silakan periksa email Anda untuk mengkonfirmasi pendaftaran.",
          });
        }
      }
    } catch (error: any) {
      setMessage({ error: "Terjadi kesalahan saat mendaftar" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/register`,
        },
      });

      if (error) {
        setMessage({ error: error.message });
      }
    } catch (error: any) {
      setMessage({ error: "Terjadi kesalahan saat login dengan Google" });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is already authenticated
  useState(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        onSuccess();
      }
    };
    checkAuth();
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold">Buat Akun Baru</h2>
        <p className="text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link
            className="text-primary font-medium hover:underline"
            href="/sign-in"
          >
            Masuk di sini
          </Link>
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            name="email"
            type="email"
            placeholder="nama@email.com"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Masukkan password"
            minLength={6}
            required
            disabled={isLoading}
          />
        </div>

        <SubmitButton
          className="w-full"
          pendingText="Mendaftar..."
          disabled={isLoading}
        >
          Daftar
        </SubmitButton>

        {message && <FormMessage message={message} />}
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted-foreground/20"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Atau</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-muted-foreground/20 rounded-md hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:pointer-events-none"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285f4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34a853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#fbbc05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#ea4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Daftar dengan Google
      </button>
    </div>
  );
}
