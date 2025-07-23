"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Upload, Trash2, Image as ImageIcon } from "lucide-react";

export interface AchievementItem {
  title: string;
  file: File | null;
  preview?: string;
}

interface AchievementStepProps {
  achievements: AchievementItem[];
  onSubmit: (data: AchievementItem[]) => void;
  onBack: () => void;
  onSkip: () => void;
}

export function AchievementStep({ achievements: initialAchievements, onSubmit, onBack, onSkip }: AchievementStepProps) {
  const [achievements, setAchievements] = useState<AchievementItem[]>(initialAchievements.length ? initialAchievements : [{ title: "", file: null }]);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleAddAchievement = () => {
    setAchievements(prev => [...prev, { title: "", file: null }]);
  };

  const handleRemoveAchievement = (index: number) => {
    setAchievements(prev => prev.filter((_, i) => i !== index));
  };

  const handleTitleChange = (index: number, value: string) => {
    setAchievements(prev => prev.map((ach, i) => i === index ? { ...ach, title: value } : ach));
  };

  const handleFileChange = (index: number, file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar (JPG, PNG, dll).");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran file maksimal 10MB. Silakan kompres gambar terlebih dahulu.");
      return;
    }

    const preview = URL.createObjectURL(file);
    setAchievements(prev => prev.map((ach, i) => i === index ? { ...ach, file, preview } : ach));
  };

  const isValid = () => {
    return achievements.every(a => !a.file || a.title.trim() !== "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid()) return;
    // Filter out empty achievements (no title and no file)
    const cleaned = achievements.filter(a => a.title.trim() !== "" || a.file);
    onSubmit(cleaned);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Prestasi / Sertifikat</h2>
          <p className="text-sm text-muted-foreground">Tambahkan sertifikat atau prestasi Anda (opsional)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {achievements.map((ach, index) => (
          <Card key={index}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Prestasi #{index + 1}
              </CardTitle>
              {achievements.length > 1 && (
                <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveAchievement(index)}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor={`achievement-title-${index}`}>Nama Prestasi / Sertifikat</Label>
                <Input
                  id={`achievement-title-${index}`}
                  value={ach.title}
                  placeholder="Contoh: Juara 1 Olimpiade Matematika"
                  onChange={(e) => handleTitleChange(index, e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Dokumen (Gambar)</Label>
                <p className="text-xs text-muted-foreground">Format: JPG, PNG, WEBP. Maksimal 10MB.</p>
                <div className="flex items-center space-x-3">
                  <input
                    ref={el => {
                      fileInputRefs.current[index] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                  />
                  <Button type="button" variant="outline" onClick={() => fileInputRefs.current[index]?.click()}>
                    <Upload className="w-4 h-4 mr-2" /> Pilih File
                  </Button>
                  {ach.preview && (
                    <img src={ach.preview} alt="preview" className="w-12 h-12 object-cover rounded-md" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button type="button" variant="secondary" onClick={handleAddAchievement} className="w-full flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Prestasi
        </Button>

        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onSkip} className="flex-1">
            Lewati
          </Button>
          <Button type="submit" className="flex-1">
            Lanjutkan
          </Button>
        </div>
      </form>
    </div>
  );
} 