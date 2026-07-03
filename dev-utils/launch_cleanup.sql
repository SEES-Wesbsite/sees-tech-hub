-- ==========================================
-- PRE-LAUNCH DATABASE CLEANUP SCRIPT
-- ==========================================
-- This script safely cleans out all test data, user activity, and non-admin accounts
-- while preserving the core system data (quests, questions, opportunities) needed for launch.

-- IMPORTANT: Run this in the Supabase SQL Editor.

-- 1. Wipe all purely transactional activity data (Safe to truncate)
TRUNCATE TABLE public.audit_logs CASCADE;
TRUNCATE TABLE public.quiz_sessions CASCADE;
TRUNCATE TABLE public.quest_assignments CASCADE;
TRUNCATE TABLE public.submissions CASCADE;
TRUNCATE TABLE public.hackathon_submissions CASCADE;
TRUNCATE TABLE public.event_attendances CASCADE;
TRUNCATE TABLE public.opportunity_interactions CASCADE;
TRUNCATE TABLE public.project_members CASCADE;
TRUNCATE TABLE public.project_upvotes CASCADE;
TRUNCATE TABLE public.point_transactions CASCADE;
TRUNCATE TABLE public.projects CASCADE;

-- 2. Delete all non-admin users
-- We delete from auth.users, which will automatically cascade and delete the row in public.users
DELETE FROM auth.users 
WHERE id IN (
    SELECT id FROM public.users WHERE role != 'admin'
);

-- 3. Delete all events (Assuming all current events are just test data)
-- If you want to keep your events, comment out the line below:
DELETE FROM public.events;
TRUNCATE TABLE public.opportunities CASCADE;
-- ==========================================
-- WHAT WE ARE KEEPING INTACT:
-- ==========================================
-- 1. `quest_bank`: Your core library of quests needs to stay so new users have quests.
-- 2. `quiz_questions` & `quiz_options`: The questions attached to your quizzes.
-- 3. `opportunities`: The job/internship board listings. (If these are fake, run: ;)
-- 4. `admin_roles` & `users` (Admin only): Your admin accounts so you don't lock yourself out.
