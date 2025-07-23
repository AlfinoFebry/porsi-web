-- Create refactored tables with new names and structure
-- This migration creates the tables according to refactor_table.md

-- Create profil table (renamed from profiles)
CREATE TABLE IF NOT EXISTS profil (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  nama TEXT NOT NULL,
  email TEXT,
  tanggal_lahir DATE,
  jenis_kelamin TEXT CHECK (jenis_kelamin IN ('male', 'female')),
  tipe_user TEXT CHECK (tipe_user IN ('siswa', 'alumni', 'admin')),
  nama_sekolah TEXT,
  jurusan TEXT CHECK (jurusan IN ('IPA', 'IPS')),
  kelas TEXT,
  nama_perguruan_tinggi TEXT,
  tahun_lulus_sma TEXT,
  tahun_masuk_kuliah TEXT,
  jurusan_kuliah TEXT,
  hobi TEXT,
  jurusan_impian TEXT,
  PRIMARY KEY (id)
);

-- Create data_akademik table (renamed from academic_records)
CREATE TABLE IF NOT EXISTS data_akademik (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  mapel TEXT NOT NULL,
  semester INTEGER CHECK (semester BETWEEN 1 AND 6),
  nilai DECIMAL(5,2) CHECK (nilai BETWEEN 0 AND 100),
  tahun TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE(user_id, mapel, semester)
);

-- Create sertifikat table (renamed from achievements)
CREATE TABLE IF NOT EXISTS sertifikat (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  judul TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Create mapel_lintas_minat table (renamed from additional_subjects)
CREATE TABLE IF NOT EXISTS mapel_lintas_minat (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  mapel TEXT NOT NULL,
  kategori TEXT CHECK (kategori IN ('IPA', 'IPS', 'wajib')),
  PRIMARY KEY (id),
  UNIQUE(user_id, mapel)
);

-- Create organisasi table (renamed from organizations)
CREATE TABLE IF NOT EXISTS organisasi (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  nama TEXT NOT NULL,
  tahun TEXT,
  posisi TEXT,
  PRIMARY KEY (id)
);

-- Create rekomendasi table (renamed from recommendations)
CREATE TABLE IF NOT EXISTS rekomendasi (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profil_tipe_user ON profil(tipe_user);
CREATE INDEX IF NOT EXISTS idx_data_akademik_user_id ON data_akademik(user_id);
CREATE INDEX IF NOT EXISTS idx_data_akademik_mapel ON data_akademik(mapel);
CREATE INDEX IF NOT EXISTS idx_sertifikat_user_id ON sertifikat(user_id);
CREATE INDEX IF NOT EXISTS idx_mapel_lintas_minat_user_id ON mapel_lintas_minat(user_id);
CREATE INDEX IF NOT EXISTS idx_organisasi_user_id ON organisasi(user_id);
CREATE INDEX IF NOT EXISTS idx_rekomendasi_user_id ON rekomendasi(user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profil_updated_at ON profil;
CREATE TRIGGER update_profil_updated_at BEFORE UPDATE ON profil FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_data_akademik_updated_at ON data_akademik;
CREATE TRIGGER update_data_akademik_updated_at BEFORE UPDATE ON data_akademik FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_rekomendasi_updated_at ON rekomendasi;
CREATE TRIGGER update_rekomendasi_updated_at BEFORE UPDATE ON rekomendasi FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();