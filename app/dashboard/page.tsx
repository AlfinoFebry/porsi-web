"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  UserCheck,
  Users,
  Settings,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/components/user-provider";

interface Profile {
  id: string;
  name: string | null;
  user_type: string | null;
}

interface AdminStats {
  totalStudents: number;
  totalRecords: number;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isDataComplete, setIsDataComplete] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
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
          .from("profil")
          .select("id, name:nama, user_type:tipe_user, nama_sekolah")
          .eq("id", user.id)
          .single();

        if (
          error ||
          !profileData ||
          !profileData.name ||
          !profileData.user_type
        ) {
          setIsDataComplete(false);
          setUserType(profileData?.user_type || null);
        } else {
          setProfile(profileData);
          setUserProfile(profileData);
          setUserType(profileData.user_type);
          setIsDataComplete(true);
        }

        // If user is admin, fetch admin statistics
        if (profileData?.user_type === "admin") {
          //await fetchAdminStats();
        }
      } catch (error) {
        console.error("Error checking user data:", error);
        setIsDataComplete(false);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAdminStats = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // First, get the admin's school name
        const { data: adminProfile, error: adminError } = await supabase
          .from("profil")
          .select("nama_sekolah")
          .eq("id", user.id)
          .single();

        if (adminError || !adminProfile?.nama_sekolah) {
          console.error("Error fetching admin profile for stats:", adminError);
          return;
        }

        const adminSchool = adminProfile.nama_sekolah;

        // Get total students count from the same school (case-insensitive)
        const { count: studentsCount } = await supabase
          .from("profil")
          .select("*", { count: "exact", head: true })
          .eq("tipe_user", "siswa")
          .ilike("nama_sekolah", adminSchool);

        // Get student IDs from the same school for academic records count
        const { data: schoolStudents } = await supabase
          .from("profil")
          .select("id")
          .eq("tipe_user", "siswa")
          .ilike("nama_sekolah", adminSchool);

        let recordsCount = 0;
        if (schoolStudents && schoolStudents.length > 0) {
          const studentIds = schoolStudents.map((s) => s.id);
          const { count } = await supabase
            .from("data_akademik")
            .select("*", { count: "exact", head: true })
            .in("user_id", studentIds);
          recordsCount = count || 0;
        }

        setAdminStats({
          totalStudents: studentsCount || 0,
          totalRecords: recordsCount,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
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

  // Render admin dashboard
  if (userType === "admin") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Kelola data siswa dan sistem PortofolioSiswa
          </p>
        </div>

        {/* Admin Welcome Message */}
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <UserCheck className="w-5 h-5" />
              Selamat Datang, {userProfile?.nama || "Admin"}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 dark:text-blue-300">
              Sekolah: {userProfile?.nama_sekolah || "Tidak diketahui"}
            </p>
          </CardContent>
        </Card>

        {/* Admin Statistics */}
        {/* <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5" />
                Total Siswa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {adminStats?.totalStudents || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Siswa terdaftar dalam sistem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5" />
                Total Nilai
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {adminStats?.totalRecords || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Record nilai akademik tersimpan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="w-5 h-5" />
                Sistem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                Aktif
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Status sistem PortofolioSiswa
              </p>
            </CardContent>
          </Card>
        </div> */}

        {/* Admin Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kelola Data Siswa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Lihat dan edit data siswa serta nilai akademik mereka
              </p>
              <Link href="/dashboard/data-siswa">
                <Button className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Buka Data Siswa
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pengaturan Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Kelola pengaturan akun admin dan sistem
              </p>
              <Link href="/dashboard/settings">
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Pengaturan
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render student dashboard (existing functionality)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your student portfolio dashboard.
        </p>
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
    </div>
  );
}
