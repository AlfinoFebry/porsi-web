"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserType, Jurusan, BiodataForm, ReportData } from "@/lib/types";
import { ArrowLeft, Upload, Loader2, Camera } from "lucide-react";

interface ReportStepProps {
  userType: UserType;
  biodataForm: BiodataForm;
  onSubmit: (data: ReportData) => void;
  onBack: () => void;
  isLoading: boolean;
  allowedSemesters?: number[]; // optional list of semesters to display
  initialData?: ReportData;
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
  "Seni Budaya",
  "Muatan Lokal Bahasa Daerah",
  "PKWu", // Prakarya dan Kewirausahaan
];

const IPA_SUBJECTS = ["Matematika Peminatan", "Fisika", "Kimia", "Biologi"];

const IPS_SUBJECTS = ["Geografi", "Sejarah", "Sosiologi", "Ekonomi"];

export function ReportStep({
  userType,
  biodataForm,
  onSubmit,
  onBack,
  isLoading,
  allowedSemesters,
  initialData,
}: ReportStepProps) {
  const [reportData, setReportData] = useState<ReportData>(initialData ?? {});
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      return Object.keys(initialData);
    }
    return [];
  });
  const [additionalSubjects, setAdditionalSubjects] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string>("");
  const [selectedOcrSemester, setSelectedOcrSemester] = useState<number | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setReportData(initialData);
      setSelectedSubjects(Object.keys(initialData));
    }
  }, [initialData]);

  // Initialize subjects if no previous data
  useEffect(() => {
    if (selectedSubjects.length === 0) {
      setSelectedSubjects(availableSubjects);
      const initData: ReportData = {};
      availableSubjects.forEach((subject) => {
        initData[subject] = {};
      });
      setReportData(initData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    return allSubjects.filter((subject) => !currentSubjects.includes(subject));
  };

  // Determine number of semesters to be filled based on user type and class
  const getSemesterCount = () => {
    if (userType === "siswa") {
      switch (biodataForm.class) {
        case "10":
          return 1; // kelas 10 – semester 1
        case "11":
          return 2; // kelas 11 – semester 1–3
        case "12":
          return 4; // kelas 12 – semester 1–5
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

  const semestersArray =
    allowedSemesters && allowedSemesters.length > 0
      ? allowedSemesters
      : Array.from({ length: semesterCount }, (_, i) => i + 1);

  const handleSubjectToggle = (subject: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedSubjects((prev) => [...prev, subject]);
      setReportData((prev) => ({ ...prev, [subject]: {} }));
    } else {
      setSelectedSubjects((prev) => prev.filter((s) => s !== subject));
      setReportData((prev) => {
        const newData = { ...prev };
        delete newData[subject];
        return newData;
      });
    }
  };

  const handleScoreChange = (
    subject: string,
    semester: number,
    value: string
  ) => {
    const score = value === "" ? undefined : parseFloat(value);
    if (score !== undefined && (score < 0 || score > 100)) return;

    setReportData((prev) => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [`semester${semester}`]: score,
      },
    }));
  };



  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedOcrSemester) {
      setUploadResult(
        "Pilih semester terlebih dahulu sebelum upload foto rapor."
      );
      return;
    }

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      setUploadResult("File harus berupa gambar (JPG, PNG, dll).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setUploadResult("Ukuran file maksimal 10MB.");
      return;
    }

    setIsUploading(true);
    setUploadResult("Sedang memproses gambar... Mohon tunggu 1-5 menit.");

    try {
      // Create FormData with 'file' field as expected by the API
      const formData = new FormData();
      formData.append("file", file);

      // Create a timeout promise (6 minutes to be safe)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Request timeout after 6 minutes")),
          6 * 60 * 1000
        )
      );

      // Make the request using internal API route to avoid CORS issues
      const fetchPromise = fetch("/api/ocr", {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - let browser set it with proper boundary
      });

      const response = (await Promise.race([
        fetchPromise,
        timeoutPromise,
      ])) as Response;

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage += ` - ${errorText}`;
          }
        } catch (e) {
          // Ignore error when reading response body
        }

        if (response.status === 422) {
          throw new Error(
            `Format file tidak didukung atau ada masalah dengan gambar. Pastikan gambar jelas dan berisi teks rapor. (${response.status})`
          );
        } else if (response.status === 413) {
          throw new Error("File terlalu besar. Coba gunakan gambar yang lebih kecil atau masukkan nilai secara manual.");
        } else {
          throw new Error(errorMessage);
        }
      }

      const result = await response.json();

      if (result.Nilai) {
        // Map API response to our subject names and auto-fill scores
        const subjectMapping: Record<string, string> = {
          Pendidikan_Agama: "Pendidikan Agama dan Budi Pekerti",
          Pkn: "PPKn (Pendidikan Pancasila dan Kewarganegaraan)",
          Bahasa_Indonesia: "Bahasa Indonesia",
          Matematika_Wajib: "Matematika Wajib",
          Sejarah_Indonesia: "Sejarah Indonesia",
          Bahasa_Inggris: "Bahasa Inggris",
          Seni_Budaya: "Seni Budaya",
          PKWu: "PKWu",
          Penjaskes: "PJOK (Pendidikan Jasmani, Olahraga, dan Kesehatan)",
          Mulok: "Muatan Lokal Bahasa Daerah",
          Matematika_Peminatan: "Matematika Peminatan",
          Biologi: "Biologi",
          Fisika: "Fisika",
          Kimia: "Kimia",
          Lintas_Minat: "Lintas Minat",
          Geografi: "Geografi",
          Sejarah_Minat: "Sejarah",
          Sosiologi: "Sosiologi",
          Ekonomi: "Ekonomi",
        };

        const newReportData = { ...reportData };

        Object.entries(result.Nilai).forEach(([apiSubject, score]) => {
          const mappedSubject = subjectMapping[apiSubject];
          if (
            mappedSubject &&
            score !== -1 &&
            selectedSubjects.includes(mappedSubject)
          ) {
            if (!newReportData[mappedSubject]) {
              newReportData[mappedSubject] = {};
            }
            newReportData[mappedSubject][
              `semester${selectedOcrSemester}` as keyof (typeof newReportData)[string]
            ] = score as number;
          }
        });

        setReportData(newReportData);
        setUploadResult(
          `Berhasil mengisi nilai untuk semester ${selectedOcrSemester} dari hasil OCR. Jurusan terdeteksi: ${result.Jurusan}, Kelas: ${result.Kelas}`
        );
      } else {
        setUploadResult(
          result["Raw Text"] || "Tidak ada nilai yang ditemukan dalam gambar."
        );
      }
    } catch (error: any) {
      console.error("OCR Error:", error);
      console.log("File details:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      if (error.message && error.message.includes("timeout")) {
        setUploadResult(
          "⏰ Proses OCR membutuhkan waktu terlalu lama (>6 menit). Coba lagi dengan gambar yang lebih kecil atau masukkan nilai secara manual."
        );
      } else if (error.message && error.message.includes("Failed to fetch")) {
        setUploadResult(`🌐 Tidak dapat terhubung ke API OCR. Kemungkinan penyebab:
        • Koneksi internet bermasalah
        • API sedang maintenance
        • Browser memblokir request (coba disable ad blocker)
        
        Silakan coba lagi atau masukkan nilai secara manual.`);
      } else if (error.message && error.message.includes("CORS")) {
        setUploadResult(
          "❌ Masalah CORS dengan API OCR. Silakan masukkan nilai secara manual."
        );
      } else if (error.message && error.message.includes("NetworkError")) {
        setUploadResult(
          "🌐 Masalah jaringan. Periksa koneksi internet Anda dan coba lagi."
        );
      } else if (error.name === "TypeError") {
        setUploadResult(
          "🌐 Error koneksi ke API. Pastikan Anda terhubung ke internet dan coba lagi."
        );
      } else {
        setUploadResult(
          `❌ Terjadi kesalahan: ${error.message || "Unknown error"}. Silakan coba lagi atau masukkan nilai secara manual.`
        );
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
    return (
      selectedSubjects.length > 0 &&
      selectedSubjects.some((subject) => {
        const scores = reportData[subject];
        return (
          scores && Object.values(scores).some((score) => score !== undefined)
        );
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Input Nilai Rapor</h2>
          <p className="text-sm text-muted-foreground">
            {allowedSemesters && allowedSemesters.length === 1
              ? `Masukkan nilai rapor untuk semester ${allowedSemesters[0]}`
              : `Masukkan nilai rapor untuk semester 1${semesterCount > 1 ? `-${semesterCount}` : ""}`}
          </p>
        </div>
      </div>

      {/* OCR Upload Section */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Upload Foto Rapor (Opsional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload foto rapor untuk mengisi nilai secara otomatis menggunakan
            OCR
          </p>
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p className="font-medium mb-1">💡 Tips untuk hasil OCR terbaik:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Pastikan foto jelas dan tidak buram</li>
              <li>Cahaya cukup terang, hindari bayangan</li>
              <li>Teks terlihat dengan jelas</li>
              <li>Format JPG, PNG, atau WEBP</li>
              <li>Ukuran maksimal 10MB</li>
              <li>Untuk file besar, kompres gambar sebelum upload</li>
            </ul>
          </div>

          <div className="flex flex-col space-y-3">
            <div className="space-y-2">
              <Label htmlFor="ocr-semester">Pilih Semester untuk OCR</Label>
              <Select
                value={selectedOcrSemester?.toString() || ""}
                onValueChange={(value) =>
                  setSelectedOcrSemester(parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih semester" />
                </SelectTrigger>
                <SelectContent>
                  {semestersArray.map((semester) => (
                    <SelectItem key={semester} value={semester.toString()}>
                      Semester {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || !selectedOcrSemester}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses OCR...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Pilih Foto Rapor
                </>
              )}
            </Button>

            {isUploading && (
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  🔄 Sedang memproses gambar dengan OCR
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Proses ini membutuhkan waktu 1-5 menit. Mohon tidak menutup
                  halaman.
                </p>
              </div>
            )}

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
      </Card> */}

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
                    onCheckedChange={(checked) =>
                      handleSubjectToggle(subject, !!checked)
                    }
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
                  {semestersArray.map((semester) => (
                    <div key={semester} className="space-y-2">
                      <Label
                        htmlFor={`${subject}-sem${semester}`}
                        className="text-sm"
                      >
                        Semester {semester}
                      </Label>
                      <Input
                        id={`${subject}-sem${semester}`}
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="0-100"
                        value={
                          reportData[subject]?.[
                          `semester${semester}` as keyof (typeof reportData)[string]
                          ] || ""
                        }
                        onChange={(e) =>
                          handleScoreChange(subject, semester, e.target.value)
                        }
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
