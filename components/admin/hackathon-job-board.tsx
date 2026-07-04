"use client";

import { useState, useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";
import { saveHackathonReview, refineReviewNote } from "@/app/actions/hackathon-admin";
import { FileText, ExternalLink, User, CheckCircle2, Wand2 } from "lucide-react";
import Link from "next/link";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

export interface HackathonSubmission {
  id: string;
  project_name: string;
  tagline: string;
  track: string;
  total_score: number;
  team_members: Array<{ name: string; role: string; email: string; portfolioUrl: string }>;
  ai_summary?: {
    problem_statement?: string;
    proposed_solution?: string;
    campus_impact?: string;
    tech_stack?: string;
    research_depth?: string;
  };
  concept_note_url?: string;
  concept_note_markdown?: string;
}

export interface HackathonReview {
  submission_id: string;
  scores: {
    feasibility: number;
    impact: number;
    innovation: number;
  };
  private_note: string;
}

export function HackathonJobBoard({ 
  initialSubmissions, 
  initialReviews, 
  adminId 
}: { 
  initialSubmissions: HackathonSubmission[], 
  initialReviews: HackathonReview[], 
  adminId: string | null 
}) {
  const [submissions, setOptimisticSubmissions] = useOptimistic(
    initialSubmissions,
    (state: HackathonSubmission[], updatedSub: { id: string, newTotal: number }) => {
      return state.map(sub => 
        sub.id === updatedSub.id ? { ...sub, total_score: updatedSub.newTotal } : sub
      ).sort((a, b) => b.total_score - a.total_score);
    }
  );

  const [reviews, setOptimisticReviews] = useOptimistic(
    initialReviews,
    (state: HackathonReview[], newReview: HackathonReview) => {
      const existing = state.find(r => r.submission_id === newReview.submission_id);
      if (existing) {
        return state.map(r => r.submission_id === newReview.submission_id ? newReview : r);
      }
      return [...state, newReview];
    }
  );

  const [isPending, startTransition] = useTransition();

  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("all");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<HackathonSubmission | null>(submissions[0] || null);
  const [loading, setLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  const currentReview = reviews.find(r => r.submission_id === selectedSub?.id) || {
    submission_id: selectedSub?.id || "",
    scores: { feasibility: 0, impact: 0, innovation: 0 },
    private_note: ""
  };

  const [feasibility, setFeasibility] = useState(currentReview.scores.feasibility || 0);
  const [impact, setImpact] = useState(currentReview.scores.impact || 0);
  const [innovation, setInnovation] = useState(currentReview.scores.innovation || 0);
  const [privateNote, setPrivateNote] = useState(currentReview.private_note || "");

  const handleSelect = (sub: HackathonSubmission) => {
    setSelectedSub(sub);
    const rev = reviews.find(r => r.submission_id === sub.id) || {
      submission_id: sub.id,
      scores: { feasibility: 0, impact: 0, innovation: 0 },
      private_note: ""
    };
    setFeasibility(rev.scores.feasibility || 0);
    setImpact(rev.scores.impact || 0);
    setInnovation(rev.scores.innovation || 0);
    setPrivateNote(rev.private_note || "");
    
    // Open drawer on mobile
    if (window.innerWidth < 768) {
      setIsMobileDrawerOpen(true);
    }
  };

  const handleRefineNote = async () => {
    if (!privateNote.trim()) return;
    setIsRefining(true);
    const res = await refineReviewNote(privateNote);
    setIsRefining(false);
    if (res.error) {
      toast.error(res.error);
    } else if (res.text) {
      setPrivateNote(res.text);
      toast.success("Note refined!");
    }
  };

  const handleSaveReview = async () => {
    if (!adminId || !selectedSub) {
      toast.error("You must be logged in as an admin to review.");
      return;
    }
    
    const previousTotal = currentReview.scores.feasibility + currentReview.scores.impact + currentReview.scores.innovation;
    const newSum = feasibility + impact + innovation;
    const scoreDiff = newSum - previousTotal;
    const optimisticTotalScore = selectedSub.total_score + scoreDiff;

    const updatedReview: HackathonReview = {
      submission_id: selectedSub.id,
      scores: { feasibility, impact, innovation },
      private_note: privateNote
    };

    startTransition(() => {
      setOptimisticSubmissions({ id: selectedSub.id, newTotal: optimisticTotalScore });
      setOptimisticReviews(updatedReview);
    });

    setLoading(true);
    const formData = new FormData();
    formData.append("submissionId", selectedSub.id);
    formData.append("privateNote", privateNote);
    formData.append("feasibility", feasibility.toString());
    formData.append("impact", impact.toString());
    formData.append("innovation", innovation.toString());

    const res = await saveHackathonReview(formData);
    setLoading(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Review saved successfully!");
      setIsMobileDrawerOpen(false); // Auto close on save
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const isReviewed = reviews.some(r => r.submission_id === sub.id);
    if (filter === "pending") return !isReviewed;
    if (filter === "reviewed") return isReviewed;
    return true;
  });

  const renderDetails = () => {
    if (!selectedSub) return null;
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              {selectedSub.project_name}
            </h2>
            <p className="text-slate-600 md:text-lg">{selectedSub.tagline}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="bg-brand/10 text-brand px-3 py-1 rounded-full text-sm font-medium">
                {selectedSub.track}
              </span>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
                {selectedSub.team_members.length} Members
              </span>
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center min-w-[120px] shrink-0">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Total Score</div>
            <div className="text-3xl font-black text-brand">{selectedSub.total_score}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-2 space-y-8">
            {/* AI Extracted Content */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold border-b pb-2">Concept Note (AI Parsed)</h3>
              
              {selectedSub.ai_summary ? (
                <>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Problem Statement</h4>
                    <p className="text-slate-700 whitespace-pre-wrap">{selectedSub.ai_summary.problem_statement || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Proposed Solution</h4>
                    <p className="text-slate-700 whitespace-pre-wrap">{selectedSub.ai_summary.proposed_solution || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Campus Impact</h4>
                    <p className="text-slate-700 whitespace-pre-wrap">{selectedSub.ai_summary.campus_impact || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Tech Stack</h4>
                    <p className="text-slate-700 whitespace-pre-wrap">{selectedSub.ai_summary.tech_stack || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Research Depth</h4>
                    <p className="text-slate-700 whitespace-pre-wrap">{selectedSub.ai_summary.research_depth || "N/A"}</p>
                  </div>
                </>
              ) : selectedSub.concept_note_markdown ? (
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Raw Markdown</h4>
                  <div className="bg-slate-50 p-4 rounded-lg whitespace-pre-wrap text-sm">
                    {selectedSub.concept_note_markdown}
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 italic">No AI summary generated and no markdown provided. Please view the original PDF.</div>
              )}

              {selectedSub.concept_note_url && (
                <div className="pt-4">
                  <Link 
                    href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/hackathon_documents/${selectedSub.concept_note_url}`}
                    target="_blank"
                    className="inline-flex items-center text-brand hover:underline font-medium"
                  >
                    <FileText className="w-4 h-4 mr-2" /> View Original PDF
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Team & Portfolio</h3>
              <div className="space-y-3">
                {selectedSub.team_members.map((m: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-900 flex items-center gap-2">
                        {m.name}
                        {m.portfolioUrl && (
                          <a href={m.portfolioUrl} target="_blank" rel="noreferrer" className="text-brand hover:text-brand-light">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{m.role} • {m.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-brand/5 p-5 rounded-2xl border border-brand/20">
              <h3 className="font-bold text-brand mb-4">Review Rubric</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <Label className="text-xs font-bold text-slate-600 mb-1 block">Feasibility (1-10)</Label>
                  <Input type="number" min="0" max="10" value={feasibility} onChange={(e) => setFeasibility(Number(e.target.value))} />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-600 mb-1 block">Campus Impact (1-10)</Label>
                  <Input type="number" min="0" max="10" value={impact} onChange={(e) => setImpact(Number(e.target.value))} />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-600 mb-1 block">Innovation (1-10)</Label>
                  <Input type="number" min="0" max="10" value={innovation} onChange={(e) => setInnovation(Number(e.target.value))} />
                </div>
              </div>

              <div className="space-y-2 mb-6 relative">
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs font-bold text-slate-600 block">Private Note (Optional)</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs text-brand hover:text-brand-light px-2"
                    onClick={handleRefineNote}
                    disabled={isRefining || !privateNote.trim()}
                  >
                    {isRefining ? <Loader className="w-3 h-3 mr-1" variant="simple-spin" /> : <Wand2 className="w-3 h-3 mr-1" />}
                    Refine
                  </Button>
                </div>
                <Textarea 
                  placeholder="Your thoughts... (Only visible to admins)" 
                  value={privateNote}
                  onChange={(e) => setPrivateNote(e.target.value)}
                  className="text-sm min-h-[100px] bg-white"
                />
              </div>

              <Button 
                onClick={handleSaveReview}
                disabled={loading}
                className="w-full bg-brand text-white hover:bg-brand-light"
              >
                {loading ? <Loader className="w-4 h-4 mr-2" variant="simple-spin" /> : null}
                Save Review
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* LEFT LIST PANEL */}
      <div className="w-full md:w-1/3 border-r border-slate-200 bg-slate-50 overflow-y-auto flex flex-col">
        <div className="p-3 border-b border-slate-200 bg-slate-100/50 flex gap-2 shrink-0 overflow-x-auto hide-scrollbar">
          <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")} className="rounded-full">All</Button>
          <Button size="sm" variant={filter === "pending" ? "default" : "outline"} onClick={() => setFilter("pending")} className="rounded-full">Pending</Button>
          <Button size="sm" variant={filter === "reviewed" ? "default" : "outline"} onClick={() => setFilter("reviewed")} className="rounded-full">Reviewed</Button>
        </div>
        
        {filteredSubmissions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No submissions found for this filter.
          </div>
        ) : (
          filteredSubmissions.map((sub) => {
            const isSelected = selectedSub?.id === sub.id;
            const isReviewedByMe = reviews.some(r => r.submission_id === sub.id);
            
            return (
              <button
                key={sub.id}
                onClick={() => handleSelect(sub)}
                className={`text-left p-4 border-b border-slate-200 transition-colors ${
                  isSelected ? "bg-white border-l-4 border-l-brand" : "hover:bg-white border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 truncate pr-2">
                    {sub.project_name}
                  </h3>
                  {isReviewedByMe && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                  {sub.tagline}
                </p>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded">
                    {sub.track}
                  </span>
                  <span className="text-brand">
                    Score: {sub.total_score}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* RIGHT DETAILS PANEL - DESKTOP */}
      <div className="hidden md:flex flex-1 overflow-y-auto bg-white flex-col">
        {selectedSub ? renderDetails() : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Select an application from the list to review.
          </div>
        )}
      </div>

      {/* RIGHT DETAILS PANEL - MOBILE DRAWER */}
      <Drawer open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
        <DrawerContent className="h-[90vh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Review Application</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto">
            {renderDetails()}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
