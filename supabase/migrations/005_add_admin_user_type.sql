-- Migration: Add "admin" to allowed values for user_type in profiles table
-- This migration updates the CHECK constraint so that the value "admin" is accepted.

-- Drop existing constraint (name may differ across environments, so use IF EXISTS)
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_user_type_check;

-- Re-add constraint with the new allowed value list
ALTER TABLE profiles
  ADD CONSTRAINT profiles_user_type_check
    CHECK (user_type IN ('siswa', 'alumni', 'admin')); 