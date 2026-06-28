'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Helper for admin checks
async function checkAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from('users').select('role').eq('id', userId).single()
  if (data?.role !== 'admin') throw new Error('Unauthorized')
}

// Zod schema for quest validation
const questSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  quest_type: z.enum(['dsa_problem', 'quiz', 'article_read', 'project_build']),
  difficulty: z.enum(['S', 'A', 'B', 'C', 'D', 'E']),
  point_value: z.coerce.number().int().min(1),
  tags: z.string().nullable().transform(str => str ? str.split(',').map(s => s.trim()).filter(Boolean) : []),
  external_url: z.string().url().optional().or(z.literal('')),
  quiz_id: z.string().uuid().optional().or(z.literal('')),
})

export async function createQuest(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  try {
    await checkAdmin(supabase, user.id)
    
    const validatedData = questSchema.parse({
      title: formData.get('title'),
      description: formData.get('description'),
      quest_type: formData.get('questType'),
      difficulty: formData.get('difficulty'),
      point_value: formData.get('pointValue'),
      tags: formData.get('tags'),
      external_url: formData.get('externalUrl'),
      quiz_id: formData.get('quizId'),
    })
    
    // Cleanup empty strings to nulls for DB
    const external_url = validatedData.external_url || null
    const quiz_id = validatedData.quiz_id || null

    const { error } = await supabase.from('quest_bank').insert({
      title: validatedData.title,
      description: validatedData.description,
      quest_type: validatedData.quest_type,
      point_value: validatedData.point_value,
      difficulty: validatedData.difficulty,
      tags: validatedData.tags,
      external_url,
      quiz_id,
      created_by: user.id,
      status: 'active'
    })
    
    if (error) throw error
    revalidatePath('/admin/quests')
    return { success: true }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.issues[0].message }
    }
    return { error: err.message || 'An error occurred' }
  }
}

export async function updateQuest(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  try {
    await checkAdmin(supabase, user.id)
    
    const validatedData = questSchema.parse({
      title: formData.get('title'),
      description: formData.get('description'),
      quest_type: formData.get('questType'),
      difficulty: formData.get('difficulty'),
      point_value: formData.get('pointValue'),
      tags: formData.get('tags'),
      external_url: formData.get('externalUrl'),
      quiz_id: formData.get('quizId'),
    })
    
    const external_url = validatedData.external_url || null
    const quiz_id = validatedData.quiz_id || null

    const { error } = await supabase.from('quest_bank').update({
      title: validatedData.title,
      description: validatedData.description,
      quest_type: validatedData.quest_type,
      point_value: validatedData.point_value,
      difficulty: validatedData.difficulty,
      tags: validatedData.tags,
      external_url,
      quiz_id,
    }).eq('id', id)
    
    if (error) throw error
    revalidatePath('/admin/quests')
    return { success: true }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.issues[0].message }
    }
    return { error: err.message || 'An error occurred' }
  }
}

export async function archiveQuest(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  try {
    await checkAdmin(supabase, user.id)
    
    const { error } = await supabase.from('quest_bank')
      .update({ status: 'archived' })
      .eq('id', id)
    
    if (error) throw error
    revalidatePath('/admin/quests')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An error occurred' }
  }
}

export async function unarchiveQuest(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  try {
    await checkAdmin(supabase, user.id)
    
    const { error } = await supabase.from('quest_bank')
      .update({ status: 'active' })
      .eq('id', id)
    
    if (error) throw error
    revalidatePath('/admin/quests')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An error occurred' }
  }
}

