-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  user_type TEXT CHECK (user_type IN ('siswa', 'alumni')),
  
  -- For siswa SMA
  nama_sekolah TEXT,
  jurusan TEXT CHECK (jurusan IN ('IPA', 'IPS')),
  class TEXT,
  
  -- For alumni
  nama_perguruan_tinggi TEXT,
  tahun_lulus_sma TEXT,
  tahun_masuk_kuliah TEXT,
  jurusan_kuliah TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  PRIMARY KEY (id)
);

-- Create academic_records table
CREATE TABLE IF NOT EXISTS academic_records (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  subject TEXT NOT NULL,
  semester INTEGER CHECK (semester BETWEEN 1 AND 4),
  score DECIMAL(5,2) CHECK (score BETWEEN 0 AND 100),
  school_year TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  PRIMARY KEY (id),
  UNIQUE(user_id, subject, semester)
);

-- Create additional_subjects table (for subjects from other majors)
CREATE TABLE IF NOT EXISTS additional_subjects (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  subject_category TEXT CHECK (subject_category IN ('IPA', 'IPS', 'wajib')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  PRIMARY KEY (id),
  UNIQUE(user_id, subject_name)
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_subjects ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for academic_records
CREATE POLICY "Users can view own academic records" ON academic_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own academic records" ON academic_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own academic records" ON academic_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own academic records" ON academic_records FOR DELETE USING (auth.uid() = user_id);

-- Create policies for additional_subjects
CREATE POLICY "Users can view own additional subjects" ON additional_subjects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own additional subjects" ON additional_subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own additional subjects" ON additional_subjects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own additional subjects" ON additional_subjects FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_academic_records_updated_at BEFORE UPDATE ON academic_records FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column(); 