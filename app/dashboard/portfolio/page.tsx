"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const programStudi = {
  "Ekonomi & Bisnis": [
    "Administrasi Bisnis",
    "Agribisnis",
    "Akuntansi",
    "Akuntansi Manajemen",
    "Akuntansi Perpajakan",
    "Ekonomi Pembangunan",
    "Keuangan",
    "Manajemen",
    "Manajemen Agribisnis",
    "Manajemen Informatika",
    "Manajemen Pemasaran",
    "Perpajakan",
    "Sistem Informasi Bisnis",
    "Statistika Bisnis",
  ],
  "Sosial & Humaniora": [
    "Administrasi Negara",
    "Hubungan Internasional",
    "HUKUM EKONOMI SYARIAH ( MUAMALAH)",
    "Ilmu Hukum",
    "Ilmu Kesejahteraan Sosial",
    "Ilmu Komunikasi",
    "Ilmu Perpustakaan dan Ilmu Informasi",
    "Ilmu Politik",
    "Ilmu Sejarah",
    "Kesejahteraan Sosial",
    "Pengelolaan Arsip dan Rekaman Informasi",
    "Psikologi",
    "Sosiologi",
  ],
  Pendidikan: [
    "Administrasi Pendidikan",
    "Bimbingan Konseling",
    "PG Paud",
    "PGSD",
    "Pendidikan Agama Islam",
    "Pendidikan Akuntansi",
    "Pendidikan Administrasi Perkantoran",
    "Pendidikan Bahasa dan Sastra Indonesia",
    "Pendidikan Bahasa Daerah",
    "Pendidikan Bahasa Inggris",
    "Pendidikan Biologi",
    "Pendidikan Ekonomi",
    "Pendidikan Fisika",
    "Pendidikan Geografi",
    "Pendidikan IPA",
    "Pendidikan IPS",
    "Pendidikan Jasmani dan Olahraga",
    "Pendidikan Jasmani Kesehatan dan Rekreasi",
    "Pendidikan Keagamaan Budha",
    "Pendidikan Kepelatihan Olahraga",
    "Pendidikan Kimia",
    "Pendidikan Luar Sekolah",
    "Pendidikan Matematika",
    "Pendidikan Pancasila dan Kewarganegaraan",
    "Pendidikan Sejarah",
    "Pendidikan Seni Tari dan Musik",
    "Pendidikan Sosiologi",
    "Pendidikan Tata Busana",
    "Pendidikan Tata Niaga",
    "Pendidikan Teknik Informatika",
    "Pendidikan Teknologi Informasi",
    "Teknologi Pendidikan",
  ],
  "Agro-kompleks": [
    "Agroekoteknologi",
    "Agroteknologi",
    "Akuakultur",
    "Budidaya Perairan",
    "Kehutanan",
    "Manajemen Sumber Daya Perairan",
    "Peternakan",
  ],
  "Teknologi & Rekayasa": [
    "Arsitektur",
    "Manajemen Rekayasa Konstruksi",
    "Teknologi Bioproses",
    "Teknologi Kimia Industri",
    "Teknologi Pertambangan",
    "Teknologi Rekayasa Pembangkit Energi",
    "Teknik Elektromedik",
    "Teknik Elektro",
    "Teknik Geofisika",
    "Teknik Industri",
    "Teknik Informatika",
    "Teknik Jaringan Komunikasi Digital",
    "Teknik Kimia Industri",
    "Teknik Komputer",
    "Teknik Listrik",
    "Teknik Mesin",
    "Teknik Perkapalan",
    "Teknik Pertambangan",
    "Teknik Sipil",
    "Teknik Telekomunikasi",
    "Teknik Fisika",
  ],
  "Vokasi Terapan & Administrasi": [
    "Bahasa Inggris Untuk Industri Pariwisata",
    "Bahasa Inggris Untuk Komunikasi dan Bisnis",
    "Manajemen Perhotelan",
    "Pengelolaan Perhotelan",
    "Tata Boga",
    "Usaha Perjalanan Wisata",
  ],
  "Sains & Matematika": [
    "Biologi",
    "Fisika",
    "Geografi",
    "Kimia",
    "Matematika",
  ],
  "Seni & Desain": [
    "Desain Grafis",
    "Desain Komunikasi Visual",
    "Fotografi",
    "Seni Rupa Murni",
  ],
  Kesehatan: [
    "Farmasi",
    "Ilmu Keolahragaan",
    "Ilmu Keperawatan",
    "Kebidanan",
    "Keperawatan",
    "Lab Medis",
    "Manajemen Informasi Kesehatan",
    "Pendidikan Dokter",
    "Pendidikan Dokter Hewan",
    "Rekam Medis",
    "Rekam Medis dan Informasi Kesehatan",
  ],
};