export async function generateQuestsFromAI(prompt: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  try {
    await checkAdmin(supabase, user.id)
    
    // 1. Fetch available tags from users to feed to AI
    const { data: usersData } = await supabase.from('users').select('primary_stacks')
    const uniqueStacks = Array.from(new Set(
      (usersData || []).flatMap(u => u.primary_stacks || [])
    )).filter(Boolean)
    
    // 2. Build the system prompt
    const systemPrompt = `
You are an expert Quest Designer for a tech hub platform.
Your job is to parse the user's input and generate an array of quests matching our JSON schema.

JSON SCHEMA:
{
  "quests": [
    {
      "title": "String (Short, actionable title)",
      "description": "String (Markdown formatted description of the task)",
      "quest_type": "Enum ('quiz', 'article_read')",
      "difficulty": "Enum ('S', 'A', 'B', 'C', 'D', 'E')",
      "point_value": "Number (Integer, usually 10 to 100 based on difficulty)",
      "tags": ["Array of Strings"],
      "external_url": "String (URL if applicable, otherwise empty string)",
      "quiz_content": {
        "pass_threshold": 60,
        "questions": [
           { "text": "String", "options": ["A","B","C","D"], "correct_answer_index": 0 }
        ]
      }
    }
  ]
}

CRITICAL: The MVP only supports 'quiz' and 'article_read'. You MUST NOT generate 'dsa_problem' or 'project_build' quests. If the user asks for a DSA problem or a project build, wrap it into a 'quiz' or 'article_read' instead.
CRITICAL: If quest_type is 'quiz', you MUST include the nested 'quiz_content' object with at least 3 questions. The 'correct_answer_index' is an integer (0-3). If quest_type is NOT 'quiz', omit 'quiz_content'.

CRITICAL INSTRUCTIONS FOR TAGS:
You must ONLY assign tags that exist in the platform's current vocabulary. Do NOT invent new tags.
Available platform tags: ${uniqueStacks.length > 0 ? uniqueStacks.join(', ') : 'none'}

If a generated quest doesn't fit any available tag, leave the "tags" array empty.
`

    // 3. Call AI
    const { generateWithAi } = await import('@/lib/ai/generate')
    const aiResponse = await generateWithAi(prompt, { systemPrompt, provider: 'groq' })
    
    // 4. Parse and Validate JSON
    let parsed: any
    try {
      parsed = JSON.parse(aiResponse)
    } catch {
      // Sometimes AI wraps in markdown block
      const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(cleaned)
    }

    if (!parsed || !Array.isArray(parsed.quests)) {
      throw new Error("AI returned an invalid structure. Expected { quests: [...] }")
    }

    // 5. Validate and Insert
    let insertedCount = 0
    for (const raw of parsed.quests) {
      const validated = questSchema.parse({
        title: raw.title,
        description: raw.description,
        quest_type: raw.quest_type,
        difficulty: raw.difficulty,
        point_value: raw.point_value,
        tags: Array.isArray(raw.tags) ? raw.tags.join(',') : (raw.tags || ''),
        external_url: raw.external_url || '',
        quiz_id: ''
      })
      
      if (validated.quest_type === 'quiz' && raw.quiz_content && raw.quiz_content.questions) {
        // Deep Insert via RPC
        const { error } = await supabase.rpc('insert_quiz_quest', {
          p_quest_title: validated.title,
          p_quest_description: validated.description,
          p_quest_type: validated.quest_type,
          p_difficulty: validated.difficulty,
          p_point_value: validated.point_value,
          p_tags: validated.tags,
          p_external_url: validated.external_url || null,
          p_created_by: user.id,
          p_pass_threshold: raw.quiz_content.pass_threshold || 70,
          p_questions: raw.quiz_content.questions.map((q: any) => ({
            text: q.text,
            options: q.options,
            correct_option_index: q.correct_answer_index
          }))
        })
        if (!error) insertedCount++
        else console.error("RPC Error:", error)
      } else {
        // Normal Insert
        const { error } = await supabase.from('quest_bank').insert({
          title: validated.title,
          description: validated.description,
          quest_type: validated.quest_type,
          point_value: validated.point_value,
          difficulty: validated.difficulty,
          tags: validated.tags,
          external_url: validated.external_url || null,
          created_by: user.id,
          status: 'draft' // Always draft when AI generated!
        })
        if (!error) insertedCount++
      }
    }
    
    revalidatePath('/admin/quests')
    return { success: true, count: insertedCount }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: 'AI generated invalid data structure: ' + err.issues[0].message }
    }
    return { error: err.message || 'An error occurred during AI generation' }
  }
}

export async function publishAllDrafts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  try {
    await checkAdmin(supabase, user.id)
    
    const { error, count } = await supabase.from('quest_bank')
      .update({ status: 'active' })
      .eq('status', 'draft')
    
    if (error) throw error
    revalidatePath('/admin/quests')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An error occurred while publishing drafts' }
  }
}
