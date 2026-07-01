"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
}

export default function SubmitHackathonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  const [projectName, setProjectName] = useState("");
  const [tagline, setTagline] = useState("");
  const [track, setTrack] = useState("");
  const [techStack, setTechStack] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { name: "", role: "", email: "" },
  ]);
  const [conceptNoteFile, setConceptNoteFile] = useState<File | null>(null);

  const handleAddMember = () => {
    if (teamMembers.length >= 3) {
      toast.error("Maximum of 3 team members allowed.");
      return;
    }
    setTeamMembers([...teamMembers, { name: "", role: "", email: "" }]);
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
    if (!conceptNoteFile) {
      toast.error("Please upload your Concept Note PDF.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("projectName", projectName);
    formData.append("tagline", tagline);
    formData.append("track", track);
    formData.append("techStack", techStack);
    formData.append("teamMembers", JSON.stringify(teamMembers));
    formData.append("conceptNoteFile", conceptNoteFile);

    const res = await submitConceptNote(formData);
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
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
    setTeamMembers([{ name: "", role: "", email: "" }]);
    setConceptNoteFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 overflow-x-hidden">
      <FadeIn className="container px-4 mx-auto max-w-5xl">
        {isSuccess ? (
          <SubmitSuccess name={submittedName} onDismiss={handleDismissSuccess} />
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
                <h3 className="text-xl font-bold mb-6 border-b border-border pb-4">
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
                      <Select value={track} onValueChange={setTrack} required>
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
                          <SelectItem value="other">Other / Hybrid</SelectItem>
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
                <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                  <h3 className="text-xl font-bold">Team Members</h3>
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
                        <h4 className="text-sm font-bold text-slate-700">Team Member {index + 1}</h4>
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
                              handleMemberChange(index, "name", e.target.value)
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
                              handleMemberChange(index, "email", e.target.value)
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
                              handleMemberChange(index, "role", e.target.value)
                            }
                            required
                            placeholder="e.g. Frontend"
                          />
                        </div>
                        <div className="hidden md:flex items-end pb-1">
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
                  ))}
                </div>
              </div>

              <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <h3 className="text-xl font-bold mb-2">Upload Concept Note</h3>
                <p className="text-sm text-slate-500 mb-6">
                  Upload your proposal as a PDF (Max 2 pages, 5MB).
                </p>

                <FileUploader
                  value={conceptNoteFile}
                  onChange={setConceptNoteFile}
                  accept="application/pdf"
                  maxSizeMB={5}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-lg bg-brand text-white hover:bg-brand-light shadow-xl shadow-brand/20 rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <Loader className="w-5 h-5 mr-2" variant="simple-spin" />
                ) : null}
                Submit Application
              </Button>
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
                  Your Concept Note must be a PDF and should not exceed 2 pages.
                </p>
                <div>
                  <h4 className="font-bold text-slate-900 mb-3 tracking-wide uppercase text-xs">
                    Required Sections
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex flex-col">
                      <span className="font-bold text-slate-900">1. Problem Statement</span>
                      <span className="text-slate-600">What UNILAG problem are you solving?</span>
                    </li>
                    <li className="flex flex-col">
                      <span className="font-bold text-slate-900">2. Proposed Solution</span>
                      <span className="text-slate-600">How will you build it? Include high-level architecture.</span>
                    </li>
                    <li className="flex flex-col">
                      <span className="font-bold text-slate-900">3. Tech Stack</span>
                      <span className="text-slate-600">Languages, APIs, and Hardware required.</span>
                    </li>
                    <li className="flex flex-col">
                      <span className="font-bold text-slate-900">4. Impact</span>
                      <span className="text-slate-600">How does this directly help students?</span>
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
                  <span>Over-promising features you cannot realistically build during the hackathon.</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Ignoring technical feasibility or lacking a clear stack.</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Missing the campus context. Your solution must specifically target UNILAG students.</span>
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
