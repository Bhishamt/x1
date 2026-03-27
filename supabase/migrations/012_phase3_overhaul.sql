-- ============================================================
-- MIGRATION 012: SCHEMA OVERHAUL & SUBJECT SEEDING
-- 1. Modify users: roll_no (TEXT -> INT), add semester (SMALLINT)
-- 2. Modify subjects: rename columns, clear and seed updated CE subjects
-- 3. Cleanup courses table
-- ============================================================

-- 1. USERS TABLE UPDATES
-- Add semester column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS semester SMALLINT DEFAULT 1;

-- Convert roll_no to INTEGER
-- First, strip any non-numeric characters from existing roll numbers (e.g., 'CE001' -> '001')
UPDATE public.users 
SET roll_no = regexp_replace(roll_no, '[^0-9]', '', 'g')
WHERE roll_no IS NOT NULL;

-- Handle empty roll numbers (set to 0 or something valid)
UPDATE public.users SET roll_no = '0' WHERE roll_no = '' OR roll_no IS NULL;

-- Change column type
ALTER TABLE public.users 
ALTER COLUMN roll_no TYPE INTEGER USING roll_no::INTEGER;

-- 2. SUBJECTS TABLE UPDATES
-- Rename columns
ALTER TABLE public.subjects RENAME COLUMN code TO subject_code;
ALTER TABLE public.subjects RENAME COLUMN name TO subject_name;

-- Clear all existing subjects to start fresh
DELETE FROM public.subjects;

-- Seed updated COMPUTER ENGINEERING subjects (Sem 1-6)
-- Semester 1
INSERT INTO public.subjects (subject_code, subject_name, department, semester, scheme, credits) VALUES
('CE101', 'Applied Mathematics I', 'Computer Engineering', 1, 'N22', 4),
('CE102', 'Applied Physics', 'Computer Engineering', 1, 'N22', 3),
('CE103', 'Basic Electrical Engineering', 'Computer Engineering', 1, 'N22', 3),
('CE104', 'Engineering Graphics', 'Computer Engineering', 1, 'N22', 3),
('CE105', 'Communication Skills', 'Computer Engineering', 1, 'N22', 3);

-- Semester 2
INSERT INTO public.subjects (subject_code, subject_name, department, semester, scheme, credits) VALUES
('CE201', 'Applied Mathematics II', 'Computer Engineering', 2, 'N22', 4),
('CE202', 'Applied Chemistry', 'Computer Engineering', 2, 'N22', 3),
('CE203', 'Basic Electronics', 'Computer Engineering', 2, 'N22', 3),
('CE204', 'Environmental Studies', 'Computer Engineering', 2, 'N22', 3),
('CE205', 'Engineering Workshop', 'Computer Engineering', 2, 'N22', 2);

-- Semester 3
INSERT INTO public.subjects (subject_code, subject_name, department, semester, scheme, credits) VALUES
('CE301', 'Programming Using C', 'Computer Engineering', 3, 'N22', 4),
('CE302', 'Data Structures', 'Computer Engineering', 3, 'N22', 4),
('CE303', 'Digital Electronics', 'Computer Engineering', 3, 'N22', 3),
('CE304', 'Computer Organization', 'Computer Engineering', 3, 'N22', 3),
('CE305', 'Operating System', 'Computer Engineering', 3, 'N22', 4);

-- Semester 4
INSERT INTO public.subjects (subject_code, subject_name, department, semester, scheme, credits) VALUES
('CE401', 'Database Management System', 'Computer Engineering', 4, 'N22', 4),
('CE402', 'Java Programming', 'Computer Engineering', 4, 'N22', 4),
('CE403', 'Computer Networks', 'Computer Engineering', 4, 'N22', 3),
('CE404', 'Software Engineering', 'Computer Engineering', 4, 'N22', 4),
('CE405', 'Microprocessors', 'Computer Engineering', 4, 'N22', 3);

-- Semester 5
INSERT INTO public.subjects (subject_code, subject_name, department, semester, scheme, credits) VALUES
('CE501', 'Web Technology', 'Computer Engineering', 5, 'N22', 4),
('CE502', 'Artificial Intelligence', 'Computer Engineering', 5, 'N22', 3),
('CE503', 'Mobile Application Development', 'Computer Engineering', 5, 'N22', 4),
('CE504', 'Cyber Security', 'Computer Engineering', 5, 'N22', 3),
('CE505', 'Cloud Computing', 'Computer Engineering', 5, 'N22', 3);

-- Semester 6
INSERT INTO public.subjects (subject_code, subject_name, department, semester, scheme, credits) VALUES
('CE601', 'Multimedia', 'Computer Engineering', 6, 'N22', 3),
('CE602', 'Indian Constitution', 'Computer Engineering', 6, 'N22', 2),
('CE603', 'Data Warehouse', 'Computer Engineering', 6, 'N22', 3),
('CE604', 'Scripting Language', 'Computer Engineering', 6, 'N22', 3),
('CE605', 'Major Project', 'Computer Engineering', 6, 'N22', 6);

-- 3. COURSES TABLE CLEANUP
-- Delete all and keep only department-level placeholders for others
DELETE FROM public.courses;

INSERT INTO public.courses (name, code, department, semester, scheme) VALUES
('Civil Engineering', 'CIVIL-GEN', 'Civil Engineering', 1, 'N22'),
('Mechanical Engineering', 'MECH-GEN', 'Mechanical Engineering', 1, 'N22'),
('Electrical Engineering', 'ELEC-GEN', 'Electrical Engineering', 1, 'N22'),
('Electronics & Communication', 'EC-GEN', 'Electronics & Communication', 1, 'N22'),
('Information Technology', 'IT-GEN', 'Information Technology', 1, 'N22'),
('Architecture', 'ARCH-GEN', 'Architecture', 1, 'N22');

-- 4. UPDATE EXISTING STUDENTS (Optional cleanup fix)
-- Reset roll numbers for existing dummy students to sequential integers based on their department/year
-- We'll do this for Computer Engineering as a priority
WITH StudentRank AS (
  SELECT id, ROW_NUMBER() OVER(PARTITION BY department, year ORDER BY id) as new_roll
  FROM public.users
  WHERE role_id = 5
)
UPDATE public.users u
SET roll_no = sr.new_roll
FROM StudentRank sr
WHERE u.id = sr.id;

-- Set semester for CE students based on Year
UPDATE public.users SET semester = 1 WHERE year = 1 AND department = 'Computer Engineering';
UPDATE public.users SET semester = 3 WHERE year = 2 AND department = 'Computer Engineering';
UPDATE public.users SET semester = 5 WHERE year = 3 AND department = 'Computer Engineering';
