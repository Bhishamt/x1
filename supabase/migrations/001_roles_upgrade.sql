-- ============================================================
-- MIGRATION 001: UPGRADE ROLES TABLE
-- Expands from 2 roles (admin, student) to 5-role hierarchy
-- Safe: uses ON CONFLICT to avoid duplicates
-- ============================================================

-- Add level column for hierarchy ordering
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS level SMALLINT NOT NULL DEFAULT 99;

-- Rename existing admin → super_admin
UPDATE public.roles SET name = 'super_admin', level = 1 WHERE id = 1;

-- Update student level
UPDATE public.roles SET level = 50 WHERE id = 2;

-- Insert new intermediate roles
INSERT INTO public.roles (id, name, level) VALUES
  (2, 'admin', 10),
  (3, 'hod', 20),
  (4, 'class_incharge', 30),
  (5, 'student', 50)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, level = EXCLUDED.level;

-- Now move existing students from role_id=2 to role_id=5
-- IMPORTANT: This must happen AFTER the new roles exist
UPDATE public.users SET role_id = 5 WHERE role_id = 2;

-- Update role_id=2 entry to 'admin'
UPDATE public.roles SET name = 'admin', level = 10 WHERE id = 2;

-- Verify
-- SELECT * FROM public.roles ORDER BY level;
