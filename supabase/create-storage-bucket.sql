-- Create the certifications storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certifications',
  'certifications', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Create RLS policies for the bucket
CREATE POLICY "Users can upload their own certificates" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'certifications' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view certificates" ON storage.objects
FOR SELECT USING (bucket_id = 'certifications');

CREATE POLICY "Users can update their own certificates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'certifications' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own certificates" ON storage.objects
FOR DELETE USING (
  bucket_id = 'certifications' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);