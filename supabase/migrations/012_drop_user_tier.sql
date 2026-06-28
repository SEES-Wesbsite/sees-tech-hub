-- Migration: 012_drop_user_tier.sql
-- Description: Drop the hardcoded tier column from users. Tiers will be derived dynamically from total_points.

ALTER TABLE users DROP COLUMN IF EXISTS tier;
