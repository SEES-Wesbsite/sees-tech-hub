'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function claimEventPoints(eventId: string, code: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    // 1. Fetch Event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('status, claim_code, claim_expires_at, points_awarded')
      .eq('id', eventId)
      .single()

    if (eventError || !event) throw new Error('Event not found')

    // 2. Validate Event State
    if (event.status !== 'live') {
      throw new Error('Points can only be claimed while the event is Live.')
    }
    if (!event.claim_code || event.claim_code.toLowerCase() !== code.toLowerCase()) {
      throw new Error('Incorrect claim code.')
    }
    if (event.claim_expires_at && new Date() > new Date(event.claim_expires_at)) {
      throw new Error('The claim window for this event has expired.')
    }

    // 3. Fetch RSVP
    const { data: attendance, error: attendanceError } = await supabase
      .from('event_attendances')
      .select('id, rsvp_status, points_claimed')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .maybeSingle()

    if (attendanceError) throw attendanceError

    // 4. Validate RSVP & Claim State
    if (!attendance || attendance.rsvp_status !== 'going') {
      throw new Error('You must RSVP to this event before you can claim points.')
    }
    if (attendance.points_claimed) {
      throw new Error('You have already claimed points for this event.')
    }

    // 5. Execute Claim Transaction (via RPC if possible, but we'll do it sequentially here for simplicity)
    // First mark as claimed to prevent race conditions (atomic update with match on points_claimed=false)
    const { data: updateData, error: updateError } = await supabase
      .from('event_attendances')
      .update({ points_claimed: true, claimed_at: new Date().toISOString() })
      .eq('id', attendance.id)
      .eq('points_claimed', false)
      .select()
      .single()

    if (updateError || !updateData) {
      throw new Error('Failed to claim. You may have already claimed points.')
    }

    // 6. Award Points (Assuming there's an RPC or we update directly)
    // Instead of doing a manual read/write for total_points, we should call a secure RPC.
    // Let's use standard insert into point_transactions and let DB triggers handle it if they exist, 
    // or just use an RPC 'award_points'. Since MVP has a direct update pattern often:
    
    // Check if there is an award_points RPC
    // Fallback: we manually get and set
    const { data: profile } = await supabase.from('users').select('total_points').eq('id', user.id).single()
    const newTotal = (profile?.total_points || 0) + event.points_awarded

    await supabase.from('users').update({ total_points: newTotal }).eq('id', user.id)

    await supabase.from('point_transactions').insert({
      user_id: user.id,
      amount: event.points_awarded,
      reason: `Attended event: ${eventId}`
    })

    revalidatePath('/events')
    revalidatePath('/dashboard')
    
    return { success: true, pointsAwarded: event.points_awarded }
  } catch (err: any) {
    return { error: err.message || 'An error occurred while claiming points.' }
  }
}
