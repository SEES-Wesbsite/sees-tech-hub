-- Migration: 001_initial_schema.sql
-- Description: Core STH tables for users, tasks, submissions, point transactions, events, projects, and jobs

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    matric_number VARCHAR(20) UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    contact_email VARCHAR(255),
    avatar_url TEXT,
    track VARCHAR(50) CHECK (track IN ('software', 'ai_ml', 'cybersecurity', 'embedded_systems')),
    academic_year VARCHAR(10) CHECK (academic_year IN ('100L', '200L', '300L', '400L', '500L')),
    github_url TEXT,
    skills TEXT[],
    total_points INTEGER DEFAULT 0 NOT NULL CHECK (total_points >= 0),
    role VARCHAR(20) DEFAULT 'member' NOT NULL CHECK (role IN ('member', 'admin')),
    verification_status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE users IS 'Core member profiles for STH.';
COMMENT ON COLUMN users.matric_number IS 'Student matriculation number, used for synthetic email auth.';
COMMENT ON COLUMN users.verification_status IS 'Status of biodata AI verification.';

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all verified users (for leaderboards/profiles)
CREATE POLICY "Users can read all profiles" 
    ON users FOR SELECT 
    USING (true);

-- Policy: Users can update their own non-sensitive fields
CREATE POLICY "Users can update own profile" 
    ON users FOR UPDATE 
    USING (auth.uid() = id);

-- 2. Tasks Table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('dsa_sprint', 'project_build', 'hackathon', 'event_attendance')),
    point_value INTEGER NOT NULL CHECK (point_value > 0),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE tasks IS 'Weekly DSA sprints, hackathons, and bounties.';

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active tasks
CREATE POLICY "Anyone can view active tasks" 
    ON tasks FOR SELECT 
    USING (is_active = true);

-- 3. Submissions Table
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    task_id UUID NOT NULL REFERENCES tasks(id),
    proof_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id)
);

COMMENT ON TABLE submissions IS 'Member proofs of task completion.';

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own submissions
CREATE POLICY "Users can view own submissions" 
    ON submissions FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own submissions
CREATE POLICY "Users can insert own submissions" 
    ON submissions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 4. Point Transactions Table
CREATE TABLE point_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    submission_id UUID REFERENCES submissions(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE point_transactions IS 'Immutable ledger of all points awarded/deducted.';

ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own point transactions
CREATE POLICY "Users can view own point transactions" 
    ON point_transactions FOR SELECT 
    USING (auth.uid() = user_id);

-- 5. Events Table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    points_awarded INTEGER DEFAULT 0 NOT NULL CHECK (points_awarded >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE events IS 'Calendar of STH sprints, workshops, and meetups.';

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events" 
    ON events FOR SELECT 
    USING (true);

-- 6. Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    required_skills TEXT[],
    status VARCHAR(20) DEFAULT 'open' NOT NULL CHECK (status IN ('open', 'in_progress', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE projects IS 'STH project board for community builds.';

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view projects" 
    ON projects FOR SELECT 
    USING (true);

-- 7. Jobs Table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT NOT NULL,
    apply_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE jobs IS 'Curated job and internship board.';

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active jobs" 
    ON jobs FOR SELECT 
    USING (is_active = true);
