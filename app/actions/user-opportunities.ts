'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function trackInteraction(opportunityId: string, interactionType: 'view' | 'save' | 'click_apply') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    const { error } = await supabase
      .from('opportunity_interactions')
      .insert({
        opportunity_id: opportunityId,
        user_id: user.id,
        interaction_type: interactionType
      })

    // If it's a unique constraint error (e.g., saving twice), we can ignore or return success
    if (error && error.code === '23505') {
      return { success: true }
    }
    if (error) throw error

    revalidatePath('/opportunities')
    revalidatePath(`/opportunities/${opportunityId}`)
    return { success: true }
  } catch (error: any) {
    console.error(`Error tracking ${interactionType}:`, error)
    return { error: error.message || `Failed to track ${interactionType}` }
  }
}

export async function removeSave(opportunityId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    const { error } = await supabase
      .from('opportunity_interactions')
      .delete()
      .match({
        opportunity_id: opportunityId,
        user_id: user.id,
        interaction_type: 'save'
      })

    if (error) throw error

    revalidatePath('/opportunities')
    revalidatePath(`/opportunities/${opportunityId}`)
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to remove save' }
  }
}
