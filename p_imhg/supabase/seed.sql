-- ============================================================
-- COLLEGE DIGITAL PLATFORM — SEED DATA
-- Run AFTER schema.sql and rls.sql
-- NOTE: Users must first be created via Supabase Auth dashboard
--       (Authentication > Users > Invite User) to get valid UUIDs.
--       Replace the UUIDs below with actual auth user IDs.
-- ============================================================

-- Demo Admin User (replace UUID after creating in Auth)
-- bhishamthakur012@gmail.com /  admin123
INSERT INTO public.users (id, role_id, full_name, email, department) VALUES
  ('e65d2dbc-e28f-43e6-bd39-d557d922f29b', 1, 'Dr. bhisham thakur', 'bhishamthakur012@gmail.com', 'Administration')
ON CONFLICT (id) DO NOTHING;

-- Demo Student Users
-- student1@abcpolytechnic.edu  /  Student@123
INSERT INTO public.users (id, role_id, full_name, email, roll_no, department, year) VALUES
  ('fd1091cf-9175-4b03-9b76-3d37b5b09f83', 2, 'Ananya Sharma', 'student1@abcpolytechnic.edu', 'CS2024001', 'Computer Science', 3),
  ('0f9fa838-98ed-4da7-972a-20aa4987904b', 2, 'Ravi Patel',    'student2@abcpolytechnic.edu', 'CS2024002', 'Computer Science', 3)
ON CONFLICT (id) DO NOTHING;

-- Sample Courses
INSERT INTO public.courses (code, name, department, year, semester, credits, description) VALUES
  ('CS301', 'Data Structures & Algorithms', 'Computer Science', 3, 5, 4, 'Core DSA course'),
  ('CS302', 'Database Management Systems',  'Computer Science', 3, 5, 4, 'RDBMS fundamentals'),
  ('CS303', 'Operating Systems',            'Computer Science', 3, 5, 3, 'OS concepts and internals'),
  ('CS304', 'Computer Networks',            'Computer Science', 3, 5, 3, 'TCP/IP and networking'),
  ('CS305', 'Web Technologies',             'Computer Science', 3, 5, 3, 'HTML, CSS, JS, React')
ON CONFLICT (code) DO NOTHING;

-- Sample Results (for student1)
INSERT INTO public.results (student_id, course_id, exam_type, marks_obtained, max_marks, semester, academic_year) VALUES
  ('fd1091cf-9175-4b03-9b76-3d37b5b09f83', (SELECT id FROM public.courses WHERE code='CS301'), 'final', 85, 100, 5, '2024-25'),
  ('fd1091cf-9175-4b03-9b76-3d37b5b09f83', (SELECT id FROM public.courses WHERE code='CS302'), 'final', 78, 100, 5, '2024-25'),
  ('fd1091cf-9175-4b03-9b76-3d37b5b09f83', (SELECT id FROM public.courses WHERE code='CS303'), 'final', 91, 100, 5, '2024-25'),
  ('fd1091cf-9175-4b03-9b76-3d37b5b09f83', (SELECT id FROM public.courses WHERE code='CS304'), 'final', 72, 100, 5, '2024-25'),
  ('fd1091cf-9175-4b03-9b76-3d37b5b09f83', (SELECT id FROM public.courses WHERE code='CS305'), 'final', 88, 100, 5, '2024-25');

-- Sample Announcements
INSERT INTO public.announcements (title, content, category, is_pinned, created_by) VALUES
  ('End Semester Examination Schedule Released', 'End semester exams for Semester 5 will begin on March 15, 2025. Admit cards available in student portal.', 'exam', TRUE, '00000000-0000-0000-0000-000000000001'),
  ('Campus Placement Drive — TechCorp India', 'TechCorp India will conduct placement drive on March 10, 2025. Eligible: CSE final year students with 60%+ aggregate.', 'placement', FALSE, '00000000-0000-0000-0000-000000000001'),
  ('Annual Technical Fest — TechVista 2025', 'Annual tech fest on Feb 28 – Mar 1, 2025. Register your teams for hackathon, coding contests, and robotics.', 'event', FALSE, '00000000-0000-0000-0000-000000000001');

-- Sample Notifications (for student1)
INSERT INTO public.notifications (user_id, title, message, type) VALUES
  ('fd1091cf-9175-4b03-9b76-3d37b5b09f83', 'Results Published', 'Your Semester 5 final exam results are now available.', 'success'),
  ('fd1091cf-9175-4b03-9b76-3d37b5b09f83', 'Fee Due Reminder', 'Your semester fee payment is due by March 31, 2025.', 'warning'),
  ('fd1091cf-9175-4b03-9b76-3d37b5b09f83', 'New Announcement', 'A new placement drive announcement has been posted.', 'info');
