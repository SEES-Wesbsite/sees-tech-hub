'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getCurrentWeekMonday } from '@/lib/utils';
import { withErrorHandling } from '@/lib/utils/error-handler';

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

export async function startQuestQuiz(assignmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // 1. Fetch assignment and quest details
  const { data: assignment, error: assignError } = await supabase
    .from('quest_assignments')
    .select('*, quest_bank(quiz_id, quest_type)')
    .eq('id', assignmentId)
    .eq('user_id', user.id)
    .single();

  if (assignError || !assignment) throw new Error('Assignment not found');
  if (assignment.quest_bank.quest_type !== 'quiz') throw new Error('This quest is not a quiz');
  if (!assignment.quest_bank.quiz_id) throw new Error('Quiz is missing from this quest');

  const quizId = assignment.quest_bank.quiz_id;

  // 2. Check if a session already exists
  const { data: existingSession } = await supabase
    .from('quiz_sessions')
    .select('id, completed')
    .eq('user_id', user.id)
    .eq('quiz_id', quizId)
    .single();

  if (existingSession) {
    if (existingSession.completed) {
      throw new Error('You have already completed this quiz');
    }
    return { sessionId: existingSession.id };
  }

  // 3. Fetch all questions for this quiz
  const adminClient = await createAdminClient();
  const { data: questions, error: qError } = await adminClient
    .from('quiz_questions')
    .select('id')
    .eq('quiz_id', quizId);

  if (qError || !questions || questions.length === 0) {
    throw new Error('This quiz has no questions configured.');
  }

  const questionIds = questions.map((q: any) => q.id);

  // 4. Create new session
  const { data: session, error: sessionError } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: user.id,
      quiz_id: quizId,
      current_question_index: 0,
      score: 0,
      question_ids: questionIds
    })
    .select()
    .single();

  if (sessionError || !session) {
    throw new Error('Failed to start quiz session');
  }
  
  // Mark assignment as in_progress
  if (assignment.status === 'assigned') {
    await supabase.from('quest_assignments')
      .update({ status: 'in_progress' })
      .eq('id', assignmentId);
  }

  return { sessionId: session.id };
}

export const generateMyWeeklyQuests = async () => withErrorHandling(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
    const targetWeekStart = getCurrentWeekMonday();

    // 1. Fetch User Data (Rank & Stacks)
    const { data: targetUser, error: userErr } = await supabase
      .from('users')
      .select('primary_stacks, total_points')
      .eq('id', user.id)
      .single();
      
    if (userErr || !targetUser) throw new Error('User not found');

    const userRank = calculateRank(targetUser.total_points || 0);
    const userStacks: string[] = targetUser.primary_stacks || [];

    // 2. Fetch Past Assignments to exclude
    const { data: pastAssignments } = await supabase
      .from('quest_assignments')
      .select('quest_id')
      .eq('user_id', user.id);

    const assignedIds = new Set(pastAssignments?.map(a => a.quest_id));

    // 3. Fetch Active Quest Bank
    const { data: activeQuests, error: qErr } = await supabase
      .from('quest_bank')
      .select('*')
      .eq('status', 'active');

    if (qErr || !activeQuests) throw new Error('Failed to fetch quest bank');

    // Filter out already assigned
    let eligibleQuests = activeQuests.filter(q => !assignedIds.has(q.id));

    if (eligibleQuests.length < 3) {
      return { error: 'Not enough unassigned active quests in the bank to generate Weekly 3.' };
    }

    // 4. Score the eligible quests
    const scoredQuests = eligibleQuests.map(quest => {
      let score = 0;
      
      // Tag matching (+10 per matched tag)
      if (quest.tags && quest.tags.length > 0) {
        const matches = quest.tags.filter((t: string) => userStacks.includes(t)).length;
        score += matches * 10;
      }

      // Difficulty matching (+20 exact, +5 for 1 tier difference)
      const diffDist = getDifficultyDistance(userRank, quest.difficulty);
      if (diffDist === 0) score += 20;
      else if (diffDist === 1) score += 5;
      else score -= (diffDist * 5); // Penalize quests too far out of rank

      return { ...quest, score };
    });

    // Sort by highest score
    scoredQuests.sort((a, b) => b.score - a.score);

    // 5. Selection Logic: Try to get 1 DSA, 1 Project, 1 Other (Article/Quiz)
    const selectedQuests = [];
    
    const dsaQuests = scoredQuests.filter(q => q.quest_type === 'dsa_problem');
    const projectQuests = scoredQuests.filter(q => q.quest_type === 'project_build');
    const otherQuests = scoredQuests.filter(q => ['quiz', 'article_read'].includes(q.quest_type));

    if (dsaQuests.length > 0) selectedQuests.push(dsaQuests.shift());
    if (projectQuests.length > 0) selectedQuests.push(projectQuests.shift());
    if (otherQuests.length > 0) selectedQuests.push(otherQuests.shift());

    // Fill remaining slots if we didn't hit 3
    const allRemaining = [...dsaQuests, ...projectQuests, ...otherQuests].sort((a, b) => b.score - a.score);
    while (selectedQuests.length < 3 && allRemaining.length > 0) {
      selectedQuests.push(allRemaining.shift());
    }

    // 6. Insert into quest_assignments
    const inserts = selectedQuests.map(q => ({
      user_id: user.id,
      quest_id: q!.id,
      week_start: targetWeekStart,
      status: 'assigned'
    }));

    const adminClient = await createAdminClient();
    const { error: insertErr } = await adminClient.from('quest_assignments').insert(inserts);
    if (insertErr) {
      if (insertErr.code === '23505') return { error: 'Assignments already exist for this week.' };
      throw insertErr;
    }

    revalidatePath('/quests');
    return { success: true };
});

export const assignAndStartQuest = async (questId: string) => withErrorHandling(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const targetWeekStart = getCurrentWeekMonday();

  // 1. Check if they already have it assigned this week
  const { data: existing } = await supabase
    .from('quest_assignments')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('quest_id', questId)
    .eq('week_start', targetWeekStart)
    .single();

  if (existing) {
    if (existing.status === 'completed') {
      throw new Error("You've already completed this quest this week.");
    }
    // Just start it
    return await startQuestQuiz(existing.id);
  }

  // 2. Otherwise, assign it right now
  const adminClient = await createAdminClient();
  const { data: newAssignment, error } = await adminClient
    .from('quest_assignments')
    .insert({
      user_id: user.id,
      quest_id: questId,
      week_start: targetWeekStart,
      status: 'assigned'
    })
    .select()
    .single();

  if (error || !newAssignment) {
    throw new Error('Failed to self-assign quest.');
  }

  // 3. Start it
  return await startQuestQuiz(newAssignment.id);
});
