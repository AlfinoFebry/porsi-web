"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  user_type: "siswa" | "alumni";
  gender: "male" | "female";
  date_of_birth: string;
  // Student fields
  nama_sekolah?: string;
  jurusan?: "IPA" | "IPS";
  class?: string;
  // Alumni fields
  nama_perguruan_tinggi?: string;
  tahun_lulus_sma?: string;
  tahun_masuk_kuliah?: string;
  jurusan_kuliah?: string;
}

interface AcademicRecord {
  id: string;
  subject: string;
  semester: number;
  score: number;
  school_year?: string;
}

function getGradeFromScore(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B+";
  if (score >= 70) return "B";
  if (score >= 60) return "C+";
  if (score >= 50) return "C";
  return "D";
}

export default function PortfolioPage() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw authError;
      }

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error("Could not fetch user profile");
      }

      if (!profile) {
        throw new Error("Profile not found. Please complete registration first.");
      }

      setUserData(profile);

      // Fetch academic records
      const { data: records, error: recordsError } = await supabase
        .from('academic_records')
        .select('*')
        .eq('user_id', user.id)
        .order('semester', { ascending: true })
        .order('subject', { ascending: true });

      if (recordsError) {
        console.error('Academic records error:', recordsError);
        // Don't throw error for academic records, just log it
        setAcademicRecords([]);
      } else {
        setAcademicRecords(records || []);
      }

    } catch (error: any) {
      console.error('Fetch error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAverageScore = () => {
    if (academicRecords.length === 0) return 0;
    const total = academicRecords.reduce((sum, record) => sum + record.score, 0);
    return Math.round(total / academicRecords.length);
  };

  const groupRecordsBySemester = () => {
    const grouped = academicRecords.reduce((acc, record) => {
      const semester = record.semester;
      if (!acc[semester]) {
        acc[semester] = [];
      }
      acc[semester].push(record);
      return acc;
    }, {} as Record<number, AcademicRecord[]>);
    
    // Sort semesters
    return Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b)
      .map(semester => ({
        semester,
        records: grouped[semester].sort((a, b) => a.subject.localeCompare(b.subject))
      }));
  };

  const calculateSemesterAverage = (records: AcademicRecord[]) => {
    if (records.length === 0) return 0;
    const total = records.reduce((sum, record) => sum + record.score, 0);
    return Math.round(total / records.length);
  };

  const getDisplayText = () => {
    if (!userData) return { name: "", subtitle: "" };
    
    const name = userData.name || "Unknown User";
    
    if (userData.user_type === "siswa") {
      const school = userData.nama_sekolah || "Unknown School";
      const className = userData.class || "Unknown";
      const major = userData.jurusan || "";
      return {
        name,
        subtitle: `Kelas ${className} ${major} - ${school}`
      };
    } else {
      const university = userData.nama_perguruan_tinggi || "Unknown University";
      const major = userData.jurusan_kuliah || "Unknown Major";
      return {
        name,
        subtitle: `${major} - ${university}`
      };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <h3 className="font-medium text-red-900 dark:text-red-100">Error Loading Portfolio</h3>
            <p className="text-sm text-red-700 dark:text-red-200 mt-1">{error}</p>
            <button 
              onClick={fetchUserData}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium">No Profile Found</h3>
          <p className="text-muted-foreground">Please complete your registration first.</p>
          <a 
            href="/register" 
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Complete Registration
          </a>
        </div>
      </div>
    );
  }

  const avgScore = calculateAverageScore();
  const displayInfo = getDisplayText();
  const currentYear = new Date().getFullYear();
  const schoolYear = `${currentYear}/${currentYear + 1}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Portfolio Akademik</h1>
        <p className="text-muted-foreground mt-2">
          Lihat dan kelola catatan akademik Anda.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="md:col-span-1">
          <div className="border rounded-lg p-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Profil Siswa</h2>
              <p className="text-muted-foreground text-sm">Informasi akademik Anda</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="font-medium">{displayInfo.name}</p>
                <p className="text-sm text-muted-foreground">{displayInfo.subtitle}</p>
                <p className="text-xs text-muted-foreground capitalize mt-1">
                  {userData.user_type === "siswa" ? "Siswa SMA" : "Alumni"}
                </p>
              </div>
              
              {/* Circle diagram for average score */}
              <div className="flex justify-center pt-4">
                <div className="relative h-48 w-48 flex items-center justify-center">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="10" 
                      strokeOpacity="0.1" 
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="10" 
                      className="text-blue-500"
                      strokeDasharray={`${avgScore * 2.51} 251`} 
                      strokeDashoffset="62.75" 
                      transform="rotate(-90 50 50)" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{avgScore}</span>
                    <span className="text-xs text-muted-foreground">Rata-rata</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <div className="text-sm flex justify-between">
                  <span>Total Mata Pelajaran</span>
                  <span className="font-medium">{academicRecords.length}</span>
                </div>
                <div className="text-sm flex justify-between">
                  <span>Jurusan</span>
                  <span className="font-medium">
                    {userData.user_type === "siswa" 
                      ? (userData.jurusan || "-") 
                      : (userData.jurusan_kuliah || "-")
                    }
                  </span>
                </div>
                {userData.user_type === "siswa" && userData.class && (
                  <div className="text-sm flex justify-between">
                    <span>Kelas</span>
                    <span className="font-medium">{userData.class}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Academic Records Section */}
        <div className="md:col-span-2">
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Catatan Akademik</h2>
              <p className="text-muted-foreground text-sm">Tahun Ajaran {schoolYear}</p>
            </div>
            
            {academicRecords.length === 0 ? (
              <div className="border rounded-lg p-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Belum ada catatan akademik.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Catatan akan muncul setelah Anda menyelesaikan registrasi.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {groupRecordsBySemester().map(({ semester, records }) => {
                  const semesterAvg = calculateSemesterAverage(records);
                  return (
                    <div key={semester} className="border rounded-lg p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Semester {semester}</h3>
                        <div className="text-sm text-muted-foreground">
                          Rata-rata: <span className="font-medium text-foreground">{semesterAvg}</span>
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-2 font-medium text-sm">Mata Pelajaran</th>
                              <th className="text-center py-3 px-2 font-medium text-sm">Nilai</th>
                              <th className="text-center py-3 px-2 font-medium text-sm">Grade</th>
                            </tr>
                          </thead>
                          <tbody>
                            {records.map((record) => (
                              <tr key={record.id} className="border-b hover:bg-muted/50">
                                <td className="py-3 px-2">{record.subject}</td>
                                <td className="py-3 px-2 text-center font-medium">{record.score}</td>
                                <td className="py-3 px-2 text-center">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    getGradeFromScore(record.score) === 'A' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                      : getGradeFromScore(record.score).startsWith('B') 
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                  }`}>
                                    {getGradeFromScore(record.score)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 