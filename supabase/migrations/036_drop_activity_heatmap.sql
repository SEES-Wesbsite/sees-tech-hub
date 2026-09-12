-- Migration: 036_drop_activity_heatmap.sql
-- Description: Removes the retired activity heatmap view without deleting its underlying records.

DROP VIEW public.activity_heatmap;
