-- Migration: 005_add_short_links_description.sql
-- Description: Adds the description column to the short_links table.

ALTER TABLE short_links ADD COLUMN description TEXT;
