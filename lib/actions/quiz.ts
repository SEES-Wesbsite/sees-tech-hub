'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { addAuditLog } from '@/lib/utils/audit';

// Fetch the entire state of a quiz session including all questions and answers (Pure Client Evaluation)
export async function getQuizState(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 1. Fetch Session
  const { data: session, error: sessionError } = await supabase
    .from('quiz_sessions')
    .select('*, quizzes(base_time_limit, title)')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (sessionError || !session) {
    throw new Error('Quiz session not found or access denied');
  }

  if (session.completed) {
    return { status: 'completed', score: session.score };
  }

  // 2. Fetch ALL questions for this session
  const adminClient = await createAdminClient();
  const { data: questions, error: qError } = await adminClient
    .from('quiz_questions')
    .select('id, question_text, options, correct_option_index, time_limit_seconds')
    .in('id', session.question_ids);

  if (qError || !questions) {
    throw new Error('Failed to fetch questions');
  }

  // Order them exactly as they appear in session.question_ids
  const orderedQuestions = session.question_ids.map((id: string) => 
    questions.find(q => q.id === id)
  ).filter(Boolean);

  const formattedQuestions = orderedQuestions.map((q: any, index: number) => ({
    id: q.id,
    text: q.question_text,
    options: q.options as string[],
    correct_option_index: q.correct_option_index,
    timeLimit: q.time_limit_seconds || session.quizzes.base_time_limit || 30,
    index
  }));

  return {
    status: 'active',
    questions: formattedQuestions
  };
}

// Completes the session and awards final points
export async function completeQuizSession(sessionId: string, finalScore: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const userId = user.id;

  const adminClient = await createAdminClient();

  // 1. Fetch Session and Quiz Details
  const { data: session } = await adminClient
    .from('quiz_sessions')
    .select('*, quizzes(quiz_type)')
    .eq('id', sessionId)
    .single();

  if (!session) throw new Error('Session not found');

  // Mark session completed
  await adminClient
    .from('quiz_sessions')
    .update({ completed: true })
    .eq('id', sessionId);

  // 2. Branch logic based on Quiz Type
  if (session.quizzes.quiz_type === 'placement') {
    if (finalScore > 0) {
      await adminClient.from('point_transactions').insert({
        user_id: userId,
        amount: finalScore,
        reason: 'Onboarding Placement Bonus'
      });
    }
    await adminClient.from('users').update({ onboarding_status: 'completed' }).eq('id', userId);
    
    await addAuditLog({
      actorId: userId,
      actionType: 'complete_placement_quiz',
      targetId: sessionId,
      targetType: 'quiz_sessions',
      newData: { score: finalScore }
    });
  } else if (session.quizzes.quiz_type === 'quest') {
    // It's a Weekly Quest! Find the assignment.
    const { data: assignment } = await adminClient
      .from('quest_assignments')
      .select('id, quest_bank(title, id)')
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .order('assigned_at', { ascending: false })
      .limit(1)
      .single(); // We assume the most recent in-progress quest assignment corresponds to this quiz

    if (assignment) {
      const qBank: any = Array.isArray(assignment.quest_bank) ? assignment.quest_bank[0] : assignment.quest_bank;
      await adminClient.from('point_transactions').insert({
        user_id: userId,
        amount: finalScore,
        reason: `Completed Quest: ${qBank?.title || 'Unknown'}`
      });
    } else if (finalScore > 0) {
      await adminClient.from('point_transactions').insert({
        user_id: userId,
        amount: finalScore,
        reason: 'Completed Quiz Quest'
      });
    }

    if (assignment) {
      const qBank: any = Array.isArray(assignment.quest_bank) ? assignment.quest_bank[0] : assignment.quest_bank;
      await adminClient.from('quest_assignments').update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      }).eq('id', assignment.id);
      
      try {
        // Log the submission natively
        await adminClient.from('submissions').insert({
          user_id: userId,
          task_id: qBank?.id,
          assignment_id: assignment.id,
          quiz_session_id: sessionId,
          status: 'approved',
          ai_confidence_score: 1.0,
          ai_feedback: 'Automated Quiz Verification'
        });
      } catch (e) {
        // ignore if submissions table schema doesn't match perfectly, it's optional tracking
      }
    }
  }

  return { success: true, finalScore };
}
