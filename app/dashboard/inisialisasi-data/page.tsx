"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UserTypeStep } from "@/components/registration/user-type-step";
import { BiodataStep } from "@/components/registration/biodata-step";
import { ReportStep } from "@/components/registration/report-step";
import { AchievementStep, AchievementItem } from "@/components/registration/achievement-step";
import { OrganizationStep, OrganizationItem } from "@/components/registration/organization-step";
import { useToast } from "@/hooks/use-toast";
import { UserType, BiodataForm, ReportData } from "@/lib/types";

export default function InisialisasiDataPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState<UserType | null>(null);
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
    { title: "Profil", description: "Pilih status Anda" },
    { title: "Biodata", description: "Isi data pribadi" },
    { title: "Rapor", description: "Input nilai rapor" },
    { title: "Prestasi", description: "Tambah sertifikat" },
    { title: "Organisasi", description: "Minat & organisasi" },
  ];

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setCurrentStep(2);
  };

  const handleBiodataSubmit = (data: BiodataForm) => {
    setBiodataForm(data);
    setCurrentStep(3);
  };

  const handleReportNext = (data: ReportData) => {
    setReportData(data);
    setCurrentStep(4);
  };

  const handleAchievementNext = (data: AchievementItem[]) => {
    setAchievements(data);
    setCurrentStep(5);
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
        name: biodataForm.name,
        date_of_birth: biodataForm.dateOfBirth,
        gender: biodataForm.gender,
        user_type: userType,
        hobby: data.hobby,
        desired_major: data.desiredMajor,
        ...(userType === "siswa" ? {
          nama_sekolah: biodataForm.namaSekolah,
          jurusan: biodataForm.jurusan,
          class: biodataForm.class,
        } : {
          nama_perguruan_tinggi: biodataForm.namaPerguruanTinggi,
          tahun_lulus_sma: biodataForm.tahunLulusSMA,
          tahun_masuk_kuliah: biodataForm.tahunMasukKuliah,
          jurusan_kuliah: biodataForm.jurusanKuliah,
        }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase.from('profiles').upsert(profileData);
      if (profileError) throw profileError;

      // 2. Insert academic records
      const recordEntries: any[] = [];
      for (const [subject, scores] of Object.entries(reportData)) {
        for (const [semester, score] of Object.entries(scores)) {
          if (score !== undefined && score !== null) {
            recordEntries.push({
              user_id: user.id,
              subject,
              semester: parseInt(semester.replace('semester', '')),
              score: parseFloat(score.toString()),
              school_year: new Date().getFullYear() + "/" + (new Date().getFullYear() + 1),
              created_at: new Date().toISOString(),
            });
          }
        }
      }

      if (recordEntries.length) {
        const { error: recordError } = await supabase.from('academic_records').insert(recordEntries);
        if (recordError) throw recordError;
      }

      // 3. Upload achievements images (if any) and insert rows
      if (achievements.length) {
        const achievementRows: any[] = [];
        for (const ach of achievements) {
          let imageUrl: string | null = null;
          if (ach.file) {
            const filePath = `certifications/${user.id}/${Date.now()}_${ach.file.name}`;
            const { error: uploadError } = await supabase.storage.from('certifications').upload(filePath, ach.file);
            if (uploadError && uploadError.message !== 'The resource already exists') throw uploadError;
            const { data: publicUrlData } = supabase.storage.from('certifications').getPublicUrl(filePath);
            imageUrl = publicUrlData.publicUrl;
          }
          achievementRows.push({
            user_id: user.id,
            title: ach.title,
            image_url: imageUrl,
            created_at: new Date().toISOString(),
          });
        }
        if (achievementRows.length) {
          const { error: achError } = await supabase.from('achievements').insert(achievementRows);
          if (achError) console.error('Achievement insert error:', achError);
        }
      }

      // 4. Insert organizations
      if (data.organizations.length) {
        const orgRows = data.organizations.map(org => ({
          user_id: user.id,
          name: org.name,
          year: org.year,
          position: org.position,
          created_at: new Date().toISOString(),
        }));
        const { error: orgError } = await supabase.from('organizations').insert(orgRows);
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
        <h1 className="text-3xl font-bold tracking-tight">Inisialisasi Data</h1>
        <p className="text-muted-foreground mt-2">
          Lengkapi data Anda untuk membuat portofolio yang komprehensif.
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
                    className={`flex flex-col items-center ${
                      index + 1 <= currentStep ? "text-primary" : ""
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                        index + 1 <= currentStep
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
              <UserTypeStep onSelect={handleUserTypeSelect} />
            )}
            
            {currentStep === 2 && (
              <BiodataStep
                userType={userType!}
                initialData={biodataForm}
                onSubmit={handleBiodataSubmit}
                onBack={() => setCurrentStep(1)}
              />
            )}
            
            {currentStep === 3 && (
              <ReportStep
                userType={userType!}
                biodataForm={biodataForm}
                initialData={reportData}
                onSubmit={handleReportNext}
                onBack={() => setCurrentStep(2)}
                isLoading={false}
              />
            )}
            
            {currentStep === 4 && (
              <AchievementStep
                achievements={achievements}
                onSubmit={handleAchievementNext}
                onSkip={() => setCurrentStep(5)}
                onBack={() => setCurrentStep(3)}
              />
            )}
            
            {currentStep === 5 && (
              <OrganizationStep
                organizations={organizations}
                hobby={hobby}
                desiredMajor={desiredMajor}
                onSubmit={handleOrganizationSubmit}
                onBack={() => setCurrentStep(4)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 