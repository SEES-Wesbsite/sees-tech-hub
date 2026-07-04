"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import * as pdfParseModule from "pdf-parse";
const pdfParse = (pdfParseModule as any).default || pdfParseModule;

const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  email: z.string().email("Invalid email address"),
  portfolioUrl: z.string().url("Valid Portfolio/GitHub URL is required"),
});

const submissionSchema = z.object({
  projectName: z.string().min(1, "Project Name is required"),
  tagline: z.string().min(10, "Tagline must be at least 10 characters").max(200, "Tagline must be under 200 characters"),
  track: z.enum(["software", "ai", "cybersecurity", "embedded", "other"]),
  techStack: z.string().min(1, "Tech stack is required"),
  teamMembers: z.array(memberSchema).min(1, "At least one team member is required").max(4, "Maximum 4 team members allowed"),
});

async function extractAiFields(text: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Extract the following from this hackathon concept note: 1. Problem Statement 2. Proposed Solution 3. Tech Stack 4. Campus Impact 5. Research Depth. Return ONLY a JSON object with these exact keys (problem_statement, proposed_solution, tech_stack, campus_impact, research_depth).\n\nText:\n${text.substring(0, 30000)}`,
    config: {
      responseMimeType: "application/json"
    }
  });
  
  try {
    return JSON.parse(response.text || "{}");
  } catch (err) {
    console.error("Failed to parse Gemini JSON output", err);
    return null;
  }
}

export async function submitConceptNote(formData: FormData) {
  // Use admin client to bypass RLS for public submissions
  const supabase = await createAdminClient();

  try {
    // 1. Parse JSON for team members
    const teamMembersRaw = formData.get("teamMembers") as string;
    let teamMembersParsed = [];
    if (teamMembersRaw) {
      teamMembersParsed = JSON.parse(teamMembersRaw);
    }

    // 2. Validate Data
    const validatedData = submissionSchema.parse({
      projectName: formData.get("projectName"),
      tagline: formData.get("tagline"),
      track: formData.get("track"),
      techStack: formData.get("techStack"),
      teamMembers: teamMembersParsed,
    });

    // 3. Handle File Upload (PDF Concept Note) or Markdown
    const conceptNoteFile = formData.get("conceptNoteFile") as File | null;
    const conceptNoteMarkdownRaw = formData.get("conceptNoteMarkdown") as string | null;
    let concept_note_url: string | null = null;
    let concept_note_markdown: string | null = null;
    let rawText = "";

    if (conceptNoteFile && conceptNoteFile.size > 0) {
      if (conceptNoteFile.type !== "application/pdf") {
        return { error: "Concept Note must be a PDF." };
      }
      if (conceptNoteFile.size > 5 * 1024 * 1024) {
        return { error: "Concept Note PDF must be under 5MB." };
      }

      const fileName = `public-${Date.now()}.pdf`;
      const { error: uploadErr } = await supabase.storage
        .from("hackathon_documents")
        .upload(fileName, conceptNoteFile, { upsert: true });

      if (uploadErr) {
        throw new Error(`Failed to upload Concept Note: ${uploadErr.message}`);
      }
      concept_note_url = fileName;

      // Extract text from PDF for AI
      const arrayBuffer = await conceptNoteFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const pdfData = await pdfParse(buffer);
      rawText = pdfData.text;
    } else if (conceptNoteMarkdownRaw && conceptNoteMarkdownRaw.trim()) {
      concept_note_markdown = conceptNoteMarkdownRaw.trim();
      rawText = concept_note_markdown;
    } else {
      return { error: "Concept Note PDF or Markdown is required." };
    }

    // 4. Extract fields via AI
    let ai_summary = null;
    try {
      if (rawText.trim()) {
        ai_summary = await extractAiFields(rawText);
      }
    } catch (e) {
      console.error("AI extraction failed, proceeding without summary.", e);
    }

    // 5. Insert into database
    const { error: insertErr } = await supabase.from("hackathon_submissions").insert({
      project_name: validatedData.projectName,
      tagline: validatedData.tagline,
      track: validatedData.track,
      tech_stack: validatedData.techStack,
      team_members: validatedData.teamMembers,
      concept_note_url,
      concept_note_markdown,
      ai_summary,
      status: "pending"
    });

    if (insertErr) {
      if (concept_note_url) {
        await supabase.storage.from("hackathon_documents").remove([concept_note_url]);
      }
      throw new Error(`Failed to save submission: ${insertErr.message}`);
    }

    revalidatePath("/hackathon");
    return { success: true };

  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.issues[0].message };
    }
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function verifyStage2Code(code: string) {
  const supabase = await createAdminClient();
  
  const { data, error } = await supabase
    .from("hackathon_submissions")
    .select("id")
    .eq("qualification_code", code)
    .single();

  if (error || !data) {
    return { error: "Invalid or expired qualification code." };
  }

  const googleFormUrl = process.env.NEXT_PUBLIC_STAGE2_FORM_URL || "https://forms.gle/your-google-form-link";
  
  redirect(googleFormUrl);
}
