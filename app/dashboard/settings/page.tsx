"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/utils/supabase/client";

interface BaseForm {
  name: string;
  email: string;
}

interface SiswaForm extends BaseForm {
  user_type: "siswa";
  nama_sekolah: string;
  jurusan: "IPA" | "IPS" | "";
  class: string;
}

interface AlumniForm extends BaseForm {
  user_type: "alumni";
  nama_perguruan_tinggi: string;
  jurusan_kuliah: string;
  tahun_lulus_sma: string;
  tahun_masuk_kuliah: string;
}

type FormState = SiswaForm | AlumniForm | null;

export default function SettingsPage() {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(null);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");
        const { data: profile, error: profileError } = await supabase
          .from("profil")
          .select("id, name:nama, email, user_type:tipe_user, nama_sekolah, jurusan, class:kelas, nama_perguruan_tinggi, jurusan_kuliah, tahun_lulus_sma, tahun_masuk_kuliah")
          .eq("id", user.id)
          .single();
        if (profileError) throw profileError;
        if (!profile) throw new Error("Profile not found");

        if (profile.user_type === "siswa") {
          setFormData({
            user_type: "siswa",
            name: profile.name || "",
            email: profile.email || user.email || "",
            nama_sekolah: profile.nama_sekolah || "",
            jurusan: profile.jurusan || "",
            class: profile.class || "",
          });
        } else {
          setFormData({
            user_type: "alumni",
            name: profile.name || "",
            email: profile.email || user.email || "",
            nama_perguruan_tinggi: profile.nama_perguruan_tinggi || "",
            jurusan_kuliah: profile.jurusan_kuliah || "",
            tahun_lulus_sma: profile.tahun_lulus_sma || "",
            tahun_masuk_kuliah: profile.tahun_masuk_kuliah || "",
          });
        }
      } catch (e: any) {
        setError(e.message);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) =>
      prev ? ({ ...prev, [name]: value } as FormState) : prev
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const updateData: any = {
        id: user.id,
        nama: formData.name,
        email: formData.email,
      };
      if (formData.user_type === "siswa") {
        updateData.nama_sekolah = formData.nama_sekolah;
        updateData.jurusan = formData.jurusan;
        updateData.kelas = formData.class;
      } else {
        updateData.nama_perguruan_tinggi = formData.nama_perguruan_tinggi;
        updateData.jurusan_kuliah = formData.jurusan_kuliah;
        updateData.tahun_lulus_sma = formData.tahun_lulus_sma;
        updateData.tahun_masuk_kuliah = formData.tahun_masuk_kuliah;
      }

      const { error: upError } = await supabase
        .from("profil")
        .upsert(updateData);
      if (upError) throw upError;
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }
  if (!formData) {
    return <p>Memuat...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Kelola pengaturan akun Anda.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="border rounded-lg">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Profile Settings</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 rounded-md border border-input bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 rounded-md border border-input bg-background"
                  />
                </div>

                {formData.user_type === "siswa" ? (
                  <>
                    <div className="space-y-2">
                      <label
                        htmlFor="nama_sekolah"
                        className="text-sm font-medium"
                      >
                        Nama Sekolah
                      </label>
                      <input
                        id="nama_sekolah"
                        name="nama_sekolah"
                        value={formData.nama_sekolah}
                        onChange={handleChange}
                        className="w-full p-2 rounded-md border border-input bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="jurusan" className="text-sm font-medium">
                        Jurusan
                      </label>
                      <select
                        id="jurusan"
                        name="jurusan"
                        value={formData.jurusan}
                        onChange={handleChange}
                        className="w-full p-2 rounded-md border border-input bg-background"
                      >
                        <option value="">Pilih jurusan</option>
                        <option value="IPA">IPA</option>
                        <option value="IPS">IPS</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="class" className="text-sm font-medium">
                        Kelas
                      </label>
                      <select
                        id="class"
                        name="class"
                        value={formData.class}
                        onChange={handleChange}
                        className="w-full p-2 rounded-md border border-input bg-background"
                      >
                        <option value="">Pilih kelas</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label
                        htmlFor="nama_perguruan_tinggi"
                        className="text-sm font-medium"
                      >
                        Perguruan Tinggi
                      </label>
                      <input
                        id="nama_perguruan_tinggi"
                        name="nama_perguruan_tinggi"
                        value={formData.nama_perguruan_tinggi}
                        onChange={handleChange}
                        className="w-full p-2 rounded-md border border-input bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="jurusan_kuliah"
                        className="text-sm font-medium"
                      >
                        Jurusan Kuliah
                      </label>
                      <input
                        id="jurusan_kuliah"
                        name="jurusan_kuliah"
                        value={formData.jurusan_kuliah}
                        onChange={handleChange}
                        className="w-full p-2 rounded-md border border-input bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="tahun_lulus_sma"
                        className="text-sm font-medium"
                      >
                        Tahun Lulus SMA
                      </label>
                      <input
                        id="tahun_lulus_sma"
                        name="tahun_lulus_sma"
                        value={formData.tahun_lulus_sma}
                        onChange={handleChange}
                        className="w-full p-2 rounded-md border border-input bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="tahun_masuk_kuliah"
                        className="text-sm font-medium"
                      >
                        Tahun Masuk Kuliah
                      </label>
                      <input
                        id="tahun_masuk_kuliah"
                        name="tahun_masuk_kuliah"
                        value={formData.tahun_masuk_kuliah}
                        onChange={handleChange}
                        className="w-full p-2 rounded-md border border-input bg-background"
                      />
                    </div>
                  </>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                    disabled
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  {/* <button type="submit" className="bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button> */}
                </div>

                {success && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md text-green-600 dark:text-green-400 text-sm">
                    Profil berhasil diperbarui.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border rounded-lg">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Appearance</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="font-medium">Theme</div>
                  <p className="text-sm text-muted-foreground">
                    Select a theme for your dashboard.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeSwitcher />
                  <span className="text-sm">
                    Toggle between light and dark mode
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border rounded-lg">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Account</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="font-medium">Sign Out</div>
                  <p className="text-sm text-muted-foreground">
                    Sign out from your account.
                  </p>
                </div>
                <button className="bg-destructive/10 text-destructive py-2 px-4 rounded-md font-medium hover:bg-destructive/20 transition-colors">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
