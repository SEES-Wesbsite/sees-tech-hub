// Shared types derived from the database schema

export type Profile = {
  id: string
  full_name: string
  preferred_name: string | null
  avatar_url: string | null
  primary_stacks: string[] | null
  portfolio_link: string | null
  social_link: string | null
  total_points: number
  role: 'member' | 'admin'
  onboarding_status: 'pending' | 'quiz_in_progress' | 'completed'
  created_at: string
}

export type Quest = {
  id: string
  title: string
  description: string
  quest_type: 'dsa_problem' | 'quiz' | 'article_read' | 'project_build'
  point_value: number
  difficulty: 'S' | 'A' | 'B' | 'C' | 'D' | 'E'
  status: 'draft' | 'active' | 'archived'
  tags: string[]
  external_url: string | null
  quiz_id: string | null
  created_by: string | null
  created_at: string
}

export type QuestAssignment = {
  id: string
  user_id: string
  quest_id: string
  week_start: string // DATE string
  status: 'assigned' | 'in_progress' | 'completed' | 'expired'
  assigned_at: string
  completed_at: string | null
}

export type Submission = {
  id: string
  user_id: string
  assignment_id: string | null
  quest_id: string
  quiz_session_id: string | null
  proof_url: string | null
  status: 'pending' | 'approved' | 'rejected' | 'auto_approved'
  ai_confidence_score: number | null
  ai_feedback: string | null
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
}

export type Event = {
  id: string
  title: string
  description: string | null
  event_date: string
  location: string | null
  points_awarded: number
  event_type: 'hackathon' | 'alumni_talk' | 'dsa_sprint' | 'general' | 'other'
  claim_expires_at: string | null
  created_at: string
}

export type Project = {
  id: string
  title: string
  description: string
  required_skills: string[] | null
  status: 'open' | 'in_progress' | 'completed'
  created_at: string
}

export type Job = {
  id: string
  title: string
  company: string
  description: string
  apply_url: string
  is_active: boolean
  created_at: string
}

export type ShortLink = {
  id: string
  slug: string
  destination_url: string
  clicks: number
  created_by: string | null
  is_active: boolean
  created_at: string
}

export type AuditLog = {
  id: string
  actor_id: string | null
  action_type: string
  target_id: string | null
  target_type: string
  old_data: Record<string, any> | null
  new_data: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export type Quiz = {
  id: string
  title: string
  quiz_type: 'placement' | 'dsa_sprint'
  base_time_limit: number
  pass_threshold: number
  created_at: string
}

export type QuizQuestion = {
  id: string
  quiz_id: string
  question_text: string
  options: string[]
  correct_option_index: number
  time_limit_seconds: number | null
  created_at: string
}

export type QuizSession = {
  id: string
  user_id: string
  quiz_id: string
  current_question_index: number
  score: number
  started_at: string
  completed: boolean
  created_at: string
}
