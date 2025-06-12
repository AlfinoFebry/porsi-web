"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { UserType, Jurusan, BiodataForm, ReportData } from "@/app/(auth-pages)/register/page";
import { ArrowLeft, Upload, Loader2, Camera } from "lucide-react";

interface ReportStepProps {
  userType: UserType;
  biodataForm: BiodataForm;
  onSubmit: (data: ReportData) => void;
  onBack: () => void;
  isLoading: boolean;
}

// Subject lists based on curriculum
const WAJIB_SUBJECTS = [
  "Pendidikan Agama dan Budi Pekerti",
  "PPKn (Pendidikan Pancasila dan Kewarganegaraan)",
  "Bahasa Indonesia",
  "Matematika Wajib",
  "Sejarah Indonesia",
  "Bahasa Inggris",
  "PJOK (Pendidikan Jasmani, Olahraga, dan Kesehatan)",
  "Prakarya/Seni Budaya",
];

const IPA_SUBJECTS = [
  "Matematika Peminatan",
  "Fisika",
  "Kimia",
  "Biologi",
];

const IPS_SUBJECTS = [
  "Geografi",
  "Sejarah",
  "Sosiologi",
  "Ekonomi",
];

export function ReportStep({ userType, biodataForm, onSubmit, onBack, isLoading }: ReportStepProps) {
  const [reportData, setReportData] = useState<ReportData>({});
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [additionalSubjects, setAdditionalSubjects] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine available subjects based on user's jurusan
  const getAvailableSubjects = () => {
    let subjects = [...WAJIB_SUBJECTS];
    
    if (userType === "siswa" && biodataForm.jurusan === "IPA") {
      subjects = [...subjects, ...IPA_SUBJECTS];
    } else if (userType === "siswa" && biodataForm.jurusan === "IPS") {
      subjects = [...subjects, ...IPS_SUBJECTS];
    } else {
      // For alumni, show both IPA and IPS subjects
      subjects = [...subjects, ...IPA_SUBJECTS, ...IPS_SUBJECTS];
    }
    
    return subjects;
  };

  const getOtherSubjects = () => {
    const currentSubjects = getAvailableSubjects();
    const allSubjects = [...WAJIB_SUBJECTS, ...IPA_SUBJECTS, ...IPS_SUBJECTS];
    return allSubjects.filter(subject => !currentSubjects.includes(subject));
  };

  // Determine number of semesters to be filled based on user type and class
  const getSemesterCount = () => {
    if (userType === "siswa") {
      switch (biodataForm.class) {
        case "10":
          return 1; // kelas 10 – semester 1
        case "11":
          return 3; // kelas 11 – semester 1–3
        case "12":
          return 5; // kelas 12 – semester 1–5
        default:
          return 4; // fallback (should not happen)
      }
    }
    // Alumni harus memasukkan hingga semester 6
    return 6;
  };

  const availableSubjects = getAvailableSubjects();
  const otherSubjects = getOtherSubjects();
  const semesterCount = getSemesterCount();

  // Initialize subjects if not done
  useState(() => {
    if (selectedSubjects.length === 0) {
      setSelectedSubjects(availableSubjects);
      // Initialize report data for required subjects
      const initialData: ReportData = {};
      availableSubjects.forEach(subject => {
        initialData[subject] = {};
      });
      setReportData(initialData);
    }
  });

  const handleSubjectToggle = (subject: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedSubjects(prev => [...prev, subject]);
      setReportData(prev => ({ ...prev, [subject]: {} }));
    } else {
      setSelectedSubjects(prev => prev.filter(s => s !== subject));
      setReportData(prev => {
        const newData = { ...prev };
        delete newData[subject];
        return newData;
      });
    }
  };

  const handleScoreChange = (subject: string, semester: number, value: string) => {
    const score = value === "" ? undefined : parseFloat(value);
    if (score !== undefined && (score < 0 || score > 100)) return;
    
    setReportData(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [`semester${semester}`]: score,
      },
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult("");

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OCR API request failed: ${response.status}`);
      }

      const result = await response.json();
      setUploadResult(result.text || "Tidak ada teks yang ditemukan dalam gambar.");
      
      // Here you could implement logic to parse the OCR text and auto-fill scores
      // For now, we just show the text result
      
    } catch (error: any) {
      console.error('OCR Error:', error);
      if (error.message && error.message.includes('CORS')) {
        setUploadResult("Fitur OCR sementara tidak tersedia karena masalah CORS. Silakan masukkan nilai secara manual.");
      } else if (error.message && error.message.includes('Failed to fetch')) {
        setUploadResult("Tidak dapat mengakses layanan OCR. Pastikan koneksi internet stabil dan coba lagi.");
      } else {
        setUploadResult("Terjadi kesalahan saat memproses gambar. Silakan coba lagi atau masukkan nilai secara manual.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reportData);
  };

  const isFormValid = () => {
    return selectedSubjects.length > 0 && selectedSubjects.some(subject => {
      const scores = reportData[subject];
      return scores && Object.values(scores).some(score => score !== undefined);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Input Nilai Rapor</h2>
          <p className="text-sm text-muted-foreground">
            Masukkan nilai rapor untuk semester 1{semesterCount > 1 ? `-${semesterCount}` : ""}
          </p>
        </div>
      </div>

      {/* OCR Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Upload Foto Rapor (Opsional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload foto rapor untuk mengisi nilai secara otomatis menggunakan OCR
          </p>
          
          <div className="flex flex-col space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Pilih Foto Rapor
                </>
              )}
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {uploadResult && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-2">Hasil OCR:</p>
                <p className="text-xs text-muted-foreground max-h-32 overflow-y-auto">
                  {uploadResult}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Subjects Selection */}
      {otherSubjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mata Pelajaran Tambahan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {otherSubjects.map((subject) => (
                <div key={subject} className="flex items-center space-x-2">
                  <Checkbox
                    id={`additional-${subject}`}
                    checked={selectedSubjects.includes(subject)}
                    onCheckedChange={(checked) => handleSubjectToggle(subject, !!checked)}
                  />
                  <Label htmlFor={`additional-${subject}`} className="text-sm">
                    {subject}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scores Input */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {selectedSubjects.map((subject) => (
            <Card key={subject}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{subject}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Array.from({ length: semesterCount }, (_, i) => i + 1).map((semester) => (
                    <div key={semester} className="space-y-2">
                      <Label htmlFor={`${subject}-sem${semester}`} className="text-sm">
                        Semester {semester}
                      </Label>
                      <Input
                        id={`${subject}-sem${semester}`}
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="0-100"
                        value={reportData[subject]?.[`semester${semester}` as keyof typeof reportData[string]] || ""}
                        onChange={(e) => handleScoreChange(subject, semester, e.target.value)}
                        className="text-center"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
            disabled={isLoading}
          >
            Kembali
          </Button>
          <Button 
            type="submit" 
            className="flex-1"
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Selesai"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 