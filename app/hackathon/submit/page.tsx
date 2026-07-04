"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalStorageState } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploader } from "@/components/ui/file-uploader";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";
import { submitConceptNote } from "@/app/actions/hackathon";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Info, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";
import { SubmitSuccess } from "@/components/hackathon/submit-success";

interface TeamMember {
  name: string;
  role: string;
  email: string;
  portfolioUrl: string;
}

export default function SubmitHackathonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  const [projectName, setProjectName, clearProjectName] = useLocalStorageState(
    "hackathon_projectName",
    "",
  );
  const [tagline, setTagline, clearTagline] = useLocalStorageState(
    "hackathon_tagline",
    "",
  );
  const [track, setTrack, clearTrack] = useLocalStorageState(
    "hackathon_track",
    "",
  );
  const [techStack, setTechStack, clearTechStack] = useLocalStorageState(
    "hackathon_techStack",
    "",
  );
  const [teamMembers, setTeamMembers, clearTeamMembers] = useLocalStorageState<
    TeamMember[]
  >("hackathon_teamMembers", [
    { name: "", role: "", email: "", portfolioUrl: "" },
  ]);
  const [conceptNoteFile, setConceptNoteFile] = useState<File | null>(null);
  const [
    conceptNoteMarkdown,
    setConceptNoteMarkdown,
    clearConceptNoteMarkdown,
  ] = useLocalStorageState("hackathon_conceptNoteMarkdown", "");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAddMember = () => {
    if (teamMembers.length >= 3) {
      toast.error("Maximum of 3 team members allowed.");
      return;
    }
    setTeamMembers([
      ...teamMembers,
      { name: "", role: "", email: "", portfolioUrl: "" },
    ]);
  };

  const handleRemoveMember = (index: number) => {
    if (teamMembers.length <= 1) {
      toast.error("You must have at least one team member (yourself).");
      return;
    }
    const updated = [...teamMembers];
    updated.splice(index, 1);
    setTeamMembers(updated);
  };

  const handleMemberChange = (
    index: number,
    field: keyof TeamMember,
    value: string,
  ) => {
    const updated = [...teamMembers];
    updated[index][field] = value;
    setTeamMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conceptNoteFile && !conceptNoteMarkdown.trim()) {
      toast.error(
        "Please upload your Concept Note PDF or paste it as markdown.",
      );
      return;
    }

    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("projectName", projectName);
    formData.append("tagline", tagline);
    formData.append("track", track);
    formData.append("techStack", techStack);
    formData.append("teamMembers", JSON.stringify(teamMembers));
    if (conceptNoteFile) {
      formData.append("conceptNoteFile", conceptNoteFile);
    }
    if (conceptNoteMarkdown.trim()) {
      formData.append("conceptNoteMarkdown", conceptNoteMarkdown);
    }

    const res = await submitConceptNote(formData);
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
      setShowConfirm(false);
    } else {
      setSubmittedName(teamMembers[0]?.name || "Team");
      setIsSuccess(true);
    }
  };

  const handleDismissSuccess = () => {
    setIsSuccess(false);
    setProjectName("");
    setTagline("");
    setTrack("");
    setTechStack("");
    setTeamMembers([{ name: "", role: "", email: "", portfolioUrl: "" }]);
    setConceptNoteFile(null);
    setShowConfirm(false);
    clearProjectName();
    clearTagline();
    clearTrack();
    clearTechStack();
    clearConceptNoteMarkdown();
    clearTeamMembers();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-10 md:pt-24 pb-20 overflow-x-hidden text-slate-900">
      <FadeIn className="container px-4 mx-auto max-w-5xl">
        {isSuccess ? (
          <SubmitSuccess
            name={submittedName}
            onDismiss={handleDismissSuccess}
          />
        ) : (
          <>
            <div className="mb-8">
              <Link
                href="/hackathon"
                className="inline-flex items-center text-slate-500 hover:text-brand transition-colors text-sm mb-6 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hackathon
              </Link>
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
                Submit Concept Note
              </h1>
              <p className="text-slate-600 text-lg">
                Stage 1 Application. Fill out the details below and upload your
                architecture proposal.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <h3 className="text-xl font-bold mb-6 border-b border-slate-200 pb-4 text-slate-900">
                      Project Details
                    </h3>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>Project Name</Label>
                        <Input
                          placeholder="e.g. UNILAG Ride Share"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Tagline (One sentence pitch)</Label>
                        <Input
                          placeholder="Connecting students going the same route for safer, cheaper rides."
                          value={tagline}
                          onChange={(e) => setTagline(e.target.value)}
                          required
                          minLength={10}
                          maxLength={200}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Track</Label>
                          <Select
                            value={track}
                            onValueChange={setTrack}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a track" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="software">
                                Software Engineering
                              </SelectItem>
                              <SelectItem value="ai">
                                AI & Machine Learning
                              </SelectItem>
                              <SelectItem value="cybersecurity">
                                Cybersecurity & Networking
                              </SelectItem>
                              <SelectItem value="embedded">
                                Embedded Systems & Hardware
                              </SelectItem>
                              <SelectItem value="other">
                                Other / Hybrid
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Core Tech Stack</Label>
                          <Input
                            placeholder="e.g. React, Node, Supabase, Python"
                            value={techStack}
                            onChange={(e) => setTechStack(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                      <h3 className="text-xl font-bold text-slate-900">
                        Team Members
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddMember}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Member
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {teamMembers.map((member, index) => (
                        <div
                          key={index}
                          className="flex flex-col gap-4 p-4 md:p-5 bg-slate-50 rounded-xl border border-slate-200"
                        >
                          <div className="flex items-center justify-between md:hidden pb-2 border-b border-slate-200/50">
                            <h4 className="text-sm font-bold text-slate-700">
                              Team Member {index + 1}
                            </h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-700 -mr-2"
                              onClick={() => handleRemoveMember(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex flex-col md:flex-row gap-4 w-full">
                            <div className="flex-1 space-y-2">
                              <Label className="text-xs text-slate-500">
                                Name
                              </Label>
                              <Input
                                value={member.name}
                                onChange={(e) =>
                                  handleMemberChange(
                                    index,
                                    "name",
                                    e.target.value,
                                  )
                                }
                                required
                                placeholder="Full Name"
                              />
                            </div>
                            <div className="flex-1 space-y-2">
                              <Label className="text-xs text-slate-500">
                                Email
                              </Label>
                              <Input
                                type="email"
                                value={member.email}
                                onChange={(e) =>
                                  handleMemberChange(
                                    index,
                                    "email",
                                    e.target.value,
                                  )
                                }
                                required
                                placeholder="Email Address"
                              />
                            </div>
                            <div className="flex-1 space-y-2">
                              <Label className="text-xs text-slate-500">
                                Role
                              </Label>
                              <Input
                                value={member.role}
                                onChange={(e) =>
                                  handleMemberChange(
                                    index,
                                    "role",
                                    e.target.value,
                                  )
                                }
                                required
                                placeholder="e.g. Frontend"
                              />
                            </div>
                            <div className="flex flex-col md:flex-row gap-4 w-full mt-4">
                              <div className="flex-1 space-y-2">
                                <Label className="text-xs text-slate-500">
                                  Portfolio / GitHub / Linkedin URL
                                </Label>
                                <Input
                                  type="url"
                                  value={member.portfolioUrl}
                                  onChange={(e) =>
                                    handleMemberChange(
                                      index,
                                      "portfolioUrl",
                                      e.target.value,
                                    )
                                  }
                                  required
                                  placeholder="https://github.com/username"
                                />
                              </div>
                              <div className="hidden md:flex flex-[0.5] items-end pb-1 justify-end">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:bg-red-50 hover:text-red-700 shrink-0"
                                  onClick={() => handleRemoveMember(index)}
                                >
                                  <Trash2 className="w-5 h-5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <h3 className="text-xl font-bold mb-2 text-slate-900">
                      Upload Concept Note
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">
                      Upload your proposal as a PDF (Max 2 pages, 5MB).
                    </p>

                    <FileUploader
                      value={conceptNoteFile}
                      onChange={setConceptNoteFile}
                      accept="application/pdf"
                      maxSizeMB={5}
                    />

                    <div className="relative flex py-5 items-center">
                      <div className="flex-grow border-t border-slate-200"></div>
                      <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">
                        OR
                      </span>
                      <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    <div className="space-y-2">
                      <Label>Paste Concept Note (Markdown Supported)</Label>
                      <Textarea
                        placeholder="If you don't have a PDF, you can type or paste your concept note directly here..."
                        className="min-h-[200px] max-h-[400px] overflow-y-auto"
                        value={conceptNoteMarkdown}
                        onChange={(e) => setConceptNoteMarkdown(e.target.value)}
                        maxLength={20000}
                      />
                    </div>
                  </div>

                  {showConfirm ? (
                    <div className="p-6 bg-brand/10 border border-brand/20 rounded-2xl mb-8 animate-in fade-in slide-in-from-bottom-4">
                      <h4 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-brand" />
                        Review Your Submission
                      </h4>
                      <p className="text-slate-700 text-sm mb-4">
                        Please ensure all details are correct. You will not be
                        able to edit this submission after it is sent.
                      </p>
                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowConfirm(false)}
                          disabled={loading}
                        >
                          Wait, let me edit
                        </Button>
                        <Button
                          type="button"
                          className="flex-1 bg-brand text-white hover:bg-brand-light shadow-lg shadow-brand/20"
                          onClick={handleSubmit}
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader
                              className="w-5 h-5 mr-2"
                              variant="simple-spin"
                            />
                          ) : null}
                          Confirm & Submit
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="submit"
                      className="w-full h-14 text-lg bg-slate-900 text-white hover:bg-slate-800 rounded-xl"
                    >
                      Review Application
                    </Button>
                  )}
                </form>
              </div>

              {/* Guidelines Sidebar */}
              <div className="space-y-6">
                <div className="p-6 border border-brand/20 bg-brand/5 rounded-2xl">
                  <h3 className="font-bold text-brand flex items-center gap-2 mb-4 text-lg">
                    <Info className="w-5 h-5" /> Submission Guidelines
                  </h3>
                  <div className="space-y-5 text-sm text-slate-700">
                    <p className="font-medium text-slate-900 bg-white p-3 rounded-lg border border-brand/10 shadow-sm">
                      Your Concept Note must be a PDF and should not exceed 2
                      pages.
                    </p>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-3 tracking-wide uppercase text-xs">
                        Required Sections
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex flex-col">
                          <span className="font-bold text-slate-900">
                            1. Problem Statement
                          </span>
                          <span className="text-slate-600">
                            What UNILAG problem are you solving?
                          </span>
                        </li>
                        <li className="flex flex-col">
                          <span className="font-bold text-slate-900">
                            2. Proposed Solution
                          </span>
                          <span className="text-slate-600">
                            How will you build it? Include high-level
                            architecture.
                          </span>
                        </li>
                        <li className="flex flex-col">
                          <span className="font-bold text-slate-900">
                            3. Tech Stack
                          </span>
                          <span className="text-slate-600">
                            Languages, APIs, and Hardware required.
                          </span>
                        </li>
                        <li className="flex flex-col">
                          <span className="font-bold text-slate-900">
                            4. Impact
                          </span>
                          <span className="text-slate-600">
                            How does this directly help students?
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-6 border border-red-200 bg-red-50 rounded-2xl">
                  <h3 className="font-bold text-red-600 flex items-center gap-2 mb-4 text-lg">
                    <AlertTriangle className="w-5 h-5" /> Common Mistakes
                  </h3>
                  <ul className="space-y-4 text-sm text-slate-700">
                    <li className="flex gap-2 items-start">
                      <span className="text-red-500 font-bold">•</span>
                      <span>
                        Over-promising features you cannot realistically build
                        during the hackathon.
                      </span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <span className="text-red-500 font-bold">•</span>
                      <span>
                        Ignoring technical feasibility or lacking a clear stack.
                      </span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <span className="text-red-500 font-bold">•</span>
                      <span>
                        Missing the campus context. Your solution must
                        specifically target UNILAG students.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </FadeIn>
    </div>
  );
}
