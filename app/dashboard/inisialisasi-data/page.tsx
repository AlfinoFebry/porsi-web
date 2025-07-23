"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BiodataStep } from "@/components/registration/biodata-step";
import { ReportStep } from "@/components/registration/report-step";
import { AchievementStep, AchievementItem } from "@/components/registration/achievement-step";
import { OrganizationStep, OrganizationItem } from "@/components/registration/organization-step";
import { useToast } from "@/hooks/use-toast";
import { UserType, BiodataForm, ReportData } from "@/lib/types";

export default function InisialisasiDataPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userType] = useState<UserType>("siswa"); // Automatically set as siswa
  const [biodataForm, setBiodataForm] = useState<BiodataForm>({
    name: "",
    dateOfBirth: "",
    gender: "male",
  });
  const [reportData, setReportData] = useState<ReportData>({});
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [hobby, setHobby] = useState<string>("");
  const [desiredMajor, setDesiredMajor] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const steps = [
    { title: "Biodata", description: "Isi data pribadi" },
    { title: "Rapor", description: "Input nilai rapor" },
    { title: "Prestasi", description: "Tambah sertifikat" },
    { title: "Organisasi", description: "Minat & organisasi" },
  ];

  const handleBiodataSubmit = (data: BiodataForm) => {
    setBiodataForm(data);
    setCurrentStep(2);
  };

  const handleReportNext = (data: ReportData) => {
    setReportData(data);
    setCurrentStep(3);
  };

  const handleAchievementNext = (data: AchievementItem[]) => {
    setAchievements(data);
    setCurrentStep(4);
  };

  const handleOrganizationSubmit = async (data: { organizations: OrganizationItem[]; hobby: string; desiredMajor: string; }) => {
    setIsLoading(true);
    setOrganizations(data.organizations);
    setHobby(data.hobby);
    setDesiredMajor(data.desiredMajor);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // 1. Upsert profile with additional fields
      const profileData: any = {
        id: user.id,
        email: user.email,
        nama: biodataForm.name,
        tanggal_lahir: biodataForm.dateOfBirth,
        jenis_kelamin: biodataForm.gender,
        tipe_user: userType,
        hobi: data.hobby,
        jurusan_impian: data.desiredMajor,
        nama_sekolah: biodataForm.namaSekolah,
        jurusan: biodataForm.jurusan,
        kelas: biodataForm.class,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Profile data to upsert:', profileData);
      const { error: profileError } = await supabase.from('profil').upsert(profileData);
      if (profileError) {
        console.error('Profile upsert error:', {
          error: profileError,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code
        });
        throw profileError;
      }
      console.log('Profile upserted successfully');

      // 2. Insert academic records
      const recordEntries: any[] = [];
      for (const [subject, scores] of Object.entries(reportData)) {
        for (const [semester, score] of Object.entries(scores)) {
          if (score !== undefined && score !== null) {
            recordEntries.push({
              user_id: user.id,
              mapel: subject,
              semester: parseInt(semester.replace('semester', '')),
              nilai: parseFloat(score.toString()),
              tahun: new Date().getFullYear() + "/" + (new Date().getFullYear() + 1),
              created_at: new Date().toISOString(),
            });
          }
        }
      }

      if (recordEntries.length) {
        const { error: recordError } = await supabase.from('data_akademik').insert(recordEntries);
        if (recordError) throw recordError;
      }

      // 3. Upload achievements images (if any) and insert rows
      if (achievements.length) {
        const achievementRows: any[] = [];
        for (const ach of achievements) {
          let imageUrl: string | null = null;
          if (ach.file) {
            // Fix the file path - remove duplicate "certifications"
            const filePath = `${user.id}/${Date.now()}_${ach.file.name}`;

            console.log('Uploading achievement file to path:', filePath);

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('certifications')
              .upload(filePath, ach.file, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) {
              console.error('Achievement upload error:', uploadError);
              if (uploadError.message.includes("already exists")) {
                console.warn(`File already exists: ${filePath}, skipping upload`);
              } else if (uploadError.message.includes("Bucket not found") || uploadError.message.includes("bucket does not exist")) {
                throw new Error("Storage bucket 'certifications' belum dibuat. Silakan buat bucket di Supabase Dashboard terlebih dahulu.");
              } else if (uploadError.message.includes("row-level security policy") || uploadError.message.includes("Unauthorized")) {
                throw new Error("Tidak memiliki izin upload. Silakan periksa RLS policies untuk storage bucket 'certifications'.");
              } else {
                throw uploadError;
              }
            }

            const { data: publicUrlData } = supabase.storage
              .from('certifications')
              .getPublicUrl(filePath);
            imageUrl = publicUrlData.publicUrl;
          }
          achievementRows.push({
            user_id: user.id,
            judul: ach.title,
            image_url: imageUrl,
            created_at: new Date().toISOString(),
          });
        }
        if (achievementRows.length) {
          const { error: achError } = await supabase.from('sertifikat').insert(achievementRows);
          if (achError) {
            console.error('Achievement insert error:', achError);
            throw achError;
          }
        }
      }

      // 4. Insert organizations
      if (data.organizations.length) {
        const orgRows = data.organizations.map(org => ({
          user_id: user.id,
          nama: org.name,
          tahun: org.year,
          posisi: org.position,
          created_at: new Date().toISOString(),
        }));
        const { error: orgError } = await supabase.from('organisasi').insert(orgRows);
        if (orgError) console.error('Organization insert error:', orgError);
      }

      toast({
        title: "Inisialisasi data berhasil!",
        description: "Data Anda telah disimpan. Selamat datang di PortofolioSiswa!",
      });

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan data. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progressValue = (currentStep / steps.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inisialisasi Data Siswa</h1>
        <p className="text-muted-foreground mt-2">
          Lengkapi data siswa Anda untuk membuat portofolio yang komprehensif.
        </p>
      </div>

      <div className="w-full max-w-2xl mx-auto">
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-black/70 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl font-bold">
              Lengkapi Data Anda
            </CardTitle>
            <div className="space-y-2">
              <Progress value={progressValue} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center ${index + 1 <= currentStep ? "text-primary" : ""
                      }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium ${index + 1 <= currentStep
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-muted-foreground"
                        }`}
                    >
                      {index + 1}
                    </div>
                    <div className="mt-1 text-center">
                      <div className="font-medium">{step.title}</div>
                      <div className="text-xs">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {currentStep === 1 && (
              <BiodataStep
                userType={userType}
                initialData={biodataForm}
                onSubmit={handleBiodataSubmit}
              // No onBack prop - this is the first step
              />
            )}

            {currentStep === 2 && (
              <ReportStep
                userType={userType}
                biodataForm={biodataForm}
                initialData={reportData}
                onSubmit={handleReportNext}
                onBack={() => setCurrentStep(1)}
                isLoading={false}
              />
            )}

            {currentStep === 3 && (
              <AchievementStep
                achievements={achievements}
                onSubmit={handleAchievementNext}
                onSkip={() => setCurrentStep(4)}
                onBack={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 4 && (
              <OrganizationStep
                organizations={organizations}
                hobby={hobby}
                desiredMajor={desiredMajor}
                onSubmit={handleOrganizationSubmit}
                onBack={() => setCurrentStep(3)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 