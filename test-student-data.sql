-- Test student data for admin functionality
-- Run this in your Supabase SQL Editor to create test students

-- Insert test students with the same school as admin
INSERT INTO profil (id, nama, email, nama_sekolah, jurusan, kelas, tipe_user, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'John Doe', 'john.doe@student.com', 'SMAN 1 Ngantang', 'IPA', '12', 'siswa', NOW(), NOW()),
  (gen_random_uuid(), 'Jane Smith', 'jane.smith@student.com', 'SMAN 1 Ngantang', 'IPS', '11', 'siswa', NOW(), NOW()),
  (gen_random_uuid(), 'Bob Wilson', 'bob.wilson@student.com', 'SMAN 1 Ngantang', 'IPA', '10', 'siswa', NOW(), NOW());

-- Insert some test academic records for the students
-- Note: You'll need to replace the user_id values with actual IDs from the students above
-- This is just an example structure

-- Get the student IDs first (run this to see the IDs)
SELECT id, nama, email FROM profil WHERE tipe_user = 'siswa' AND nama_sekolah = 'SMAN 1 Ngantang';

-- Then insert academic records using the actual IDs
-- Example (replace 'student-id-here' with actual UUIDs from above query):
/*
INSERT INTO data_akademik (user_id, mapel, semester, nilai, created_at, updated_at)
VALUES 
  ('student-id-here', 'Matematika', 1, 85, NOW(), NOW()),
  ('student-id-here', 'Fisika', 1, 78, NOW(), NOW()),
  ('student-id-here', 'Kimia', 1, 92, NOW(), NOW());
*/