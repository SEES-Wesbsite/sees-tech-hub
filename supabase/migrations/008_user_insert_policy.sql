-- Migration: 008_user_insert_policy.sql
-- Description: Allow users to insert their own profile during onboarding

CREATE POLICY "Users can insert own profile" 
    ON users FOR INSERT 
    WITH CHECK (auth.uid() = id);
