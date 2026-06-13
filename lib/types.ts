// Shared types derived from the database schema

export type Profile = {
  id: string
  matric_number: string
  full_name: string
  contact_email: string | null
  avatar_url: string | null
  track: 'software' | 'ai_ml' | 'cybersecurity' | 'embedded_systems' | null
  academic_year: '100L' | '200L' | '300L' | '400L' | '500L' | null
  github_url: string | null
  skills: string[] | null
  total_points: number
  role: 'member' | 'admin'
  verification_status: 'pending' | 'verified' | 'rejected'
  last_login: string | null
  created_at: string
}

export type Task = {
  id: string
  title: string
  description: string
  task_type: 'dsa_sprint' | 'project_build' | 'hackathon' | 'event_attendance'
  point_value: number
  is_active: boolean
  deadline: string | null
  created_at: string
}

export type Submission = {
  id: string
  user_id: string
  task_id: string
  proof_url: string | null
  status: 'pending' | 'approved' | 'rejected'
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

// Tier calculation utility
export const TIERS = [
  { name: 'Explorer',   min: 0,   max: 99,  color: '#a3a3a3' },
  { name: 'Builder',    min: 100, max: 299, color: '#3b82f6' },
  { name: 'Innovator',  min: 300, max: 599, color: '#f59e0b' },
  { name: 'Pioneer',    min: 600, max: Infinity, color: '#95fde2' },
] as const

export function getTier(points: number) {
  return TIERS.find(t => points >= t.min && points <= t.max) ?? TIERS[0]
}

export function getTierProgress(points: number) {
  const tier = getTier(points)
  const nextTier = TIERS[TIERS.indexOf(tier) + 1]
  if (!nextTier) return 100 // Pioneer — maxed out
  const rangeSize = nextTier.min - tier.min
  const progress = points - tier.min
  return Math.round((progress / rangeSize) * 100)
}
