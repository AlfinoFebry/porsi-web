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
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const steps = [
    { title: "Akun", description: "Buat akun Anda" },
    { title: "Profil", description: "Pilih status Anda" },
    { title: "Biodata", description: "Isi data pribadi" },
    { title: "Rapor", description: "Input nilai rapor" },
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

  const handleReportSubmit = async (data: ReportData) => {
    setIsLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Save biodata to profiles table
      const profileData = {
        id: user.id,
        email: user.email,
        name: biodataForm.name,
        date_of_birth: biodataForm.dateOfBirth,
        gender: biodataForm.gender,
        user_type: userType,
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

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      // Save report data to academic_records table
      const recordEntries = [];
      for (const [subject, scores] of Object.entries(data)) {
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

      if (recordEntries.length > 0) {
        const { error: recordError } = await supabase
          .from('academic_records')
          .insert(recordEntries);

        if (recordError) {
          console.error('Academic records error:', recordError);
          throw recordError;
        }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
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
                onSubmit={handleReportSubmit}
                onBack={() => setCurrentStep(3)}
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 