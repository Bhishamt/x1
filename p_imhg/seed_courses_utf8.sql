-- Insert structured subjects for the updated Courses Hierarchy
-- Run this in your Supabase SQL Editor to populate sample syllabus data.

INSERT INTO public.courses (code, name, department, year, semester, credits, description, is_active) VALUES

-- Computer Engineering (1st Year)
('CE101', 'Mathematics-I', 'Computer Engineering', 1, 1, 4, 'Applied mathematics including calculus and algebra.', true),
('CE102', 'Applied Physics', 'Computer Engineering', 1, 1, 3, 'Basic physics principles for engineering.', true),
('CE103', 'Communication Skills', 'Computer Engineering', 1, 1, 2, 'English communication and professional writing.', true),
('CE201', 'Applied Chemistry', 'Computer Engineering', 1, 2, 3, 'Industrial chemistry and materials science.', true),
('CE202', 'Programming in C', 'Computer Engineering', 1, 2, 4, 'Introduction to computer programming.', true),

-- Computer Engineering (2nd Year)
('CE301', 'Data Structures', 'Computer Engineering', 2, 3, 4, 'Advanced C programming and data structures.', true),
('CE302', 'Digital Electronics', 'Computer Engineering', 2, 3, 3, 'Logic gates, boolean algebra, and circuits.', true),
('CE401', 'Database Management', 'Computer Engineering', 2, 4, 4, 'Relational databases and SQL.', true),
('CE402', 'Operating Systems', 'Computer Engineering', 2, 4, 3, 'OS concepts, processes, and memory management.', true),

-- Computer Engineering (3rd Year)
('CE501', 'Computer Networks', 'Computer Engineering', 3, 5, 4, 'OSI model, TCP/IP, and network security.', true),
('CE502', 'Web Technologies', 'Computer Engineering', 3, 5, 4, 'HTML, CSS, JavaScript, and backend basics.', true),
('CE601', 'Software Engineering', 'Computer Engineering', 3, 6, 4, 'Software development lifecycles and testing.', true),
('CE602', 'Major Project', 'Computer Engineering', 3, 6, 6, 'Final year hands-on project.', true),

-- Civil Engineering (1st Year)
('CV101', 'Mathematics-I', 'Civil Engineering', 1, 1, 4, 'Applied mathematical analysis.', true),
('CV102', 'Applied Physics', 'Civil Engineering', 1, 1, 3, 'Physics fundamentals.', true),
('CV201', 'Engineering Mechanics', 'Civil Engineering', 1, 2, 4, 'Forces, motion, and structural basics.', true),

-- Civil Engineering (2nd Year)
('CV301', 'Fluid Mechanics', 'Civil Engineering', 2, 3, 4, 'Properties of fluids and flow.', true),
('CV302', 'Surveying-I', 'Civil Engineering', 2, 3, 4, 'Topographical surveying techniques.', true),
('CV401', 'Highway Engineering', 'Civil Engineering', 2, 4, 3, 'Road construction and materials.', true),

-- Civil Engineering (3rd Year)
('CV501', 'RCC Design', 'Civil Engineering', 3, 5, 4, 'Reinforced concrete structures.', true),
('CV601', 'Estimating & Costing', 'Civil Engineering', 3, 6, 3, 'Construction project estimation.', true),

-- Mechanical Engineering (1st Year)
('ME101', 'Mathematics-I', 'Mechanical Engineering', 1, 1, 4, 'Mathematical tools for mechanics.', true),
('ME201', 'Basic Workshop Practice', 'Mechanical Engineering', 1, 2, 3, 'Hands-on tools and machining.', true),

-- Mechanical Engineering (2nd Year)
('ME301', 'Strength of Materials', 'Mechanical Engineering', 2, 3, 4, 'Stress, strain, and material testing.', true),
('ME401', 'Thermal Engineering', 'Mechanical Engineering', 2, 4, 4, 'Thermodynamics and heat engines.', true),

-- Mechanical Engineering (3rd Year)
('ME501', 'Automobile Engineering', 'Mechanical Engineering', 3, 5, 3, 'Vehicle systems and mechanics.', true),
('ME601', 'Industrial Management', 'Mechanical Engineering', 3, 6, 3, 'Factory operations and safety.', true),

-- Electrical Engineering (1st Year)
('EE101', 'Mathematics-I', 'Electrical Engineering', 1, 1, 4, 'Calculus and differential equations.', true),
('EE201', 'Basics of IT', 'Electrical Engineering', 1, 2, 2, 'Computer fundamentals.', true),

-- Electrical Engineering (2nd Year)
('EE301', 'Electrical Machines-I', 'Electrical Engineering', 2, 3, 4, 'DC machines and transformers.', true),
('EE401', 'Electrical Measurements', 'Electrical Engineering', 2, 4, 4, 'Measuring instruments and errors.', true),

-- Electrical Engineering (3rd Year)
('EE501', 'Power Systems', 'Electrical Engineering', 3, 5, 4, 'Generation, transmission, and distribution.', true),
('EE601', 'Microcontrollers', 'Electrical Engineering', 3, 6, 4, '8051 architecture and programming.', true)

ON CONFLICT DO NOTHING;
