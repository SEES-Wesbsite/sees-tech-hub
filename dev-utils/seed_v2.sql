-- Seed Data for SEES Tech Hub V2
-- Run this in your Supabase SQL Editor to populate dummy data.

BEGIN;

-- 1. Seed Events
INSERT INTO events (title, description, event_date, location, points_awarded) VALUES
('SEES Tech Meetup Vol 1', 'Introduction to the new SEES Tech Hub platform and networking session.', NOW() + INTERVAL '7 days', 'LT1, Faculty of Engineering', 50),
('Resume Review Workshop', 'Get your resume reviewed by senior engineers and tech recruiters.', NOW() + INTERVAL '14 days', 'Online (Google Meet)', 30),
('Code & Coffee', 'Weekly casual coding session. Bring your laptops and your bugs.', NOW() - INTERVAL '2 days', 'SEES Hub Room', 20)
ON CONFLICT DO NOTHING;

-- 2. Seed Tasks (Bounties)
INSERT INTO tasks (title, description, task_type, point_value, is_active, deadline) VALUES
('Implement Binary Search Tree in Python', 'Write a clean, well-documented BST implementation with insert, delete, and search methods. Include time complexity analysis.', 'dsa_sprint', 100, true, NOW() + INTERVAL '5 days'),
('Build Liquid Glass Component', 'Create a reusable Liquid Glass React component using SVGFE for UI refraction effects.', 'project_build', 250, true, NOW() + INTERVAL '10 days'),
('SEES Weekend Hackathon: AI Agents', 'Build an autonomous AI agent over the weekend. Teams of up to 3 allowed.', 'hackathon', 500, true, NOW() + INTERVAL '20 days'),
('Fix Navbar Mobile Overflow Bug', 'The bottom navigation bar overflows on extremely small screens (like iPhone SE). Fix the CSS flex constraints.', 'project_build', 50, true, NOW() + INTERVAL '3 days'),
('Attend Code & Coffee', 'Automatic bounty for attending the last Code & Coffee session.', 'event_attendance', 20, false, NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- 3. Seed Projects
INSERT INTO projects (title, description, required_skills, status) VALUES
('Gruups MVP', 'A smart group formation and management platform for students.', ARRAY['Next.js', 'Supabase', 'TailwindCSS'], 'in_progress'),
('Library Seat Reservation Bot', 'A Telegram bot that allows students to check and reserve seats in the library.', ARRAY['Python', 'Telegram API', 'PostgreSQL'], 'open'),
('SEES Tech Hub Website', 'The official portal for the Society of Electrical and Electronics Students.', ARRAY['React', 'Figma', 'TypeScript'], 'in_progress'),
('Campus Ride Share App', 'A mobile app to coordinate rides between campus and town.', ARRAY['Flutter', 'Firebase', 'Google Maps API'], 'open')
ON CONFLICT DO NOTHING;

-- 4. Seed Jobs
INSERT INTO jobs (title, company, description, apply_url, is_active) VALUES
('Frontend Engineering Intern', 'Moniepoint', 'Looking for a passionate frontend intern with experience in React and state management.', 'https://moniepoint.com/careers', true),
('Backend Developer (Entry Level)', 'Paystack', 'Join our core payments team. Must know Node.js or Go, and PostgreSQL.', 'https://paystack.com/careers', true),
('Data Analyst Intern', 'KPMG', 'Summer internship for students with strong analytical skills. SQL and Python required.', 'https://kpmg.com/careers', true),
('Developer Advocate', 'Vercel', 'Help developers build faster and better. Excellent communication skills required.', 'https://vercel.com/careers', true)
ON CONFLICT DO NOTHING;

-- 5. Auto-populate Dashboard Data for Existing Users
-- This block will generate mock submissions and event attendances for ALL currently registered users
-- so that the Dashboard Heatmap and Community Feed show active data.
DO $$
DECLARE
    user_record RECORD;
    bounty_id UUID;
    event_id UUID;
    project_id UUID;
BEGIN
    FOR user_record IN SELECT id FROM users LOOP
        -- Get a random task
        SELECT id INTO bounty_id FROM tasks LIMIT 1;
        
        -- Insert a dummy submission (approved) to give them points and heatmap activity
        INSERT INTO submissions (user_id, task_id, proof_url, status, submitted_at, reviewed_at)
        VALUES (user_record.id, bounty_id, 'https://github.com/sees-tech/dummy', 'approved', NOW() - INTERVAL '1 day', NOW())
        ON CONFLICT DO NOTHING;

        -- Get a random event
        SELECT id INTO event_id FROM events LIMIT 1;

        -- Insert a dummy event attendance
        INSERT INTO event_attendances (event_id, user_id, rsvp_status, created_at)
        VALUES (event_id, user_record.id, 'going', NOW() - INTERVAL '2 days')
        ON CONFLICT DO NOTHING;

        -- Get a random project
        SELECT id INTO project_id FROM projects LIMIT 1;

        -- Add user as a project member
        INSERT INTO project_members (project_id, user_id, role, joined_at)
        VALUES (project_id, user_record.id, 'developer', NOW() - INTERVAL '3 days')
        ON CONFLICT DO NOTHING;

        -- Add some fake point transactions to sync with the total_points
        UPDATE users SET total_points = total_points + 150 WHERE id = user_record.id;
        
        INSERT INTO point_transactions (user_id, amount, reason, created_at)
        VALUES (user_record.id, 100, 'Completed Binary Search Tree Bounty', NOW() - INTERVAL '1 day');

        INSERT INTO point_transactions (user_id, amount, reason, created_at)
        VALUES (user_record.id, 50, 'Attended Code & Coffee', NOW() - INTERVAL '2 days');

    END LOOP;
END $$;

COMMIT;
