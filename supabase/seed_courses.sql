DELETE FROM public.results;
DELETE FROM public.courses;

INSERT INTO public.courses (code, name, department, year, semester, credits, description, is_active) VALUES

-- FIRST YEAR (COMMON)
('N22-FY-COMMON', 'N-2022 First Year Curriculum (Common)', 'All Departments', 1, 1, 0,
'https://www.hptechboard.com/syllabus-polytechnic', true),

('N22-FY-ARCH', 'N-2022 First Year Architecture Curriculum', 'Architecture Assistantship', 1, 1, 0,
'https://www.hptechboard.com/syllabus-polytechnic', true),

-- SECOND YEAR (3rd & 4th SEM)
('N22-SY-CE', 'N-2022 2nd Year Curriculum', 'Computer Engineering', 2, 3, 0,
'https://www.hptechboard.com/syllabus-polytechnic', true),

('N22-SY-CV', 'N-2022 2nd Year Curriculum', 'Civil Engineering', 2, 3, 0,
'https://www.hptechboard.com/syllabus-polytechnic', true),

('N22-SY-ME', 'N-2022 2nd Year Curriculum', 'Mechanical Engineering', 2, 3, 0,
'https://www.hptechboard.com/syllabus-polytechnic', true),

('N22-SY-EE', 'N-2022 2nd Year Curriculum', 'Electrical Engineering', 2, 3, 0,
'https://www.hptechboard.com/syllabus-polytechnic', true),

('N22-SY-EC', 'N-2022 2nd Year Curriculum', 'Electronics & Communication Engineering', 2, 3, 0,
'https://www.hptechboard.com/syllabus-polytechnic', true),

('N22-SY-IT', 'N-2022 2nd Year Curriculum', 'Information Technology', 2, 3, 0,
'https://www.hptechboard.com/syllabus-polytechnic', true),

-- THIRD YEAR (5th & 6th SEM)
('N22-TY-CE', 'N-2022 3rd Year Curriculum', 'Computer Engineering', 3, 5, 0,
'https://www.hptechboard.com/assets/ckfinder/userfiles/files/Syllabus_3rd%20year_N22/Computer%20Engg%203rd%20Year%20(1).pdf', true),

('N22-TY-CV', 'N-2022 3rd Year Curriculum', 'Civil Engineering', 3, 5, 0,
'https://www.hptechboard.com/syllabus-polytechnic', true),

('N22-TY-ME', 'N-2022 3rd Year Curriculum', 'Mechanical Engineering', 3, 5, 0,
'https://www.hptechboard.com/syllabus-polytechnic', true),

('N22-TY-EE', 'N-2022 3rd Year Curriculum', 'Electrical Engineering', 3, 5, 0,
'https://www.hptechboard.com/syllabus-polytechnic', true)

ON CONFLICT DO NOTHING;
