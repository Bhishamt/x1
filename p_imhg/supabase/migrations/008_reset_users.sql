-- ============================================================
-- MIGRATION 008: RESET USER DATA
-- Clears all existing user records safely
-- Run this BEFORE seeding new student data
-- ============================================================

-- Clear dependent tables first (order matters for FK constraints)
DELETE FROM public.result_corrections;
DELETE FROM public.results;
DELETE FROM public.announcement_reads;
DELETE FROM public.push_tokens;
DELETE FROM public.notifications;
DELETE FROM public.chatbot_logs;

-- Clear all users
DELETE FROM public.users;

-- NOTE: This does NOT delete auth.users entries.
-- You should also clear auth users from the Supabase Auth dashboard
-- (Authentication > Users > Select All > Delete) if needed.
-- New users will be created via the Admin Management page or sign-up.
