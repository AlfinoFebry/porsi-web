"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, UserCheck } from "lucide-react";
import Link from "next/link";

interface Profile {
  id: string;
  name: string | null;
  user_type: string | null;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isDataComplete, setIsDataComplete] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Check if user has completed their profile
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("id, name, user_type")
          .eq("id", user.id)
          .single();

        if (
          error ||
          !profileData ||
          !profileData.name ||
          !profileData.user_type
        ) {
          setIsDataComplete(false);
        } else {
          setProfile(profileData);
          setIsDataComplete(true);
        }
      } catch (error) {
        console.error("Error checking user data:", error);
        setIsDataComplete(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        {/* <p className="text-muted-foreground mt-2">
          Welcome to your student portfolio dashboard.
        </p> */}
      </div>

      {/* Data Completion Notification */}
      {!isDataComplete && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <AlertCircle className="w-5 h-5" />
              Data Belum Lengkap
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-orange-700 dark:text-orange-300">
              Anda belum melengkapi data pribadi dan akademik. Lengkapi data
              Anda untuk mendapatkan pengalaman portofolio yang maksimal.
            </p>
            <Link href="/dashboard/inisialisasi-data">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                <UserCheck className="w-4 h-4 mr-2" />
                Lengkapi Data Sekarang
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Welcome Message for Complete Data */}
      {isDataComplete && profile && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <UserCheck className="w-5 h-5" />
              Selamat Datang, {profile.name}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 dark:text-green-300">
              Data Anda sudah lengkap. Anda dapat mulai mengelola portofolio
              akademik Anda.
            </p>
          </CardContent>
        </Card>
      )}

      {/* <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Lihat dan kelola portofolio akademik Anda
            </p>
            <Link href="/dashboard/portfolio">
              <Button variant="outline" className="w-full">
                Lihat Portfolio
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tambah Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Tambahkan nilai, prestasi, atau data organisasi
            </p>
            <Link href="/dashboard/insert-data">
              <Button variant="outline" className="w-full">
                Tambah Data
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pengaturan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Kelola pengaturan akun dan profil Anda
            </p>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full">
                Pengaturan
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}
