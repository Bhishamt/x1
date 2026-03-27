-- ============================================================
-- SEED: SUBJECTS FOR ALL DEPARTMENTS
-- Based on diploma timetable / curriculum (Scheme N22)
-- ============================================================

-- ============================================================
-- COMPUTER ENGINEERING
-- ============================================================

-- Semester 1 (common first year)
INSERT INTO public.subjects (code, name, department, semester, scheme, credits) VALUES
('ENG-101', 'English', 'Computer Engineering', 1, 'N22', 3),
('MATH-101', 'Applied Mathematics - I', 'Computer Engineering', 1, 'N22', 4),
('PHY-101', 'Applied Physics', 'Computer Engineering', 1, 'N22', 3),
('CHEM-101', 'Applied Chemistry', 'Computer Engineering', 1, 'N22', 3),
('IT-101', 'IT Fundamentals', 'Computer Engineering', 1, 'N22', 3),
('WS-101', 'Workshop Practice', 'Computer Engineering', 1, 'N22', 2)
ON CONFLICT (code, department, semester, scheme) DO NOTHING;

-- Semester 2
INSERT INTO public.subjects (code, name, department, semester, scheme, credits) VALUES
('ENG-201', 'Communication Skills', 'Computer Engineering', 2, 'N22', 3),
('MATH-201', 'Applied Mathematics - II', 'Computer Engineering', 2, 'N22', 4),
('EE-201', 'Basic Electrical Engineering', 'Computer Engineering', 2, 'N22', 3),
('EC-201', 'Basic Electronics', 'Computer Engineering', 2, 'N22', 3),
('ED-201', 'Engineering Drawing', 'Computer Engineering', 2, 'N22', 3)
ON CONFLICT (code, department, semester, scheme) DO NOTHING;

-- Semester 3
INSERT INTO public.subjects (code, name, department, semester, scheme, credits) VALUES
('CPUC', 'Computer Programming Using C', 'Computer Engineering', 3, 'N22', 4),
('OS', 'Operating System', 'Computer Engineering', 3, 'N22', 4),
('DCCN', 'Data Communication & Computer Networks', 'Computer Engineering', 3, 'N22', 4),
('CSA', 'Computer System Architecture', 'Computer Engineering', 3, 'N22', 3),
('WT', 'Web Technology', 'Computer Engineering', 3, 'N22', 4)
ON CONFLICT (code, department, semester, scheme) DO NOTHING;

-- Semester 4
INSERT INTO public.subjects (code, name, department, semester, scheme, credits) VALUES
('DS', 'Data Structures', 'Computer Engineering', 4, 'N22', 4),
('DBMS', 'Database Management System', 'Computer Engineering', 4, 'N22', 4),
('OOP-CPP', 'OOP using C++', 'Computer Engineering', 4, 'N22', 4),
('CN', 'Computer Networks', 'Computer Engineering', 4, 'N22', 3),
('SS', 'System Software', 'Computer Engineering', 4, 'N22', 3)
ON CONFLICT (code, department, semester, scheme) DO NOTHING;

-- Semester 5
INSERT INTO public.subjects (code, name, department, semester, scheme, credits) VALUES
('SE', 'Software Engineering', 'Computer Engineering', 5, 'N22', 4),
('EG', 'Introduction to e-Governance', 'Computer Engineering', 5, 'N22', 3),
('FOSS', 'Free and Open Source Software', 'Computer Engineering', 5, 'N22', 3),
('JAVA', 'OOP using Java', 'Computer Engineering', 5, 'N22', 4),
('WP', 'Web Programming', 'Computer Engineering', 5, 'N22', 4),
('IOT', 'Internet of Things', 'Computer Engineering', 5, 'N22', 3)
ON CONFLICT (code, department, semester, scheme) DO NOTHING;

-- Semester 6
INSERT INTO public.subjects (code, name, department, semester, scheme, credits) VALUES
('PYTHON', 'Python Programming', 'Computer Engineering', 6, 'N22', 4),
('AI', 'Artificial Intelligence', 'Computer Engineering', 6, 'N22', 3),
('CC', 'Cloud Computing', 'Computer Engineering', 6, 'N22', 3),
('MP', 'Major Project', 'Computer Engineering', 6, 'N22', 6),
('CYBER', 'Cyber Security', 'Computer Engineering', 6, 'N22', 3)
ON CONFLICT (code, department, semester, scheme) DO NOTHING;

-- ============================================================
-- CIVIL ENGINEERING
-- ============================================================
INSERT INTO public.subjects (code, name, department, semester, scheme, credits) VALUES
('SM', 'Strength of Materials', 'Civil Engineering', 3, 'N22', 4),
('SUR', 'Surveying', 'Civil Engineering', 3, 'N22', 4),
('BM', 'Building Materials', 'Civil Engineering', 3, 'N22', 3),
('FM', 'Fluid Mechanics', 'Civil Engineering', 3, 'N22', 4),
('BC', 'Building Construction', 'Civil Engineering', 3, 'N22', 3),
('RCC', 'Reinforced Cement Concrete', 'Civil Engineering', 5, 'N22', 4),
('EST', 'Estimation & Costing', 'Civil Engineering', 5, 'N22', 4),
('TRP', 'Transportation Engineering', 'Civil Engineering', 5, 'N22', 3),
('ENV', 'Environmental Engineering', 'Civil Engineering', 5, 'N22', 3),
('IWS', 'Irrigation & Water Supply', 'Civil Engineering', 5, 'N22', 4)
ON CONFLICT (code, department, semester, scheme) DO NOTHING;

