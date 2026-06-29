'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper for admin checks
async function checkAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from('users').select('role').eq('id', userId).single()
  if (data?.role !== 'admin') throw new Error('Unauthorized')
}

// Convert XP to Rank (S, A, B, C, D, E)
function calculateRank(points: number): string {
  if (points >= 10000) return 'S'
  if (points >= 5000) return 'A'
  if (points >= 2500) return 'B'
  if (points >= 1000) return 'C'
  if (points >= 500) return 'D'
  return 'E'
}

// Helper to determine difficulty distance
function getDifficultyDistance(userRank: string, questDiff: string): number {
  const ranks = ['E', 'D', 'C', 'B', 'A', 'S']
  const uIdx = ranks.indexOf(userRank)
  const qIdx = ranks.indexOf(questDiff)
  return Math.abs(uIdx - qIdx)
}

/**
 * Runs the Recommendation System for a specific user.
 * Assigns exactly 3 quests for the upcoming week based on their skills and rank.
 */
export async function generateWeeklyAssignments(targetUserId: string, targetWeekStart: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  try {
    await checkAdmin(supabase, user.id)

    // 1. Fetch User Data (Rank & Stacks)
    const { data: targetUser, error: userErr } = await supabase
      .from('users')
      .select('primary_stacks, total_points')
      .eq('id', targetUserId)
      .single()
      
    if (userErr || !targetUser) throw new Error('User not found')

    const userRank = calculateRank(targetUser.total_points || 0)
    const userStacks: string[] = targetUser.primary_stacks || []

    // 2. Fetch Past Assignments to exclude
    const { data: pastAssignments } = await supabase
      .from('quest_assignments')
      .select('quest_id')
      .eq('user_id', targetUserId)

    const assignedIds = new Set(pastAssignments?.map(a => a.quest_id))

    // 3. Fetch Active Quest Bank
    const { data: activeQuests, error: qErr } = await supabase
      .from('quest_bank')
      .select('*')
      .eq('status', 'active')

    if (qErr || !activeQuests) throw new Error('Failed to fetch quest bank')

    // Filter out already assigned
    let eligibleQuests = activeQuests.filter(q => !assignedIds.has(q.id))

    if (eligibleQuests.length < 3) {
      return { error: 'Not enough unassigned active quests in the bank to generate Weekly 3.' }
    }

    // 4. Score the eligible quests
    const scoredQuests = eligibleQuests.map(quest => {
      let score = 0
      
      // Tag matching (+10 per matched tag)
      if (quest.tags && quest.tags.length > 0) {
        const matches = quest.tags.filter((t: string) => userStacks.includes(t)).length
        score += matches * 10
      }

      // Difficulty matching (+20 exact, +5 for 1 tier difference)
      const diffDist = getDifficultyDistance(userRank, quest.difficulty)
      if (diffDist === 0) score += 20
      else if (diffDist === 1) score += 5
      else score -= (diffDist * 5) // Penalize quests too far out of rank

      return { ...quest, score }
    })

    // Sort by highest score
    scoredQuests.sort((a, b) => b.score - a.score)

    // 5. Selection Logic: Try to get 1 DSA, 1 Project, 1 Other (Article/Quiz)
    const selectedQuests = []
    
    const dsaQuests = scoredQuests.filter(q => q.quest_type === 'dsa_problem')
    const projectQuests = scoredQuests.filter(q => q.quest_type === 'project_build')
    const otherQuests = scoredQuests.filter(q => ['quiz', 'article_read'].includes(q.quest_type))

    if (dsaQuests.length > 0) selectedQuests.push(dsaQuests.shift())
    if (projectQuests.length > 0) selectedQuests.push(projectQuests.shift())
    if (otherQuests.length > 0) selectedQuests.push(otherQuests.shift())

    // Fill remaining slots if we didn't hit 3
    const allRemaining = [...dsaQuests, ...projectQuests, ...otherQuests].sort((a, b) => b.score - a.score)
    while (selectedQuests.length < 3 && allRemaining.length > 0) {
      selectedQuests.push(allRemaining.shift())
    }

    // 6. Insert into quest_assignments
    const inserts = selectedQuests.map(q => ({
      user_id: targetUserId,
      quest_id: q!.id,
      week_start: targetWeekStart,
      status: 'assigned'
    }))

    const { error: insertErr } = await supabase.from('quest_assignments').insert(inserts)
    if (insertErr) {
      if (insertErr.code === '23505') return { error: 'Assignments already exist for this week.' }
      throw insertErr
    }

    revalidatePath('/admin/assignments')
    return { success: true, count: selectedQuests.length }
    
  } catch (err: any) {
    return { error: err.message || 'An error occurred during generation.' }
  }
}

/**
 * Bulk runs the Recommendation System for all users.
 */
export async function bulkGenerateWeeklyAssignments(targetWeekStart: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  try {
    await checkAdmin(supabase, user.id)
    
    // Fetch all active users (those who aren't suspended, etc. - just taking everyone for now)
    const { data: users, error: uErr } = await supabase.from('users').select('id')
    if (uErr) throw uErr

    let successCount = 0
    for (const u of users) {
      const res = await generateWeeklyAssignments(u.id, targetWeekStart)
      if (res.success) successCount++
    }

    revalidatePath('/admin/assignments')
    return { success: true, count: successCount }
  } catch (err: any) {
    return { error: err.message || 'Bulk generation failed.' }
  }
}

export async function unassignQuest(assignmentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  try {
    await checkAdmin(supabase, user.id)
    const { error } = await supabase.from('quest_assignments').delete().eq('id', assignmentId)
    if (error) throw error
    
    revalidatePath('/admin/assignments')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Failed to unassign quest.' }
  }
}
