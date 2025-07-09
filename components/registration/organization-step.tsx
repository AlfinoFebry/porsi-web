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
  desiredMajor: string; // expected as comma-separated list when coming from parent
  onSubmit: (data: {
    organizations: OrganizationItem[];
    hobby: string;
    desiredMajor: string; // we will join two selections with comma
  }) => void;
  onBack: () => void;
}

export function OrganizationStep({
  organizations: initialOrgs,
  hobby: initialHobby,
  desiredMajor: initialMajor,
  onSubmit,
  onBack,
}: OrganizationStepProps) {
  const [organizations, setOrganizations] = useState<OrganizationItem[]>(initialOrgs.length ? initialOrgs : [{ name: "", year: "", position: "" }]);
  const [hobby, setHobby] = useState<string>(initialHobby || "");
  // Split initial majors by comma to prefill when navigating back
  const initialMajors = initialMajor ? initialMajor.split(/\s*,\s*/) : ["", ""];
  const [desiredMajor1, setDesiredMajor1] = useState<string>(initialMajors[0] || "");
  const [desiredMajor2, setDesiredMajor2] = useState<string>(initialMajors[1] || "");
  const [customHobby, setCustomHobby] = useState<string>("");
  const [customMajor1, setCustomMajor1] = useState<string>("");
  const [customMajor2, setCustomMajor2] = useState<string>("");

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
    const cleanedOrgs = organizations.filter((o) => o.name.trim() !== "");

    const finalHobby = hobby === "other" ? customHobby : hobby;

    const processedMajor1 =
      desiredMajor1 === "other" ? customMajor1 : desiredMajor1;
    const processedMajor2 =
      desiredMajor2 === "other" ? customMajor2 : desiredMajor2;

    const majors = [processedMajor1, processedMajor2]
      .filter((m) => m && m.trim() !== "")
      .join(", ");

    onSubmit({ organizations: cleanedOrgs, hobby: finalHobby, desiredMajor: majors });
  };

  // Options derived from CSV files (manually inlined for now)
  const hobbyOptions = [
    "Pemrograman",
    "Bermain Game",
    "Robotika",
    "Elektronika",
    "Berjualan",
    "Menulis",
    "Organisasi",
    "Membaca",
    "Debat",
    "Volunteer",
    "Belajar Bahasa",
    "Menggambar",
    "Desain Grafis",
    "Fotografi",
    "Mengedit Video",
    "Bermain Musik",
    "Mengajar",
    "Public Speaking",
    "Belajar",
    "Olahraga",
    "Berkebun",
    "Mendaki gunung",
    "Memasak",
    "Memecahkan Puzzle Logika",
    "Catur",
    "Astronomi",
    "Kerajinan Tangan",
    "Kepanitiaan",
    "Jalan-jalan",
    "other",
  ];

  const majorOptions = [
    "Administrasi Bisnis",
    "Administrasi Negara",
    "Administrasi Pendidikan",
    "Agribisnis",
    "Agroekoteknologi",
    "Agroteknologi",
    "Akuntansi",
    "Akuntansi Manajemen",
    "Akuntansi Perpajakan",
    "Akuakultur",
    "Arsitektur",
    "Bahasa Inggris Untuk Industri Pariwisata",
    "Bahasa Inggris Untuk Komunikasi dan Bisnis",
    "Bimbingan Konseling",
    "Biologi",
    "Budidaya Perairan",
    "Desain Grafis",
    "Desain Komunikasi Visual",
    "Ekonomi Pembangunan",
    "Farmasi",
    "Fisika",
    "Fotografi",
    "Geografi",
    "Hubungan Internasional",
    "HUKUM EKONOMI SYARIAH ( MUAMALAH)",
    "Ilmu Hukum",
    "Ilmu Keolahragaan",
    "Ilmu Keperawatan",
    "Ilmu Kesejahteraan Sosial",
    "Ilmu Komunikasi",
    "Ilmu Perpustakaan dan Ilmu Informasi",
    "Ilmu Politik",
    "Ilmu Sejarah",
    "Kebidanan",
    "Kehutanan",
    "Keperawatan",
    "Kesejahteraan Sosial",
    "Keuangan",
    "Kimia",
    "Lab Medis",
    "Manajemen",
    "Manajemen Agribisnis",
    "Manajemen Informatika",
    "Manajemen Informasi Kesehatan",
    "Manajemen Pemasaran",
    "Manajemen Perhotelan",
    "Manajemen Rekayasa Konstruksi",
    "Manajemen Sumber Daya Perairan",
    "Matematika",
    "PG Paud",
    "PGSD",
    "Pendidikan Agama Islam",
    "Pendidikan Akuntansi",
    "Pendidikan Administrasi Perkantoran",
    "Pendidikan Bahasa dan Sastra Indonesia",
    "Pendidikan Bahasa Daerah",
    "Pendidikan Bahasa Inggris",
    "Pendidikan Biologi",
    "Pendidikan Ekonomi",
    "Pendidikan Fisika",
    "Pendidikan Geografi",
    "Pendidikan IPA",
    "Pendidikan IPS",
    "Pendidikan Jasmani dan Olahraga",
    "Pendidikan Jasmani Kesehatan dan Rekreasi",
    "Pendidikan Keagamaan Budha",
    "Pendidikan Kepelatihan Olahraga",
    "Pendidikan Kimia",
    "Pendidikan Luar Sekolah",
    "Pendidikan Matematika",
    "Pendidikan Pancasila dan Kewarganegaraan",
    "Pendidikan Sejarah",
    "Pendidikan Seni Tari dan Musik",
    "Pendidikan Sosiologi",
    "Pendidikan Tata Busana",
    "Pendidikan Tata Niaga",
    "Pendidikan Teknik Informatika",
    "Pendidikan Teknologi Informasi",
    "Pendidikan Dokter",
    "Pendidikan Dokter Hewan",
    "Pengelolaan Arsip dan Rekaman Informasi",
    "Pengelolaan Perhotelan",
    "Perpajakan",
    "Peternakan",
    "Psikologi",
    "Rekam Medis",
    "Rekam Medis dan Informasi Kesehatan",
    "Seni Rupa Murni",
    "Sistem Informasi Bisnis",
    "Sosiologi",
    "Statistika Bisnis",
    "Tata Boga",
    "Teknologi Bioproses",
    "Teknologi Kimia Industri",
    "Teknologi Pendidikan",
    "Teknologi Pertambangan",
    "Teknologi Rekayasa Pembangkit Energi",
    "Teknik Elektromedik",
    "Teknik Elektro",
    "Teknik Geofisika",
    "Teknik Industri",
    "Teknik Informatika",
    "Teknik Jaringan Komunikasi Digital",
    "Teknik Kimia Industri",
    "Teknik Komputer",
    "Teknik Listrik",
    "Teknik Mesin",
    "Teknik Perkapalan",
    "Teknik Pertambangan",
    "Teknik Sipil",
    "Teknik Telekomunikasi",
    "Teknik Fisika",
    "Usaha Perjalanan Wisata",
    "other",
  ];

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

        {/* Desired Major Selection (up to 2) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jurusan Kuliah Impian (Maks. 2)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* First Major */}
            <div className="space-y-2">
              <Label>Jurusan Utama</Label>
              <Select value={desiredMajor1} onValueChange={(val) => setDesiredMajor1(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jurusan utama" />
                </SelectTrigger>
                <SelectContent>
                  {majorOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt === "other" ? "Lainnya" : opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {desiredMajor1 === "other" && (
                <Input
                  value={customMajor1}
                  onChange={(e) => setCustomMajor1(e.target.value)}
                  placeholder="Tuliskan jurusan utama"
                />
              )}
            </div>

            {/* Second Major (optional) */}
            <div className="space-y-2">
              <Label>Jurusan Kedua (Opsional)</Label>
              <Select value={desiredMajor2} onValueChange={(val) => setDesiredMajor2(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jurusan kedua (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  {majorOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt === "other" ? "Lainnya" : opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {desiredMajor2 === "other" && (
                <Input
                  value={customMajor2}
                  onChange={(e) => setCustomMajor2(e.target.value)}
                  placeholder="Tuliskan jurusan kedua"
                />
              )}
            </div>
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