interface UserProfile {
  id: string;
  name: string;
  email: string;
  user_type: "siswa" | "alumni";
  gender: "male" | "female";
  date_of_birth: string;
  hobby?: string;
  desired_major?: string;
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

interface Achievement {
  id: string;
  title: string;
  image_url: string | null;
  created_at: string;
}

interface Organization {
  id: string;
  name: string;
  year: string | null;
  position: string | null;
  created_at: string;
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
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [recLoading, setRecLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("profil")
        .select(
          "id, name:nama, email, user_type:tipe_user, gender:jenis_kelamin, date_of_birth:tanggal_lahir, hobby:hobi, desired_major:jurusan_impian, nama_sekolah, jurusan, class:kelas, nama_perguruan_tinggi, tahun_lulus_sma, tahun_masuk_kuliah, jurusan_kuliah"
        )
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        throw new Error("Could not fetch user profile");
      }

      if (!profile) {
        throw new Error(
          "Profile not found. Please complete registration first."
        );
      }

      setUserData(profile);

      // Fetch academic records
      const { data: records, error: recordsError } = await supabase
        .from("data_akademik")
        .select("id, subject:mapel, semester, score:nilai, school_year:tahun")
        .eq("user_id", user.id)
        .order("semester", { ascending: true })
        .order("mapel", { ascending: true });

      if (recordsError) {
        console.error("Academic records error:", recordsError);
        // Don't throw error for academic records, just log it
        setAcademicRecords([]);
      } else {
        setAcademicRecords(records || []);
      }

      // Fetch recent achievements (latest 5)
      const { data: ach, error: achError } = await supabase
        .from("sertifikat")
        .select("id, title:judul, image_url, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!achError) {
        setAchievements(ach || []);
      }

      // Fetch recent organizations (latest 5)
      const { data: orgs, error: orgError } = await supabase
        .from("organisasi")
        .select("id, name:nama, year:tahun, position:posisi, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!orgError) {
        setOrganizations(orgs || []);
      }

      /* ──────────────────────── fetch stored recommendation ─────────────────────── */
      const { data: recRow, error: recError } = await supabase
        .from("rekomendasi")
        .select("prediction")
        .eq("user_id", user.id)
        .single();

