-- ============================================================
-- Seed Data — Polytechnic College Management System
-- ============================================================

-- Roles (4-role system)
INSERT INTO public.roles (id, name, level) VALUES
  (1, 'super_admin', 1),
  (2, 'hod', 10),
  (3, 'class_incharge', 20),
  (4, 'student', 50)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, level = EXCLUDED.level;
