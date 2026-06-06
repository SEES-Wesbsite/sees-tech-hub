Product Requirements Document (PRD)

Project: STH Portal (Minimum Viable Product)

Lead Engineer: Eyitayo Obembe (Team/Technical Lead)
Date: June 6, 2026
Target Launch: June 15, 2026
Status: Active Build Phase

1. Executive Summary

The STH Portal is the digital home base and operational engine for the SEES Tech Hub. For the June 15 launch, we are deploying a Minimum Viable Product (MVP) focused strictly on user onboarding, identity management, asynchronous task submission (DSA/Projects), and the automated points leaderboard. The platform must be high-performing, mobile-responsive, and strictly adhere to a zero-cost infrastructure model.

2. Technology Stack & Infrastructure

Frontend Framework: Next.js (App Router, TypeScript) for fast rendering and optimal routing.

Styling: Tailwind CSS integrated with Shadcn/UI for rapid, accessible, and consistent component development.

Backend & Database: Supabase (PostgreSQL). Handing Auth, Row Level Security (RLS), and database queries.

Hosting & Deployment: Vercel (connected via GitHub for CI/CD).

Authentication: Supabase Auth (Strictly Google OAuth to minimize friction and prevent duplicate accounts).

3. UI/UX & Design System

The UI will be a dark-mode, minimalist, developer-centric interface.

Primary Background: Black (#0f0f0f)

Surface/Card Background: Deep Green (#013f31)

Primary Accent (Buttons, Highlights): Cyan (#95fde2)

Secondary Accent (Warnings, Badges, Tiers): Warm Yellow (#ffb703)

Typography: Primary text in White (#ffffff), secondary text in Soft Mint (#e8fff7). Font family: 'Plus Jakarta Sans' or 'Urbanist'.

4. Core Features (MVP Scope)

4.1. Authentication & Onboarding Flow

Login: Single button "Continue with Google".

Onboarding: On first login, users are redirected to a /setup-profile route.

Required Fields:

Full Name (Pre-filled from Google, editable)

Current Year (100L, 200L, 300L, 400L, 500L)

Primary Track (Software, AI/ML, Cybersecurity, Embedded Systems)

GitHub Username (Required)

LeetCode/HackerRank Profile URL (Optional but recommended)

4.2. Member Dashboard

Overview Header: Displays User Name, Track, Current Points, and Membership Tier.

Tier Logic Automation:

Member: 0 - 49 pts

Active: 50 - 149 pts

Builder: 150 - 299 pts

Elite: 300+ pts

Recent Activity Feed: A localized list of the user's recently approved point transactions.

4.3. Task & Submission System (Asynchronous Engine)

Active Tasks View: A dashboard showing current week's DSA challenges and active open-source project bounties.

Submission Modal:

Dropdown to select the task being submitted (e.g., "Week 1: Sliding Window").

Input field for proof (URL to GitHub PR, LeetCode submission screenshot/link).

Submit button sets status to Pending Verification.

4.4. Live Leaderboard

Global Ranking: Tabular view of all members sorted by total points descending.

Data Columns: Rank, Name, Track, Points, Tier Badge.

Optimization: This data must be cached or updated efficiently to prevent heavy database reads on every page load.

4.5. Admin Panel (For Tech & Growth Leads)

Role-Based Access: Only accessible to users with role: 'admin'.

Submission Queue: Table of all Pending submissions. Admin can click Approve or Reject.

Action: Clicking Approve automatically triggers a database function to award the mapped points to the user.

The "Ghost" Query: A view showing users who have not logged in or submitted a task in the last 21 days (for the Community Managers).

5. Database Schema (Supabase / PostgreSQL)

5.1. users Table

id (uuid, primary key, references auth.users)

full_name (text)

email (text, unique)

track (text)

academic_year (text)

github_url (text)

total_points (integer, default 0)

role (text, default 'member')

last_login (timestamp)

created_at (timestamp)

5.2. tasks Table

id (uuid, primary key)

title (text)

description (text)

task_type (text) - e.g., 'dsa_sprint', 'project_build', 'hackathon', 'event_attendance'

point_value (integer)

is_active (boolean, default true)

deadline (timestamp, nullable)

5.3. submissions Table

id (uuid, primary key)

user_id (uuid, references users.id)

task_id (uuid, references tasks.id)

proof_url (text)

status (text, default 'pending') - 'pending', 'approved', 'rejected'

submitted_at (timestamp)

reviewed_at (timestamp, nullable)

reviewed_by (uuid, references users.id, nullable)

5.4. point_transactions (Ledger for Audit & History)

id (uuid, primary key)

user_id (uuid, references users.id)

amount (integer)

reason (text) - e.g., "Completed Week 1 DSA", "Attended Launch Event"

submission_id (uuid, references submissions.id, nullable)

created_at (timestamp)

Note: Database Trigger required: When an insert occurs on point_transactions, automatically update the total_points in the users table.

6. Execution Timeline (June 6 - June 14)

With 9 days until launch, development must be ruthlessly prioritized.

June 6-7 (Infrastructure & Auth): Initialize Next.js, configure Tailwind/Shadcn, set up Supabase project, implement Google Auth, and build the onboarding /setup-profile flow.

June 8-9 (Database & Dashboard): Finalize SQL schema, implement Row Level Security (RLS), build the User Dashboard UI to fetch and display profile data.

June 10-11 (Task Engine): Build the task submission form and the backend logic for inserting into the submissions table.

June 12 (Leaderboard): Build the public-facing leaderboard pulling from the users table, including the Tier logic calculation.

June 13 (Admin & Verification): Build the protected Admin route to approve/reject submissions and the point transaction logic.

June 14 (QA & Deployment): End-to-end testing, responsive design checks on mobile, configure Vercel production domain, and database wiping for Day 1 clean slate.

June 15: Launch.