-- Drop the view because it depends on the column
DROP VIEW IF EXISTS public.student_result_summary;

-- Rename the column
ALTER TABLE public.results RENAME COLUMN marks TO marks_obtained;

-- Recreate the view with the new column name
CREATE VIEW public.student_result_summary AS
 SELECT r.student_id,
    u.full_name,
    u.roll_no,
    r.academic_year,
    r.semester,
    count(r.id) AS total_subjects,
    round(avg(((r.marks_obtained / r.max_marks) * (100)::numeric)), 2) AS percentage,
    sum(
        CASE
            WHEN (r.grade = 'F'::text) THEN 1
            ELSE 0
        END) AS failed_subjects
   FROM (results r
     JOIN users u ON ((u.id = r.student_id)))
  GROUP BY r.student_id, u.full_name, u.roll_no, r.academic_year, r.semester;

-- Add strict check constraints to results table
ALTER TABLE public.results DROP CONSTRAINT IF EXISTS check_marks_limit;
ALTER TABLE public.results ADD CONSTRAINT check_marks_limit
CHECK (
  marks_obtained >= 0 AND
  marks_obtained <= max_marks AND
  (
    (exam_type IN ('class_test_1', 'class_test_2') AND max_marks = 30 AND marks_obtained <= 30) OR
    (exam_type IN ('house_test', 'final_exam') AND max_marks = 60 AND marks_obtained <= 60)
  )
);
