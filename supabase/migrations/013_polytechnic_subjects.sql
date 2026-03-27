-- Add 'COMMON' to the department check constraint if it doesn't already allow it
-- First, drop the existing constraint on the subjects table if we need to
ALTER TABLE public.subjects DROP CONSTRAINT IF EXISTS subjects_department_check;

-- We don't necessarily have a strict check constraint on department, but let's make sure
-- the unique constraint matches exactly what the user asked for.
ALTER TABLE public.subjects DROP CONSTRAINT IF EXISTS subjects_code_department_semester_key;
ALTER TABLE public.subjects ADD CONSTRAINT subjects_code_department_semester_key UNIQUE (code, department, semester);

-- We need to ensure the columns are named correctly since we renamed 'code' to 'subject_code' 
-- and 'name' to 'subject_name' in Phase 3. 
-- The user request refers to 'code' and 'name'. I will alter the table back to 'code' and 'name'
-- or I will adjust the insert statements to use 'subject_code' and 'subject_name'.
-- Let's stick to the names we set in Phase 3 ('subject_code', 'subject_name') and adapt the inserts,
-- but the user explicitly requested a unique constraint on (code, department, semester).
-- Wait, let me rename the columns back to code and name to match the user's exact specification,
-- or just use the existing column names. Let's use the existing column names (subject_code, subject_name)
-- to avoid breaking everything we just fixed in Phase 3.

ALTER TABLE public.subjects DROP CONSTRAINT IF EXISTS subjects_subject_code_department_semester_key;
ALTER TABLE public.subjects ADD CONSTRAINT subjects_subject_code_department_semester_key UNIQUE (subject_code, department, semester);

-- Clear existing subjects
DELETE FROM public.subjects;

-- Semester 1 – Common Subjects (All Branches)
INSERT INTO public.subjects (subject_code, subject_name, department, semester, scheme, credits) VALUES
('MATHS1','Mathematics-I','COMMON',1,'N22', 4),
('AP1','Applied Physics-I','COMMON',1,'N22', 4),
('AC','Applied Chemistry','COMMON',1,'N22', 4),
('CSE','Communication Skills in English','COMMON',1,'N22', 3),
('SY','Sports & Yoga','COMMON',1,'N22', 2),
('IIT','Introduction to IT System','COMMON',1,'N22', 3),
('EG','Engineering Graphics','COMMON',1,'N22', 3);

-- Semester 2 – Common Subjects
INSERT INTO public.subjects (subject_code, subject_name, department, semester, scheme, credits) VALUES
('MATHS2','Mathematics-II','COMMON',2,'N22', 4),
('AP2','Applied Physics-II','COMMON',2,'N22', 4),
('ENV','Environmental Studies','COMMON',2,'N22', 3),
('ENG','Engineering Drawing','COMMON',2,'N22', 3),
('WSHOP','Workshop Practice','COMMON',2,'N22', 2);

-- Semester 3 – Computer Engineering
INSERT INTO public.subjects (subject_code, subject_name, department, semester, scheme, credits) VALUES
('CPUC','Computer Programming Using C','Computer Engineering',3,'N22', 4),
('OS','Operating System','Computer Engineering',3,'N22', 4),
('DCCN','Data Communication & Computer Networks','Computer Engineering',3,'N22', 4),
('CSA','Computer System Architecture','Computer Engineering',3,'N22', 4),
('WT','Web Technology','Computer Engineering',3,'N22', 4);

-- Semester 4 – Computer Engineering
INSERT INTO public.subjects (subject_code, subject_name, department, semester, scheme, credits) VALUES
('OOPS','Object Oriented Programming','Computer Engineering',4,'N22', 4),
('DBMS','Database Management System','Computer Engineering',4,'N22', 4),
('CN','Computer Networks','Computer Engineering',4,'N22', 3),
('DS','Data Structures','Computer Engineering',4,'N22', 4);

-- Semester 5 – Computer Engineering
INSERT INTO public.subjects (subject_code, subject_name, department, semester, scheme, credits) VALUES
('SE','Software Engineering','Computer Engineering',5,'N22', 4),
('EGOV','Introduction to e-Governance','Computer Engineering',5,'N22', 3),
('FOSS','Free and Open Source Software','Computer Engineering',5,'N22', 3),
('JAVA2','OOP using Java','Computer Engineering',5,'N22', 4),
('WP','Web Programming','Computer Engineering',5,'N22', 4),
('IOT','Internet of Things','Computer Engineering',5,'N22', 4);

-- Semester 6 – Computer Engineering
INSERT INTO public.subjects (subject_code, subject_name, department, semester, scheme, credits) VALUES
('DWDM','Data Warehousing and Data Mining','Computer Engineering',6,'N22', 4),
('MA','Multimedia Applications','Computer Engineering',6,'N22', 4),
('ENTRE','Entrepreneurship','Computer Engineering',6,'N22', 3),
('MP','Major Project','Computer Engineering',6,'N22', 6),
('SEM','Seminar','Computer Engineering',6,'N22', 2);
