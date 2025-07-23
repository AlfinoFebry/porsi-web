-- Quick fix for admin RLS policies
-- Run this in your Supabase SQL Editor to allow admins to view all student data

-- Method 1: Create a security definer function to check admin status
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profil 
    WHERE id = auth.uid() 
    AND tipe_user = 'admin'
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Update the profil table policy to allow admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profil;
CREATE POLICY "Admins can view all profiles" ON profil FOR SELECT USING (
  auth.uid() = id OR is_admin()
);

-- Update the data_akademik table policies for admins
DROP POLICY IF EXISTS "Admins can view all academic records" ON data_akademik;
CREATE POLICY "Admins can view all academic records" ON data_akademik FOR SELECT USING (
  auth.uid() = user_id OR is_admin()
);

DROP POLICY IF EXISTS "Admins can update all academic records" ON data_akademik;
CREATE POLICY "Admins can update all academic records" ON data_akademik FOR UPDATE USING (
  auth.uid() = user_id OR is_admin()
);

-- Alternative Method 2: If the above doesn't work, temporarily disable RLS for testing
-- UNCOMMENT THESE LINES ONLY FOR TESTING (NOT RECOMMENDED FOR PRODUCTION)
-- ALTER TABLE profil DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE data_akademik DISABLE ROW LEVEL SECURITY;

-- To re-enable RLS later (run this after testing):
-- ALTER TABLE profil ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE data_akademik ENABLE ROW LEVEL SECURITY;