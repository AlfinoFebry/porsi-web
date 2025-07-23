-- Fix storage RLS policies for certifications bucket
-- Run this in your Supabase SQL Editor

-- First, enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload their own certificates" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view certificates" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own certificates" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own certificates" ON storage.objects;

-- Create new policies for the certifications bucket
-- Policy 1: Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload their own certificates" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'certifications' AND 
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow users to view only their own certificate files
CREATE POLICY "Users can view their own certificates" ON storage.objects
FOR SELECT USING (
  bucket_id = 'certifications' AND 
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow users to update their own certificate files
CREATE POLICY "Users can update their own certificates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'certifications' AND 
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow users to delete their own certificate files
CREATE POLICY "Users can delete their own certificates" ON storage.objects
FOR DELETE USING (
  bucket_id = 'certifications' AND 
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Alternative: If the above policies don't work, you can temporarily disable RLS for testing
-- UNCOMMENT THE LINE BELOW ONLY FOR TESTING (NOT RECOMMENDED FOR PRODUCTION)
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- To re-enable RLS later (run this after testing):
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;