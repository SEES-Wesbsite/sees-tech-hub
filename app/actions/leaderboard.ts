'use server'

import { getAIProvider } from '@/lib/ai-service'
import type { Profile } from '@/lib/types'

export async function getLeaderboardRivalryCommentary(topUsers: Profile[]) {
  try {
    const provider = getAIProvider()
    const commentary = await provider.generateRivalryCommentary(topUsers)
    return { success: true, commentary }
  } catch (error: any) {
    console.error('AI Rivalry Error:', error)
    return { success: false, error: error.message || 'Failed to generate commentary' }
  }
}
