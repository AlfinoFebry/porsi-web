-- Extend semester range to up to 6
ALTER TABLE academic_records
  DROP CONSTRAINT IF EXISTS academic_records_semester_check;

ALTER TABLE academic_records
  ADD CONSTRAINT academic_records_semester_check CHECK (semester BETWEEN 1 AND 6); 