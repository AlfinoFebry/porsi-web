"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserType, Jurusan, BiodataForm } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

interface BiodataStepProps {
  userType: UserType;
  onSubmit: (data: BiodataForm) => void;
  onBack?: () => void;
  initialData?: BiodataForm;
}

export function BiodataStep({ userType, onSubmit, onBack, initialData }: BiodataStepProps) {
  const [formData, setFormData] = useState<BiodataForm>(
    initialData ?? {
      name: "",
      dateOfBirth: "",
      gender: "male",
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync with initialData when it changes (e.g., when navigating back)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama wajib diisi";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Tanggal lahir wajib diisi";
    }

    if (userType === "siswa") {
      if (!formData.namaSekolah?.trim()) {
        newErrors.namaSekolah = "Nama sekolah wajib diisi";
      }
      if (!formData.jurusan) {
        newErrors.jurusan = "Jurusan wajib dipilih";
      }
      if (!formData.class?.trim()) {
        newErrors.class = "Kelas wajib diisi";
      }
    } else {
      if (!formData.namaPerguruanTinggi?.trim()) {
        newErrors.namaPerguruanTinggi = "Nama perguruan tinggi wajib diisi";
      }
      if (!formData.tahunLulusSMA?.trim()) {
        newErrors.tahunLulusSMA = "Tahun lulus SMA wajib diisi";
      }
      if (!formData.tahunMasukKuliah?.trim()) {
        newErrors.tahunMasukKuliah = "Tahun masuk kuliah wajib diisi";
      }
      if (!formData.jurusanKuliah?.trim()) {
        newErrors.jurusanKuliah = "Jurusan kuliah wajib diisi";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const updateFormData = (field: keyof BiodataForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <div>
          <h2 className="text-xl font-semibold">Biodata Pribadi</h2>
          <p className="text-sm text-muted-foreground">
            Lengkapi informasi pribadi Anda
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData("name", e.target.value)}
            placeholder="Masukkan nama lengkap"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
            className={errors.dateOfBirth ? "border-red-500" : ""}
          />
          {errors.dateOfBirth && (
            <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label>Jenis Kelamin</Label>
          <RadioGroup
            value={formData.gender}
            onValueChange={(value) => updateFormData("gender", value as "male" | "female")}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male" className="font-normal">Laki-laki</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female" className="font-normal">Perempuan</Label>
            </div>
          </RadioGroup>
        </div>

        {userType === "siswa" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="namaSekolah">Nama Sekolah</Label>
              <Input
                id="namaSekolah"
                value={formData.namaSekolah || ""}
                onChange={(e) => updateFormData("namaSekolah", e.target.value)}
                placeholder="Contoh: SMAN 1 Jakarta"
                className={errors.namaSekolah ? "border-red-500" : ""}
              />
              {errors.namaSekolah && (
                <p className="text-sm text-red-500">{errors.namaSekolah}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jurusan">Jurusan SMA</Label>
              <Select
                value={formData.jurusan || ""}
                onValueChange={(value) => updateFormData("jurusan", value as Jurusan)}
              >
                <SelectTrigger className={errors.jurusan ? "border-red-500" : ""}>
                  <SelectValue placeholder="Pilih jurusan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IPA">IPA (Ilmu Pengetahuan Alam)</SelectItem>
                  <SelectItem value="IPS">IPS (Ilmu Pengetahuan Sosial)</SelectItem>
                </SelectContent>
              </Select>
              {errors.jurusan && (
                <p className="text-sm text-red-500">{errors.jurusan}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">Kelas</Label>
              <Select
                value={formData.class || ""}
                onValueChange={(value) => updateFormData("class", value)}
              >
                <SelectTrigger className={errors.class ? "border-red-500" : ""}>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">Kelas 10</SelectItem>
                  <SelectItem value="11">Kelas 11</SelectItem>
                  <SelectItem value="12">Kelas 12</SelectItem>
                </SelectContent>
              </Select>
              {errors.class && (
                <p className="text-sm text-red-500">{errors.class}</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="namaPerguruanTinggi">Nama Perguruan Tinggi</Label>
              <Input
                id="namaPerguruanTinggi"
                value={formData.namaPerguruanTinggi || ""}
                onChange={(e) => updateFormData("namaPerguruanTinggi", e.target.value)}
                placeholder="Contoh: Universitas Indonesia"
                className={errors.namaPerguruanTinggi ? "border-red-500" : ""}
              />
              {errors.namaPerguruanTinggi && (
                <p className="text-sm text-red-500">{errors.namaPerguruanTinggi}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tahunLulusSMA">Tahun Lulus SMA</Label>
              <Input
                id="tahunLulusSMA"
                value={formData.tahunLulusSMA || ""}
                onChange={(e) => updateFormData("tahunLulusSMA", e.target.value)}
                placeholder="Contoh: 2020"
                className={errors.tahunLulusSMA ? "border-red-500" : ""}
              />
              {errors.tahunLulusSMA && (
                <p className="text-sm text-red-500">{errors.tahunLulusSMA}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tahunMasukKuliah">Tahun Masuk Perguruan Tinggi</Label>
              <Input
                id="tahunMasukKuliah"
                value={formData.tahunMasukKuliah || ""}
                onChange={(e) => updateFormData("tahunMasukKuliah", e.target.value)}
                placeholder="Contoh: 2020"
                className={errors.tahunMasukKuliah ? "border-red-500" : ""}
              />
              {errors.tahunMasukKuliah && (
                <p className="text-sm text-red-500">{errors.tahunMasukKuliah}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jurusanKuliah">Jurusan/Program Studi</Label>
              <Input
                id="jurusanKuliah"
                value={formData.jurusanKuliah || ""}
                onChange={(e) => updateFormData("jurusanKuliah", e.target.value)}
                placeholder="Contoh: Teknik Informatika"
                className={errors.jurusanKuliah ? "border-red-500" : ""}
              />
              {errors.jurusanKuliah && (
                <p className="text-sm text-red-500">{errors.jurusanKuliah}</p>
              )}
            </div>
          </>
        )}

        <div className="flex space-x-3 pt-4">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              Kembali
            </Button>
          )}
          <Button type="submit" className={onBack ? "flex-1" : "w-full"}>
            Lanjutkan
          </Button>
        </div>
      </form>
    </div>
  );
} 