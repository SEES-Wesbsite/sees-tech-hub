import { createAdminClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

type AuditLogParams = {
  actorId?: string; // Optional if it's an automated system action
  actionType: string;
  targetId?: string;
  targetType: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
};

/**
 * Creates a tamper-proof audit log entry using the Supabase Service Role client.
 * Bypasses RLS to ensure logs are always written securely.
 */
export async function addAuditLog(params: AuditLogParams) {
  try {
    const adminClient = await createAdminClient();
    
    // Extract IP and User Agent context safely if called within a Next.js request boundary
    let ipAddress: string | null = null;
    let userAgent: string | null = null;
    
    try {
      const headersList = await headers();
      ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip');
      userAgent = headersList.get('user-agent');
    } catch (e) {
      // Ignored: function might be called from a background worker or outside request context
    }

    const { error } = await adminClient.from('audit_logs').insert({
      actor_id: params.actorId || null,
      action_type: params.actionType,
      target_id: params.targetId || null,
      target_type: params.targetType,
      old_data: params.oldData || null,
      new_data: params.newData || null,
      ip_address: ipAddress,
      user_agent: userAgent
    });

    if (error) {
      console.error('[AUDIT LOG ERROR] Failed to write audit log:', error);
    }
  } catch (error) {
    console.error('[AUDIT LOG FATAL] Unexpected error writing audit log:', error);
  }
}
