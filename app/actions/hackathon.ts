"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  email: z.string().email("Invalid email address"),
});

const submissionSchema = z.object({
  projectName: z.string().min(1, "Project Name is required"),
  tagline: z.string().min(10, "Tagline must be at least 10 characters").max(200, "Tagline must be under 200 characters"),
  track: z.enum(["software", "ai", "cybersecurity", "embedded", "other"]),
  techStack: z.string().min(1, "Tech stack is required"),
  teamMembers: z.array(memberSchema).min(1, "At least one team member is required").max(4, "Maximum 4 team members allowed"),
});

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

    // 3. Handle File Upload (PDF Concept Note)
    const conceptNoteFile = formData.get("conceptNoteFile") as File | null;
    let concept_note_url: string | null = null;

    if (!conceptNoteFile || conceptNoteFile.size === 0) {
      return { error: "Concept Note PDF is required." };
    }

    if (conceptNoteFile.type !== "application/pdf") {
      return { error: "Concept Note must be a PDF." };
    }

    if (conceptNoteFile.size > 5 * 1024 * 1024) {
      return { error: "Concept Note PDF must be under 5MB." };
    }

    const fileName = `public-${Date.now()}.pdf`;
    
    // Upload using standard client (RLS prevents users from uploading to paths they don't own, 
    // but our policy says owner must match auth.uid(), which Supabase handles via `owner` column automatically.
    // Wait, storage.objects owner column is automatically set by Supabase to the authenticated user making the request.
    const { error: uploadErr } = await supabase.storage
      .from("hackathon_documents")
      .upload(fileName, conceptNoteFile, {
        upsert: true,
      });

    if (uploadErr) {
      throw new Error(`Failed to upload Concept Note: ${uploadErr.message}`);
    }

    // We get the public URL (Note: It's a private bucket, so technically we need a signed URL to view, 
    // but storing the path is sufficient. We will store the path/fileName and admins can generate signed URLs or use the admin dashboard.)
    // Let's store the full path.
    concept_note_url = fileName;

    // 4. Insert into database
    const { error: insertErr } = await supabase.from("hackathon_submissions").insert({
      project_name: validatedData.projectName,
      tagline: validatedData.tagline,
      track: validatedData.track,
      tech_stack: validatedData.techStack,
      team_members: validatedData.teamMembers,
      concept_note_url,
      status: "pending"
    });

    if (insertErr) {
      // Cleanup file if DB insert fails
      await supabase.storage.from("hackathon_documents").remove([fileName]);
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