      if (recError && recError.code !== "PGRST116") {
        // PGRST116 is "not found"
        console.error("Recommendation fetch error:", recError);
      } else {
        setRecommendation(recRow?.prediction ?? null);
      }
      /* ────────────────────────────────────────────────────────────────────────── */
    } catch (error: any) {
      console.error("Fetch error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAverageScore = () => {
    if (academicRecords.length === 0) return 0;
    const total = academicRecords.reduce(
      (sum, record) => sum + record.score,
      0
    );
    return Math.round(total / academicRecords.length);
  };

  const groupRecordsBySemester = () => {
    const grouped = academicRecords.reduce(
      (acc, record) => {
        const semester = record.semester;
        if (!acc[semester]) {
          acc[semester] = [];
        }
        acc[semester].push(record);
        return acc;
      },
      {} as Record<number, AcademicRecord[]>
    );

    // Sort semesters
    return Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b)
      .map((semester) => ({
        semester,
        records: grouped[semester].sort((a, b) =>
          a.subject.localeCompare(b.subject)
        ),
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
        subtitle: `Kelas ${className} ${major} - ${school}`,
      };
    } else {
      const university = userData.nama_perguruan_tinggi || "Unknown University";
      const major = userData.jurusan_kuliah || "Unknown Major";
      return {
        name,
        subtitle: `${major} - ${university}`,
      };
    }
  };

  /* ─────────────────────── helper to build CART payload ─────────────────────── */
  const buildCartPayload = () => {
    // List of subjects CART expects
    const subjects = [
      "Pendidikan_Agama",
      "Pkn",
      "Bahasa_Indonesia",
      "Matematika_Wajib",
      "Sejarah_Indonesia",
      "Bahasa_Inggris",
      "Seni_Budaya",
      "Penjaskes",
      "PKWu",
      "Mulok",
      "Matematika_Peminatan",
      "Biologi",
      "Fisika",
      "Kimia",
      "Lintas_Minat",
      "Geografi",
      "Sejarah_Minat",
      "Sosiologi",
      "Ekonomi",
    ];

    // Average score for every subject found
    const avg: Record<string, number> = {};
    subjects.forEach((s) => {
      const records = academicRecords.filter(
        (r) => r.subject.replaceAll(" ", "_") === s
      );
      if (records.length) {
        avg[s] = Math.round(
          records.reduce((t, r) => t + r.score, 0) / records.length
        );
      }
    });

    // Fill missing subjects with -1
    subjects.forEach((s) => {
      if (avg[s] === undefined) avg[s] = -1;
    });

    // Apply jurusan rules
    if (userData?.jurusan === "IPA") {
      avg["Geografi"] =
        avg["Sejarah_Minat"] =
        avg["Sposiologi"] =
        avg["Ekonomi"] =
          -1;
    } else if (userData?.jurusan === "IPS") {
      avg["Matematika_Peminatan"] =
        avg["Fisika"] =
        avg["Biologi"] =
        avg["Kimia"] =
          -1;
    }

    return {
      JK: userData?.gender === "male" ? "L" : "P",
      Jurusan_SMA: userData?.jurusan ?? "-",
      ...avg,
      Hobi: userData?.hobby ?? "-",
    };
  };
  /* ───────────────────────────────────────────────────────────────────────────── */

  /* ─────────────────────── check if desired major matches recommendation ─────────────────────── */
  const checkDesiredMajorMatch = (
    recommendation: string,
    desiredMajor: string
  ) => {
    // Check if the recommendation key exists in programStudi
    if (!programStudi[recommendation as keyof typeof programStudi]) {
      return false;
    }

    // Get the array of majors for the recommendation category
    const majorsInCategory =
      programStudi[recommendation as keyof typeof programStudi];

    // Check if the desired major exists in the recommendation category
    return majorsInCategory.includes(desiredMajor);
  };
  /* ───────────────────────────────────────────────────────────────────────────── */

  /* ───────────── get / refresh recommendation handlers ───────────── */
  const getRecommendation = async () => {
    try {
      setRecLoading(true);
      const payload = buildCartPayload();

      console.log("Sending payload:", payload); // Debug log

      const res = await fetch("https://api2.porsi.me/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      console.log("API Response:", data); // Debug log

      if (!data.prediction) {
        throw new Error("No prediction received from API");
      }

      // Persist to DB with better error handling
      const { error: dbError } = await supabase.from("rekomendasi").upsert({
        user_id: userData!.id,
        prediction: data.prediction,
        updated_at: new Date().toISOString(),
      });

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      setRecommendation(data.prediction);
      toast.success("Rekomendasi berhasil dibuat");
    } catch (e: any) {
      console.error("Recommendation error:", e);
      toast.error(e.message ?? "Terjadi kesalahan");
    } finally {
      setRecLoading(false);
    }
  };

  const refreshRecommendation = () => {
    if (
      window.confirm("Ambil ulang rekomendasi? Hasil lama akan di-overwrite")
    ) {
      getRecommendation();
    }
  };
  /* ───────────────────────────────────────────────────────────────── */

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
            <h3 className="font-medium text-red-900 dark:text-red-100">
              Error Loading Portfolio
            </h3>
            <p className="text-sm text-red-700 dark:text-red-200 mt-1">
              {error}
            </p>
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
          <p className="text-muted-foreground">
            Please complete your registration first.
          </p>
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
        <h1 className="text-3xl font-bold tracking-tight">
          Portfolio Akademik
        </h1>
        <p className="text-muted-foreground mt-2">
          Lihat dan kelola catatan akademik Anda.
        </p>
      </div>

      {/* Overview + Recommendation side-by-side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* ───────── Overview Card ───────── */}
        <div className="space-y-6 flex flex-col h-full">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Overview</h2>
          </div>
          <div className="space-y-4 border rounded-lg p-6 md:flex md:items-center md:gap-8 flex-1">
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
                  <span className="text-xs text-muted-foreground">
                    Rata-rata
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p className="font-medium">{displayInfo.name}</p>
              <p className="text-sm text-muted-foreground">
                {displayInfo.subtitle}
              </p>
              <p className="text-xs text-muted-foreground capitalize mt-1">
                {userData.user_type === "siswa" ? "Siswa SMA" : "Alumni"}
              </p>
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
                    ? userData.jurusan || "-"
                    : userData.jurusan_kuliah || "-"}
                </span>
              </div>
              {userData.user_type === "siswa" && userData.class && (
                <div className="text-sm flex justify-between">
                  <span>Kelas</span>
                  <span className="font-medium">{userData.class}</span>
                </div>
              )}
            </div>

            {/* Hobby & Desired Major */}
            {/* {(userData.hobby || userData.desired_major) && (
              <div className="pt-2 space-y-2">
                {userData.hobby && (
                  <div className="text-sm flex justify-between">
                    <span>Hobi</span>
                    <span className="font-medium">{userData.hobby}</span>
                  </div>
                )}
                {userData.desired_major && (
                  <div className="text-sm flex justify-between">
                    <span>Target Jurusan</span>
                    <span className="font-medium">{userData.desired_major}</span>
                  </div>
                )}
              </div>
            )} */}
          </div>
        </div>

        {/* ───────── NEW  Recommendation Card ───────── */}
        <div className="space-y-6 flex flex-col h-full">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Rekomendasi</h2>
          </div>

          <div className="border rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-4 flex-1">
            {recLoading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Memproses rekomendasi…
                </p>
              </>
            ) : recommendation ? (
              <>
                <p className="text-3xl font-bold">{recommendation}</p>
                {userData?.desired_major && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Minat Anda di{" "}
                      <span className="font-medium">
                        {userData.desired_major}
                      </span>
                    </p>
                    {checkDesiredMajorMatch(
                      recommendation,
                      userData.desired_major
                    ) && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Desired major sesuai dengan rumpun ilmu rekomendasi
                      </p>
                    )}
                  </>
                )}
                <button
                  onClick={refreshRecommendation}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
                >
                  Refresh Rekomendasi
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Belum ada rekomendasi untuk Anda.
                </p>
                <button
                  onClick={getRecommendation}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
                >
                  Dapatkan Rekomendasi
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Academic Records Section */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Catatan Akademik</h2>
          <p className="text-muted-foreground text-sm">
            Tahun Ajaran {schoolYear}
          </p>
        </div>

