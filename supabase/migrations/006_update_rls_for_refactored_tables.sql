-- Migration to update RLS policies for refactored table names
-- This addresses the "new row violates row-level security policy for table 'profil'" error

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profil;
DROP POLICY IF EXISTS "Users can update own profile" ON profil;
DROP POLICY IF EXISTS "Users can insert own profile" ON profil;

-- Create new policies for profil table (renamed from profiles)
CREATE POLICY "Users can view own profile" ON profil FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profil FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profil FOR INSERT WITH CHECK (auth.uid() = id);

-- Drop old policies for academic records if they exist
DROP POLICY IF EXISTS "Users can view own academic records" ON data_akademik;
DROP POLICY IF EXISTS "Users can insert own academic records" ON data_akademik;
DROP POLICY IF EXISTS "Users can update own academic records" ON data_akademik;
DROP POLICY IF EXISTS "Users can delete own academic records" ON data_akademik;

-- Create new policies for data_akademik table (renamed from academic_records)
CREATE POLICY "Users can view own academic records" ON data_akademik FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own academic records" ON data_akademik FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own academic records" ON data_akademik FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own academic records" ON data_akademik FOR DELETE USING (auth.uid() = user_id);

-- Admin policies - allow admins to view and update all student data
CREATE POLICY "Admins can view all profiles" ON profil FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profil p 
    WHERE p.id = auth.uid() AND p.tipe_user = 'admin'
  )
);

CREATE POLICY "Admins can update all academic records" ON data_akademik FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profil p 
    WHERE p.id = auth.uid() AND p.tipe_user = 'admin'
  )
);

CREATE POLICY "Admins can view all academic records" ON data_akademik FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profil p 
    WHERE p.id = auth.uid() AND p.tipe_user = 'admin'
  )
);

-- Ensure RLS is enabled on all tables
ALTER TABLE profil ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_akademik ENABLE ROW LEVEL SECURITY;

-- Add policies for other refactored tables if they exist
DO $$ 
BEGIN
  -- Check if sertifikat table exists and add policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sertifikat') THEN
    ALTER TABLE sertifikat ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own achievements" ON sertifikat;
    DROP POLICY IF EXISTS "Users can insert own achievements" ON sertifikat;
    DROP POLICY IF EXISTS "Users can update own achievements" ON sertifikat;
    DROP POLICY IF EXISTS "Users can delete own achievements" ON sertifikat;
    
    CREATE POLICY "Users can view own achievements" ON sertifikat FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own achievements" ON sertifikat FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own achievements" ON sertifikat FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own achievements" ON sertifikat FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- Check if organisasi table exists and add policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organisasi') THEN
    ALTER TABLE organisasi ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own organizations" ON organisasi;
    DROP POLICY IF EXISTS "Users can insert own organizations" ON organisasi;
    DROP POLICY IF EXISTS "Users can update own organizations" ON organisasi;
    DROP POLICY IF EXISTS "Users can delete own organizations" ON organisasi;
    
    CREATE POLICY "Users can view own organizations" ON organisasi FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own organizations" ON organisasi FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own organizations" ON organisasi FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own organizations" ON organisasi FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- Check if mapel_lintas_minat table exists and add policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'mapel_lintas_minat') THEN
    ALTER TABLE mapel_lintas_minat ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own additional subjects" ON mapel_lintas_minat;
    DROP POLICY IF EXISTS "Users can insert own additional subjects" ON mapel_lintas_minat;
    DROP POLICY IF EXISTS "Users can update own additional subjects" ON mapel_lintas_minat;
    DROP POLICY IF EXISTS "Users can delete own additional subjects" ON mapel_lintas_minat;
    
    CREATE POLICY "Users can view own additional subjects" ON mapel_lintas_minat FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own additional subjects" ON mapel_lintas_minat FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own additional subjects" ON mapel_lintas_minat FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own additional subjects" ON mapel_lintas_minat FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;