import { createClient } from '@/lib/supabase/server'
import { QuestsClient } from './quests-client'
import { Quest, Quiz } from '@/lib/types'

export default async function AdminQuestsPage() {
  const supabase = await createClient()

  const [questsRes, quizzesRes] = await Promise.all([
    supabase
      .from('quest_bank')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false })
  ])

  const quests = (questsRes.data || []) as Quest[]
  const quizzes = (quizzesRes.data || []) as Quiz[]

  return <QuestsClient initialQuests={quests} quizzes={quizzes} />
}
