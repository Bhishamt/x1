-- Update result_corrections foreign key to ON DELETE CASCADE for student_id
ALTER TABLE public.result_corrections
  DROP CONSTRAINT IF EXISTS result_corrections_student_id_fkey;

ALTER TABLE public.result_corrections
  ADD CONSTRAINT result_corrections_student_id_fkey
  FOREIGN KEY (student_id)
  REFERENCES public.users(id)
  ON DELETE CASCADE;
