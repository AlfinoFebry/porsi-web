-- Fix any potential issues with the profiles table
-- Make sure all columns exist and are properly configured

-- Add missing columns if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS nama_sekolah TEXT,
ADD COLUMN IF NOT EXISTS jurusan TEXT,
ADD COLUMN IF NOT EXISTS class TEXT,
ADD COLUMN IF NOT EXISTS nama_perguruan_tinggi TEXT,
ADD COLUMN IF NOT EXISTS tahun_lulus_sma TEXT,
ADD COLUMN IF NOT EXISTS tahun_masuk_kuliah TEXT,
ADD COLUMN IF NOT EXISTS jurusan_kuliah TEXT;

-- Make sure school_year column exists in academic_records
ALTER TABLE academic_records 
ADD COLUMN IF NOT EXISTS school_year TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_academic_records_user_id ON academic_records(user_id);
CREATE INDEX IF NOT EXISTS idx_academic_records_subject ON academic_records(subject);

-- Update constraints to be more flexible
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_gender_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_gender_check CHECK (gender IN ('male', 'female'));

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_user_type_check CHECK (user_type IN ('siswa', 'alumni'));

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_jurusan_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_jurusan_check CHECK (jurusan IS NULL OR jurusan IN ('IPA', 'IPS'));

-- Make sure RLS is enabled and policies exist
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_records ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they work correctly
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own academic records" ON academic_records;
DROP POLICY IF EXISTS "Users can insert own academic records" ON academic_records;
DROP POLICY IF EXISTS "Users can update own academic records" ON academic_records;
DROP POLICY IF EXISTS "Users can delete own academic records" ON academic_records;

CREATE POLICY "Users can view own academic records" ON academic_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own academic records" ON academic_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own academic records" ON academic_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own academic records" ON academic_records FOR DELETE USING (auth.uid() = user_id); 