-- ============================================================
-- MECHANICAL ENGINEERING
-- ============================================================
INSERT INTO public.subjects (code, name, department, semester, scheme, credits) VALUES
('TOM', 'Theory of Machines', 'Mechanical Engineering', 3, 'N22', 4),
('MFP', 'Manufacturing Process', 'Mechanical Engineering', 3, 'N22', 4),
('TD', 'Thermal Engineering', 'Mechanical Engineering', 3, 'N22', 4),
('MOS', 'Mechanics of Solids', 'Mechanical Engineering', 3, 'N22', 3),
('MD-I', 'Machine Drawing - I', 'Mechanical Engineering', 3, 'N22', 3),
('RAC', 'Refrigeration & AC', 'Mechanical Engineering', 5, 'N22', 4),
('CAD', 'Computer Aided Design', 'Mechanical Engineering', 5, 'N22', 4),
('ICE', 'IC Engines', 'Mechanical Engineering', 5, 'N22', 3),
('HMT', 'Heat & Mass Transfer', 'Mechanical Engineering', 5, 'N22', 3),
('IE', 'Industrial Engineering', 'Mechanical Engineering', 5, 'N22', 3)
ON CONFLICT (code, department, semester, scheme) DO NOTHING;

-- ============================================================
-- ELECTRICAL ENGINEERING
-- ============================================================
INSERT INTO public.subjects (code, name, department, semester, scheme, credits) VALUES
('EM', 'Electrical Machines', 'Electrical Engineering', 3, 'N22', 4),
('NWK', 'Network Theory', 'Electrical Engineering', 3, 'N22', 4),
('EMI', 'Electrical Measurements', 'Electrical Engineering', 3, 'N22', 3),
('EMF', 'Electromagnetic Field', 'Electrical Engineering', 3, 'N22', 3),
('DEE', 'Digital Electronics', 'Electrical Engineering', 3, 'N22', 4),
('PS', 'Power Systems', 'Electrical Engineering', 5, 'N22', 4),
('PE', 'Power Electronics', 'Electrical Engineering', 5, 'N22', 4),
('SG', 'Switchgear & Protection', 'Electrical Engineering', 5, 'N22', 3),
('EW', 'Electrical Wiring', 'Electrical Engineering', 5, 'N22', 3),
('CT', 'Control Systems', 'Electrical Engineering', 5, 'N22', 4)
ON CONFLICT (code, department, semester, scheme) DO NOTHING;

-- ============================================================
-- ELECTRONICS & COMMUNICATION ENGINEERING
-- ============================================================
INSERT INTO public.subjects (code, name, department, semester, scheme, credits) VALUES
('AE', 'Analog Electronics', 'Electronics & Communication', 3, 'N22', 4),
('DLC', 'Digital Logic Circuits', 'Electronics & Communication', 3, 'N22', 4),
('EMT', 'Electronic Measurements', 'Electronics & Communication', 3, 'N22', 3),
('SS-EC', 'Signals & Systems', 'Electronics & Communication', 3, 'N22', 4),
('NT', 'Network Theory', 'Electronics & Communication', 3, 'N22', 3),
('MC', 'Microcontrollers', 'Electronics & Communication', 5, 'N22', 4),
('DC', 'Digital Communication', 'Electronics & Communication', 5, 'N22', 4),
('MP-EC', 'Microprocessors', 'Electronics & Communication', 5, 'N22', 3),
('VLSI', 'VLSI Design', 'Electronics & Communication', 5, 'N22', 3),
('AC', 'Advanced Communication', 'Electronics & Communication', 5, 'N22', 4)
ON CONFLICT (code, department, semester, scheme) DO NOTHING;

-- ============================================================
-- INFORMATION TECHNOLOGY
-- ============================================================
INSERT INTO public.subjects (code, name, department, semester, scheme, credits) VALUES
('PF', 'Programming Fundamentals', 'Information Technology', 3, 'N22', 4),
('OS-IT', 'Operating Systems', 'Information Technology', 3, 'N22', 4),
('DCN', 'Data Communication & Networks', 'Information Technology', 3, 'N22', 4),
('DM', 'Discrete Mathematics', 'Information Technology', 3, 'N22', 3),
('WD', 'Web Development', 'Information Technology', 3, 'N22', 4),
('SE-IT', 'Software Engineering', 'Information Technology', 5, 'N22', 4),
('JAVA-IT', 'Java Programming', 'Information Technology', 5, 'N22', 4),
('IS', 'Information Security', 'Information Technology', 5, 'N22', 3),
('SA', 'System Administration', 'Information Technology', 5, 'N22', 3),
('MAD', 'Mobile App Development', 'Information Technology', 5, 'N22', 4)
ON CONFLICT (code, department, semester, scheme) DO NOTHING;
