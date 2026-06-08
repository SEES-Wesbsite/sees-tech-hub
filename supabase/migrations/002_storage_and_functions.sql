-- Migration: 002_storage_and_functions.sql
-- Description: Helper functions, triggers for point calculations, and storage configuration

-- 1. Admin Check Helper Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role VARCHAR(20);
BEGIN
    SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
    RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Point Calculation Trigger
CREATE OR REPLACE FUNCTION public.update_user_total_points()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate total points for the user
    UPDATE public.users
    SET total_points = (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.point_transactions
        WHERE user_id = NEW.user_id
    )
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_point_transaction_insert
    AFTER INSERT OR UPDATE OR DELETE ON public.point_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_total_points();

-- 3. Storage Bucket for Verification Documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification_docs', 'verification_docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
-- Note: Supabase storage objects have an 'owner' column linking to auth.users.id

CREATE POLICY "Users can upload their own verification docs" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'verification_docs' AND auth.uid() = owner);

CREATE POLICY "Users can read their own verification docs" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'verification_docs' AND auth.uid() = owner);

CREATE POLICY "Admins can read all verification docs" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'verification_docs' AND public.is_admin());
