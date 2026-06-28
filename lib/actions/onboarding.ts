'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { addAuditLog } from '@/lib/utils/audit';
import { redirect } from 'next/navigation';

export async function updatePersona(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const preferredName = formData.get('preferred_name') as string;
  const primaryStacksStr = formData.get('primary_stacks') as string;
  let primaryStacks: string[] = [];

  try {
    if (primaryStacksStr) {
      primaryStacks = JSON.parse(primaryStacksStr);
    }
  } catch (e) {
    throw new Error('Invalid primary stacks format');
  }

  if (!preferredName || preferredName.trim().length === 0) {
    throw new Error('Preferred name is required');
  }

  const { error } = await supabase
    .from('users')
    .update({
      preferred_name: preferredName.trim(),
      primary_stacks: primaryStacks,
    })
    .eq('id', user.id);

  if (error) {
    console.error('Failed to update persona', error);
    throw new Error('Failed to save profile details');
  }

  await addAuditLog({
    actorId: user.id,
    actionType: 'update_persona',
    targetId: user.id,
    targetType: 'users',
    newData: { preferred_name: preferredName.trim(), primary_stacks: primaryStacks }
  });

  revalidatePath('/onboarding');
  return { success: true };
}

// Begins the placement quiz by locating the global placement quiz and establishing a session
export async function startPlacementQuiz() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Find the placement quiz
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('id, base_time_limit')
    .eq('quiz_type', 'placement')
    .single();

  if (quizError || !quiz) {
    throw new Error('Placement quiz has not been configured by an admin yet.');
  }

  // Check if a session already exists
  const { data: existingSession } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('quiz_id', quiz.id)
    .single();

  if (existingSession) {
    if (existingSession.completed) {
      throw new Error('Quiz already completed');
    }
    // Update onboarding status just in case
    await supabase.from('users').update({ onboarding_status: 'quiz_in_progress' }).eq('id', user.id);
    return { sessionId: existingSession.id };
  }

  // Generate Stack-Targeted Random Questions
  const adminClient = await createAdminClient();
  const { data: profile } = await supabase.from('users').select('primary_stacks').eq('id', user.id).single();
  const stacks = profile?.primary_stacks || [];

  const { data: allQuestions } = await adminClient
    .from('quiz_questions')
    .select('id, category')
    .eq('quiz_id', quiz.id);

  if (!allQuestions || allQuestions.length < 10) {
    throw new Error('Not enough questions configured for this quiz. Please seed the database.');
  }

  const dsaQuestions = allQuestions.filter((q: any) => q.category === 'dsa').map((q: any) => q.id);
  const stackQuestions = allQuestions.filter((q: any) => stacks.includes(q.category)).map((q: any) => q.id);

  const shuffle = (array: string[]) => array.sort(() => 0.5 - Math.random());

  let selectedIds: string[] = [];

  if (stacks.length > 0 && stackQuestions.length >= 5) {
    selectedIds = [
      ...shuffle(dsaQuestions).slice(0, 5),
      ...shuffle(stackQuestions).slice(0, 5)
    ];
  } else {
    // Fallback to 10 DSA questions if they didn't pick a stack or not enough stack questions
    selectedIds = shuffle(dsaQuestions).slice(0, 10);
  }

  selectedIds = shuffle(selectedIds); // Final shuffle to mix DSA and Stack questions

  // Create new session with locked question_ids
  const { data: session, error: sessionError } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: user.id,
      quiz_id: quiz.id,
      current_question_index: 0,
      score: 0,
      question_ids: selectedIds
    })
    .select()
    .single();

  if (sessionError || !session) {
    throw new Error('Failed to start quiz session');
  }

  await supabase.from('users').update({ onboarding_status: 'quiz_in_progress' }).eq('id', user.id);
  
  return { sessionId: session.id };
}

// Note: For quiz logic (fetching questions securely, checking answers, completing quiz),
// those should ideally be exposed via a robust API route or very secure Server Actions
// to prevent client-side manipulation of the timer. We will build those out as we design the Quiz UI.
