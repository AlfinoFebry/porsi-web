"use client";

import { useState, useEffect } from "react";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AdminAuthStepProps {
  onSuccess: () => void;
}

export function AdminAuthStep({ onSuccess }: AdminAuthStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const email = formData.get("email")?.toString();
      const password = formData.get("password")?.toString();
      const namaSekolah = formData.get("namaSekolah")?.toString();

      if (!email || !password || !namaSekolah) {
        setMessage({ error: "Semua field wajib diisi" });
        return;
      }

      // Step 1: Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: "admin",
            school_name: namaSekolah,
          },
        },
      });

      if (authError) {
        setMessage({ error: authError.message });
        return;
      }

      if (!authData.user) {
        setMessage({ error: "Gagal membuat akun" });
        return;
      }

      // Step 2: Check if email confirmation is required
      const needsEmailConfirmation = authData.user.confirmed_at === null;

      if (needsEmailConfirmation) {
        // Store admin info for later profile creation
        localStorage.setItem(
          "pending_admin_profile",
          JSON.stringify({
            userId: authData.user.id,
            email: email,
            namaSekolah: namaSekolah,
          })
        );

        setMessage({
          success:
            "Silakan periksa email Anda untuk mengkonfirmasi pendaftaran. Setelah konfirmasi, profil admin akan dibuat otomatis.",
        });
        return;
      }

      // Step 3: If no email confirmation needed, sign in and create profile
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setMessage({
          error: "Gagal masuk setelah pendaftaran: " + signInError.message,
        });
        return;
      }

      // Step 4: Create admin profile
      await createAdminProfile(authData.user.id, email, namaSekolah);

      // Step 5: Redirect to admin dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Admin registration error:", error);
      setMessage({ error: "Terjadi kesalahan saat mendaftar" });
    } finally {
      setIsLoading(false);
    }
  };

  const createAdminProfile = async (
    userId: string,
    email: string,
    namaSekolah: string
  ) => {
    try {
      // Wait a bit to ensure the user session is established
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const profileData = {
        id: userId,
        nama: email.split("@")[0], // Use email username as name
        email: email,
        nama_sekolah: namaSekolah,
        tipe_user: "admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("Creating admin profile with data:", profileData);

      const { error: profileError } = await supabase
        .from("profil")
        .upsert(profileData, {
          onConflict: "id",
        });

      if (profileError) {
        console.error("Error creating admin profile:", {
          error: profileError,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code,
          profileData: profileData,
        });
        throw profileError;
      }

      console.log("Admin profile created successfully");

      // Clear any pending profile data
      localStorage.removeItem("pending_admin_profile");
    } catch (error) {
      console.error("Error in createAdminProfile:", error);
      throw error;
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      // For Google OAuth, we'll need to handle profile creation in the callback
      // We'll store the school name in localStorage temporarily
      const namaSekolah = document.querySelector<HTMLInputElement>(
        'input[name="namaSekolahGoogle"]'
      )?.value;

      if (!namaSekolah) {
        setMessage({
          error: "Nama sekolah wajib diisi untuk registrasi dengan Google",
        });
        setIsLoading(false);
        return;
      }

      // Store admin registration info for use after OAuth callback
      localStorage.setItem(
        "admin_registration_data",
        JSON.stringify({
          namaSekolah: namaSekolah,
          isAdmin: true,
          timestamp: new Date().toISOString(),
        })
      );

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect_to=/dashboard&admin=true`,
        },
      });

      if (error) {
        setMessage({ error: error.message });
        localStorage.removeItem("admin_registration_data");
      }
    } catch (error: any) {
      setMessage({ error: "Terjadi kesalahan saat login dengan Google" });
      localStorage.removeItem("admin_registration_data");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Check if this is from OAuth callback and we need to create profile
        const adminRegData = localStorage.getItem("admin_registration_data");
        const pendingProfile = localStorage.getItem("pending_admin_profile");

        if (adminRegData) {
          try {
            const regData = JSON.parse(adminRegData);
            // Check if profile already exists
            const { data: existingProfile } = await supabase
              .from("profil")
              .select("id, tipe_user")
              .eq("id", user.id)
              .single();

            if (!existingProfile || existingProfile.tipe_user !== "admin") {
              await createAdminProfile(
                user.id,
                user.email || "",
                regData.namaSekolah
              );
            }

            localStorage.removeItem("admin_registration_data");
            // Redirect to dashboard
            router.push("/dashboard");
          } catch (error) {
            console.error("Error creating profile after OAuth:", error);
            setMessage({ error: "Gagal membuat profil admin" });
          }
        } else if (pendingProfile) {
          // Handle pending profile from email confirmation
          try {
            const profileData = JSON.parse(pendingProfile);
            if (profileData.userId === user.id) {
              await createAdminProfile(
                profileData.userId,
                profileData.email,
                profileData.namaSekolah
              );
              router.push("/dashboard");
            }
          } catch (error) {
            console.error("Error creating pending profile:", error);
            setMessage({ error: "Gagal membuat profil admin" });
          }
        } else {
          // User is already logged in, redirect to dashboard
          router.push("/dashboard");
        }
      }
    };
    checkAuth();
  }, [supabase, router]);

  return (
    <div className="space-y-6">
      {/* <div className="space-y-2 text-center">
                <h2 className="text-xl font-semibold">Buat Akun Admin</h2>
                <p className="text-sm text-muted-foreground">
                    Sudah punya akun?{" "}
                    <Link
                        className="text-primary font-medium hover:underline"
                        href="/sign-in"
                    >
                        Masuk di sini
                    </Link>
                </p>
            </div> */}

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

        <div className="space-y-2">
          <Label htmlFor="namaSekolah">Nama Sekolah</Label>
          <Input
            name="namaSekolah"
            type="text"
            placeholder="Masukkan nama sekolah"
            required
            disabled={isLoading}
          />
        </div>

        <SubmitButton
          className="w-full"
          pendingText="Mendaftar..."
          disabled={isLoading}
        >
          Daftar sebagai Admin
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

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="namaSekolahGoogle">Nama Sekolah (untuk Google)</Label>
          <Input
            name="namaSekolahGoogle"
            type="text"
            placeholder="Masukkan nama sekolah"
            required
            disabled={isLoading}
          />
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
    </div>
  );
}
