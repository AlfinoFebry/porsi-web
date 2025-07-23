"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { AchievementItem } from "@/components/registration/achievement-step";
import { OrganizationItem } from "@/components/registration/organization-step";
import { ReportStep } from "@/components/registration/report-step";
import { ReportData, BiodataForm, UserType } from "@/lib/types";

export default function InsertDataPage() {
  const supabase = createClient();

  // category selection
  const [category, setCategory] = useState<"academic" | "achievement" | "organization">("academic");
  const [academicMode, setAcademicMode] = useState<"bulk" | "single">("bulk");

  // profile data for academic bulk input
  const [profile, setProfile] = useState<BiodataForm | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [nextSemester, setNextSemester] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");
        const { data: profileRow, error: profileError } = await supabase
          .from("profil")
          .select("id, name:nama, date_of_birth:tanggal_lahir, gender:jenis_kelamin, user_type:tipe_user, nama_sekolah, jurusan, class:kelas, nama_perguruan_tinggi, tahun_lulus_sma, tahun_masuk_kuliah, jurusan_kuliah")
          .eq("id", user.id)
          .single();
        if (profileError) throw profileError;
        if (!profileRow) throw new Error("Profile not found");
        setProfile({
          name: profileRow.name,
          dateOfBirth: profileRow.date_of_birth,
          gender: profileRow.gender,
          namaSekolah: profileRow.nama_sekolah,
          jurusan: profileRow.jurusan,
          class: profileRow.class,
          namaPerguruanTinggi: profileRow.nama_perguruan_tinggi,
          tahunLulusSMA: profileRow.tahun_lulus_sma,
          tahunMasukKuliah: profileRow.tahun_masuk_kuliah,
          jurusanKuliah: profileRow.jurusan_kuliah,
        });
        setUserType(profileRow.user_type as UserType);

        // determine next semester
        const { data: semRows, error: semErr } = await supabase
          .from("data_akademik")
          .select("semester")
          .eq("user_id", user.id)
          .order("semester", { ascending: false })
          .limit(1);
        if (!semErr) {
          const currentMax = semRows && semRows.length ? semRows[0].semester : 0;
          setNextSemester(Math.min(6, currentMax + 1));
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  // individual academic form state
  const [subject, setSubject] = useState("");
  const [score, setScore] = useState("");
  const [semester, setSemester] = useState<string>("");

  const handleSingleAcademicSubmit = async () => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const scoreNum = parseFloat(score);
      if (!subject || isNaN(scoreNum) || !semester) {
        setMessage("Lengkapi data dengan benar");
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: insertError } = await supabase.from("data_akademik").insert({
        user_id: user.id,
        mapel: subject,
        semester: parseInt(semester),
        nilai: scoreNum,
        tahun: new Date().getFullYear() + "/" + (new Date().getFullYear() + 1),
      });
      if (insertError) {
        if (insertError.message.includes("duplicate key value")) {
          setMessage("Nilai untuk mata pelajaran & semester ini sudah ada.");
        } else {
          throw insertError;
        }
      } else {
        setMessage("Data nilai berhasil ditambahkan");
        setSubject("");
        setScore("");
      }
    } catch (e: any) {
      setMessage(e.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  // achievement form
  const [achievement, setAchievement] = useState<AchievementItem>({ title: "", file: null });
  const handleAchievementSubmit = async () => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Validate required fields
      if (!achievement.title.trim()) {
        setMessage("Nama prestasi/sertifikat harus diisi");
        return;
      }

      let imageUrl: string | null = null;
      if (achievement.file) {
        // Fix the file path - remove duplicate "certifications"
        const filePath = `${user.id}/${Date.now()}_${achievement.file.name}`;

        console.log('Uploading file to path:', filePath);

        const { data: uploadData, error: upError } = await supabase.storage
          .from("certifications")
          .upload(filePath, achievement.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (upError) {
          console.error('Upload error:', upError);
          if (upError.message.includes("already exists")) {
            setMessage("File dengan nama yang sama sudah ada. Coba ganti nama file.");
          } else if (upError.message.includes("Bucket not found") || upError.message.includes("bucket does not exist")) {
            setMessage("Error: Storage bucket 'certifications' belum dibuat. Silakan buat bucket di Supabase Dashboard terlebih dahulu.");
          } else if (upError.message.includes("row-level security policy") || upError.message.includes("Unauthorized")) {
            setMessage("Error: Tidak memiliki izin upload. Silakan periksa RLS policies untuk storage bucket 'certifications'.");
          } else {
            throw upError;
          }
          return;
        }

        const { data: publicData } = supabase.storage
          .from("certifications")
          .getPublicUrl(filePath);
        imageUrl = publicData.publicUrl;
      }

      const { error: achError } = await supabase.from("sertifikat").insert({
        user_id: user.id,
        judul: achievement.title,
        image_url: imageUrl,
      });

      if (achError) {
        console.error('Database insert error:', achError);
        throw achError;
      }

      setAchievement({ title: "", file: null });
      setMessage("Prestasi berhasil disimpan");
    } catch (e: any) {
      console.error('Achievement submit error:', e);
      setMessage(e.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  // organization form
  const [org, setOrg] = useState<OrganizationItem>({ name: "", year: "", position: "" });
  const handleOrgSubmit = async () => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error: orgError } = await supabase.from("organisasi").insert({
        user_id: user.id,
        nama: org.name,
        tahun: org.year,
        posisi: org.position,
      });
      if (orgError) throw orgError;
      setOrg({ name: "", year: "", position: "" });
      setMessage("Data organisasi ditambahkan");
    } catch (e: any) {
      setMessage(e.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  // JSX for forms
  const renderAcademicForm = () => {
    if (academicMode === "bulk") {
      if (loadingProfile) return <p>Memuat data...</p>;
      if (error) return <p className="text-red-500">{error}</p>;
      if (!profile || !userType) return null;
      return (
        nextSemester ? (
          <ReportStep
            userType={userType}
            biodataForm={profile}
            allowedSemesters={[nextSemester]}
            onSubmit={(data: ReportData) => {
              // Use existing reportStep insertion logic: just call API directly similar to registration
              handleBulkInsert(data);
            }}
            onBack={() => { }}
            isLoading={isSubmitting}
          />
        ) : <p>Memuat semester...</p>
      );
    }
    return (
      <div className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label>Nama Mata Pelajaran</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Matematika" />
        </div>
        <div className="space-y-2">
          <Label>Nilai</Label>
          <Input type="number" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Semester</Label>
          <Select value={semester} onValueChange={(v) => setSemester(v)}>
            <SelectTrigger><SelectValue placeholder="Pilih Semester" /></SelectTrigger>
            <SelectContent>
              {Array.from({ length: 6 }, (_, i) => i + 1).map((s) => (
                <SelectItem key={s} value={`${s}`}>Semester {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
        <Button onClick={handleSingleAcademicSubmit} disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tambah Nilai"}
        </Button>
      </div>
    );
  };

  const handleBulkInsert = async (data: ReportData) => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const rows: any[] = [];
      for (const [subject, scores] of Object.entries(data as ReportData)) {
        for (const [sem, score] of Object.entries(scores)) {
          if (score !== undefined && score !== null) {
            rows.push({
              user_id: user.id,
              mapel: subject,
              semester: parseInt(sem.replace("semester", "")),
              nilai: score,
              tahun: new Date().getFullYear() + "/" + (new Date().getFullYear() + 1),
            });
          }
        }
      }
      if (rows.length) {
        const { error: insertErr } = await supabase.from("data_akademik").insert(rows);
        if (insertErr) {
          if (insertErr.message.includes("duplicate key value")) {
            setMessage("Beberapa nilai sudah ada, input dibatalkan.");
          } else throw insertErr;
        } else {
          setMessage("Nilai berhasil ditambahkan");
        }
      }
    } catch (e: any) {
      setMessage(e.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAchievementForm = () => (
    <div className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label>Nama Prestasi/Sertifikat</Label>
        <Input value={achievement.title} onChange={(e) => setAchievement({ ...achievement, title: e.target.value })} placeholder="Juara 1 ..." />
      </div>
      <div className="space-y-2">
        <Label>File Gambar (Opsional)</Label>
        <p className="text-xs text-muted-foreground">Format: JPG, PNG, WEBP. Maksimal 10MB.</p>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            if (file) {
              // Validate file type
              if (!file.type.startsWith("image/")) {
                setMessage("File harus berupa gambar (JPG, PNG, dll).");
                return;
              }

              // Validate file size (10MB limit)
              if (file.size > 10 * 1024 * 1024) {
                setMessage("Ukuran file maksimal 10MB. Silakan kompres gambar terlebih dahulu.");
                return;
              }
            }
            setAchievement({ ...achievement, file });
          }}
        />
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      <Button onClick={handleAchievementSubmit} disabled={isSubmitting} className="w-full">
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tambah Prestasi"}
      </Button>
    </div>
  );

  const renderOrgForm = () => (
    <div className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label>Nama Organisasi</Label>
        <Input value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} placeholder="OSIS" />
      </div>
      <div className="space-y-2">
        <Label>Tahun</Label>
        <Input value={org.year} onChange={(e) => setOrg({ ...org, year: e.target.value })} placeholder="2023" />
      </div>
      <div className="space-y-2">
        <Label>Posisi</Label>
        <Input value={org.position} onChange={(e) => setOrg({ ...org, position: e.target.value })} placeholder="Ketua" />
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      <Button onClick={handleOrgSubmit} disabled={isSubmitting} className="w-full">
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tambah Organisasi"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tambah Data</h1>
        <p className="text-muted-foreground mt-2">Pilih jenis data yang ingin ditambahkan ke portofolio Anda.</p>
      </div>

      {/* Category selection */}
      <div className="flex space-x-2">
        <Button variant={category === "academic" ? "default" : "outline"} onClick={() => setCategory("academic")}>Nilai Akademik</Button>
        <Button variant={category === "achievement" ? "default" : "outline"} onClick={() => setCategory("achievement")}>Prestasi</Button>
        <Button variant={category === "organization" ? "default" : "outline"} onClick={() => setCategory("organization")}>Organisasi</Button>
      </div>

      {/* Academic mode switch */}
      {category === "academic" && (
        <div className="flex space-x-2">
          <Button variant={academicMode === "bulk" ? "default" : "outline"} onClick={() => setAcademicMode("bulk")}>Input Semester Baru</Button>
          <Button variant={academicMode === "single" ? "default" : "outline"} onClick={() => setAcademicMode("single")}>Input Per Mapel</Button>
        </div>
      )}

      {/* Render form */}
      {category === "academic" && renderAcademicForm()}
      {category === "achievement" && renderAchievementForm()}
      {category === "organization" && renderOrgForm()}
    </div>
  );
} 