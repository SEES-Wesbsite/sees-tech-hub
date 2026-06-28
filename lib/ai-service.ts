import { Profile } from '@/lib/types'

// Simple interface for our AI providers
export interface AIProvider {
  generateRivalryCommentary(users: Profile[]): Promise<string>
}

// ------------------------------------------------------------------
// 1. Groq Provider (Primary)
// ------------------------------------------------------------------
export class GroqProvider implements AIProvider {
  async generateRivalryCommentary(users: Profile[]): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) throw new Error("GROQ_API_KEY is missing")

    // We only care about the top 5 for rivalry commentary
    const topUsers = users.slice(0, 5).map((u, i) => `${i+1}. ${u.full_name} (${u.total_points} pts)`).join('\n')

    const prompt = `
You are the edgy, hyper-competitive AI announcer for the SEES Tech Hub developer leaderboard.
Your job is to hype up the current leaderboard standings, point out close rivalries, and maybe roast the players trailing behind.
Keep it extremely concise (max 2 short paragraphs). Use a cyberpunk, hacker-tournament tone.
Don't use emojis. Focus on the points gap.

Current Top 5:
${topUsers}
`

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 150
      })
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Groq API Error: ${err}`)
    }

    const data = await res.json()
    return data.choices[0].message.content
  }
}

// ------------------------------------------------------------------
// 2. Gemini Provider (Fallback/Alternative)
// ------------------------------------------------------------------
export class GeminiProvider implements AIProvider {
  async generateRivalryCommentary(users: Profile[]): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing")

    const topUsers = users.slice(0, 5).map((u, i) => `${i+1}. ${u.full_name} (${u.total_points} pts)`).join('\n')

    const prompt = `
You are the edgy, hyper-competitive AI announcer for the SEES Tech Hub developer leaderboard.
Your job is to hype up the current leaderboard standings, point out close rivalries, and maybe roast the players trailing behind.
Keep it extremely concise (max 2 short paragraphs). Use a cyberpunk, hacker-tournament tone.
Don't use emojis. Focus on the points gap.

Current Top 5:
${topUsers}
`

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 150
        }
      })
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Gemini API Error: ${err}`)
    }

    const data = await res.json()
    return data.candidates[0].content.parts[0].text
  }
}

// ------------------------------------------------------------------
// Switcher Logic
// ------------------------------------------------------------------
// Toggle this variable to switch between providers in the future.
// Currently set to 'groq' as requested.
const ACTIVE_PROVIDER: 'groq' | 'gemini' = 'groq'

export function getAIProvider(): AIProvider {
  if (ACTIVE_PROVIDER === 'groq') {
    return new GroqProvider()
  } else {
    return new GeminiProvider()
  }
}
