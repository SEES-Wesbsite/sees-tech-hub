-- Migration: 027_events_storage_bucket.sql
-- Description: Create a public storage bucket for event cover images

INSERT INTO storage.buckets (id, name, public) 
VALUES ('event_covers', 'event_covers', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies
-- Allow anyone to read from the public bucket
CREATE POLICY "Public can view event covers" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'event_covers');

-- Allow admins to upload/modify event covers
CREATE POLICY "Admins can upload event covers" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'event_covers' AND public.is_admin());

CREATE POLICY "Admins can update event covers" 
    ON storage.objects FOR UPDATE 
    USING (bucket_id = 'event_covers' AND public.is_admin());

CREATE POLICY "Admins can delete event covers" 
    ON storage.objects FOR DELETE 
    USING (bucket_id = 'event_covers' AND public.is_admin());
