"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { GoogleGenAI } from "@google/genai";

export async function refineReviewNote(rawNote: string) {
  const supabase = await createAdminClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "Unauthorized" };

  if (!process.env.GEMINI_API_KEY) return { error: "GEMINI_API_KEY not configured." };

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an AI grammar and professional tone refiner.
CRITICAL RULES:
1. ONLY fix grammar, spelling, and basic formatting.
2. DO NOT alter the meaning.
3. DO NOT soften harsh critiques or put words in the reviewer's mouth.
4. Output ONLY the refined text. No introductory remarks.

Original Note:
${rawNote}`
    });
    return { success: true, text: response.text?.trim() };
  } catch (e: any) {
    return { error: e.message || "Failed to refine note." };
  }
}

export async function saveHackathonReview(formData: FormData) {
  const supabase = await createAdminClient();
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData.user) {
    return { error: "Unauthorized" };
  }
  
  const { data: adminUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", authData.user.email)
      .single();
      
  if (!adminUser) {
    return { error: "Admin profile not found" };
  }

  const submissionId = formData.get("submissionId") as string;
  const privateNote = formData.get("privateNote") as string;
  const feasibility = parseInt(formData.get("feasibility") as string || "0", 10);
  const impact = parseInt(formData.get("impact") as string || "0", 10);
  const innovation = parseInt(formData.get("innovation") as string || "0", 10);

  const scores = {
    feasibility,
    impact,
    innovation
  };

  // Upsert the review
  const { error: reviewErr } = await supabase.from("hackathon_reviews").upsert({
    admin_id: adminUser.id,
    submission_id: submissionId,
    scores,
    private_note: privateNote,
    updated_at: new Date().toISOString()
  }, { onConflict: "admin_id, submission_id" });

  if (reviewErr) {
    return { error: `Failed to save review: ${reviewErr.message}` };
  }

  // total_score is now automatically aggregated by the Postgres trigger
  // tr_hackathon_reviews_score, eliminating race conditions.

  // Log in existing audit_logs table
  await supabase.from("audit_logs").insert({
    actor_id: adminUser.id,
    action_type: "hackathon_review",
    target_id: submissionId,
    target_type: "hackathon_submissions",
    new_data: { scores, privateNote }
  });

  revalidatePath("/admin/hackathon");
  return { success: true };
}

export async function dispatchStage2Codes() {
  // To be implemented by Super Admin (eyitayobembe@gmail.com) on July 8
  // This will generate codes for top N teams and send emails
  return { error: "Not yet implemented" };
}
