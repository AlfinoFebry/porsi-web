"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export interface OrganizationItem {
  name: string;
  year: string;
  position: string;
}

interface OrganizationStepProps {
  organizations: OrganizationItem[];
  hobby: string;
  desiredMajor: string;
  onSubmit: (data: { organizations: OrganizationItem[]; hobby: string; desiredMajor: string; }) => void;
  onBack: () => void;
}

export function OrganizationStep({ organizations: initialOrgs, hobby: initialHobby, desiredMajor: initialMajor, onSubmit, onBack }: OrganizationStepProps) {
  const [organizations, setOrganizations] = useState<OrganizationItem[]>(initialOrgs.length ? initialOrgs : [{ name: "", year: "", position: "" }]);
  const [hobby, setHobby] = useState<string>(initialHobby || "");
  const [desiredMajor, setDesiredMajor] = useState<string>(initialMajor || "");
  const [customHobby, setCustomHobby] = useState<string>("");
  const [customMajor, setCustomMajor] = useState<string>("");

  const handleAddOrg = () => {
    setOrganizations(prev => [...prev, { name: "", year: "", position: "" }]);
  };

  const handleRemoveOrg = (index: number) => {
    setOrganizations(prev => prev.filter((_, i) => i !== index));
  };

  const handleOrgChange = (index: number, field: keyof OrganizationItem, value: string) => {
    setOrganizations(prev => prev.map((org, i) => i === index ? { ...org, [field]: value } : org));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedOrgs = organizations.filter(o => o.name.trim() !== "");
    const finalHobby = hobby === "other" ? customHobby : hobby;
    const finalMajor = desiredMajor === "other" ? customMajor : desiredMajor;
    onSubmit({ organizations: cleanedOrgs, hobby: finalHobby, desiredMajor: finalMajor });
  };

  const hobbyOptions = ["Olahraga", "Membaca", "Musik", "Coding", "Traveling", "other"];
  const majorOptions = ["Teknik Informatika", "Kedokteran", "Ekonomi", "Psikologi", "Hukum", "other"];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Riwayat Organisasi & Minat</h2>
          <p className="text-sm text-muted-foreground">Tambah riwayat organisasi serta pilih hobi dan jurusan kuliah impian Anda</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Organization List */}
        {organizations.map((org, index) => (
          <Card key={index}>
            <CardHeader className="pb-3 flex items-center justify-between">
              <CardTitle className="text-base">Organisasi #{index + 1}</CardTitle>
              {organizations.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveOrg(index)}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nama Organisasi</Label>
                <Input value={org.name} onChange={e => handleOrgChange(index, "name", e.target.value)} placeholder="Contoh: OSIS" />
              </div>
              <div className="space-y-2">
                <Label>Tahun</Label>
                <Input value={org.year} onChange={e => handleOrgChange(index, "year", e.target.value)} placeholder="Contoh: 2022" />
              </div>
              <div className="space-y-2">
                <Label>Posisi / Jabatan</Label>
                <Input value={org.position} onChange={e => handleOrgChange(index, "position", e.target.value)} placeholder="Contoh: Ketua" />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button type="button" variant="secondary" onClick={handleAddOrg} className="w-full flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Organisasi
        </Button>

        {/* Hobby Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hobi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={hobby} onValueChange={val => setHobby(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih hobi" />
              </SelectTrigger>
              <SelectContent>
                {hobbyOptions.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt === "other" ? "Lainnya" : opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hobby === "other" && (
              <Input value={customHobby} onChange={e => setCustomHobby(e.target.value)} placeholder="Tuliskan hobi Anda" />
            )}
          </CardContent>
        </Card>

        {/* Desired Major Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jurusan Kuliah Impian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={desiredMajor} onValueChange={val => setDesiredMajor(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jurusan" />
              </SelectTrigger>
              <SelectContent>
                {majorOptions.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt === "other" ? "Lainnya" : opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {desiredMajor === "other" && (
              <Input value={customMajor} onChange={e => setCustomMajor(e.target.value)} placeholder="Tuliskan jurusan impian Anda" />
            )}
          </CardContent>
        </Card>

        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Kembali
          </Button>
          <Button type="submit" className="flex-1">
            Selesai
          </Button>
        </div>
      </form>
    </div>
  );
} 