        {academicRecords.length === 0 ? (
          <div className="border rounded-lg p-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Belum ada catatan akademik.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Catatan akan muncul setelah Anda menyelesaikan registrasi.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {groupRecordsBySemester().map(({ semester, records }) => {
              const semesterAvg = calculateSemesterAverage(records);
              return (
                <div key={semester} className="border rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Semester {semester}</h3>
                    <div className="text-sm text-muted-foreground">
                      Rata-rata:{" "}
                      <span className="font-medium text-foreground">
                        {semesterAvg}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium text-sm">
                            Mata Pelajaran
                          </th>
                          <th className="text-center py-3 px-2 font-medium text-sm">
                            Nilai
                          </th>
                          <th className="text-center py-3 px-2 font-medium text-sm">
                            Grade
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((record) => (
                          <tr
                            key={record.id}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="py-3 px-2">{record.subject}</td>
                            <td className="py-3 px-2 text-center font-medium">
                              {record.score}
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  getGradeFromScore(record.score) === "A"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                    : getGradeFromScore(
                                          record.score
                                        ).startsWith("B")
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                }`}
                              >
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

      {/* Achievements & Organizations Section */}
      {(achievements.length > 0 || organizations.length > 0) && (
        <div className="md:col-span-3 space-y-8">
          {achievements.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                Prestasi/Sertifikat
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((ach) => (
                  <div key={ach.id} className="border rounded-lg p-4 space-y-2">
                    {ach.image_url ? (
                      <img
                        src={ach.image_url}
                        alt={ach.title}
                        className="w-full h-32 object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center bg-muted rounded">
                        <span className="text-sm text-muted-foreground">
                          No Image
                        </span>
                      </div>
                    )}
                    <p
                      className="font-medium text-sm truncate"
                      title={ach.title}
                    >
                      {ach.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ach.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {organizations.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Organisasi</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {organizations.map((org) => (
                  <div key={org.id} className="border rounded-lg p-4 space-y-1">
                    <p className="font-medium text-sm">{org.name}</p>
                    {org.position && (
                      <p className="text-xs text-muted-foreground">
                        Posisi: {org.position}
                      </p>
                    )}
                    {org.year && (
                      <p className="text-xs text-muted-foreground">
                        Tahun: {org.year}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
