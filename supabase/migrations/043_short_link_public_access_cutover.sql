-- Migration: 043_short_link_public_access_cutover.sql
-- Description: After deploying the new resolver, remove legacy direct public access to link rows.

-- Apply ONLY AFTER the application uses resolve_short_link for public redirects.
-- Migration 041 temporarily retains the legacy read policy so the old deployment
-- can continue serving published links while the new application is deployed.
DROP POLICY "Anyone can read active short links" ON short_links;
REVOKE SELECT (id, slug, destination_url, clicks, is_active) ON short_links FROM anon;
