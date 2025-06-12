"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AuthStep } from "@/components/registration/auth-step";
import { UserTypeStep } from "@/components/registration/user-type-step";
import { BiodataStep } from "@/components/registration/biodata-step";
import { ReportStep } from "@/components/registration/report-step";
import { AchievementStep, AchievementItem } from "@/components/registration/achievement-step";
import { OrganizationStep, OrganizationItem } from "@/components/registration/organization-step";
import { useToast } from "@/hooks/use-toast";

export type UserType = "siswa" | "alumni";
export type Jurusan = "IPA" | "IPS";

export interface BiodataForm {
  name: string;
  dateOfBirth: string;
  gender: "male" | "female";
  // For siswa SMA
  namaSekolah?: string;
  jurusan?: Jurusan;
  class?: string;
  // For alumni
  namaPerguruanTinggi?: string;
  tahunLulusSMA?: string;
  tahunMasukKuliah?: string;
  jurusanKuliah?: string;
}

export interface ReportData {
  [subject: string]: {
    semester1?: number;
    semester2?: number;
    semester3?: number;
    semester4?: number;
  };
}

export default function RegisterPage() {
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
    { title: "Akun", description: "Buat akun Anda" },
    { title: "Profil", description: "Pilih status Anda" },
    { title: "Biodata", description: "Isi data pribadi" },
    { title: "Rapor", description: "Input nilai rapor" },
    { title: "Prestasi", description: "Tambah sertifikat" },
    { title: "Organisasi", description: "Minat & organisasi" },
  ];

  const handleAuthSuccess = () => {
    setCurrentStep(2);
  };

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setCurrentStep(3);
  };

  const handleBiodataSubmit = (data: BiodataForm) => {
    setBiodataForm(data);
    setCurrentStep(4);
  };

  const handleReportNext = (data: ReportData) => {
    setReportData(data);
    setCurrentStep(5);
  };

  const handleAchievementNext = (data: AchievementItem[]) => {
    setAchievements(data);
    setCurrentStep(6);
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
        title: "Registrasi berhasil!",
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
    <div className="min-h-[calc(100vh-16rem)] w-full flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-black/70 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl font-bold">
              Registrasi PortofolioSiswa
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
              <AuthStep onSuccess={handleAuthSuccess} />
            )}
            
            {currentStep === 2 && (
              <UserTypeStep onSelect={handleUserTypeSelect} />
            )}
            
            {currentStep === 3 && (
              <BiodataStep
                userType={userType!}
                onSubmit={handleBiodataSubmit}
                onBack={() => setCurrentStep(2)}
              />
            )}
            
            {currentStep === 4 && (
              <ReportStep
                userType={userType!}
                biodataForm={biodataForm}
                onSubmit={handleReportNext}
                onBack={() => setCurrentStep(3)}
                isLoading={false}
              />
            )}
            
            {currentStep === 5 && (
              <AchievementStep
                achievements={achievements}
                onSubmit={handleAchievementNext}
                onSkip={() => setCurrentStep(6)}
                onBack={() => setCurrentStep(4)}
              />
            )}
            
            {currentStep === 6 && (
              <OrganizationStep
                organizations={organizations}
                hobby={hobby}
                desiredMajor={desiredMajor}
                onSubmit={handleOrganizationSubmit}
                onBack={() => setCurrentStep(5)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 