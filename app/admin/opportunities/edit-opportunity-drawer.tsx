"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  updateOpportunity,
  createOpportunity,
} from "@/app/actions/admin-opportunities";
import { Opportunity } from "@/lib/types";
import { Loader } from "@/components/ui/loader";
import { Switch } from "@/components/ui/switch";

interface EditOpportunityDrawerProps {
  opportunity: Opportunity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditOpportunityDrawer({
  opportunity,
  open,
  onOpenChange,
}: EditOpportunityDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [description, setDescription] = useState("");
  const [summary, setSummary] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [opportunityType, setOpportunityType] = useState("job");
  const [locationType, setLocationType] = useState("unspecified");
  const [location, setLocation] = useState("");
  const [compensation, setCompensation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("approved");
  const [featured, setFeatured] = useState(false);
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (open) {
      if (opportunity) {
        setTitle(opportunity.title);
        setOrganization(opportunity.organization);
        setDescription(opportunity.description);
        setSummary(opportunity.summary);
        setApplicationUrl(opportunity.application_url);
        setOpportunityType(opportunity.opportunity_type);
        setLocationType(opportunity.location_type);
        setLocation(opportunity.location || "");
        setCompensation(opportunity.compensation || "");
        setDeadline(
          opportunity.deadline
            ? new Date(opportunity.deadline).toISOString().slice(0, 16)
            : "",
        );
        setStatus(opportunity.status);
        setFeatured(opportunity.featured);
        setTags(opportunity.tags ? opportunity.tags.join(", ") : "");
      } else {
        // Reset for new creation
        setTitle("");
        setOrganization("");
        setDescription("");
        setSummary("");
        setApplicationUrl("");
        setOpportunityType("job");
        setLocationType("unspecified");
        setLocation("");
        setCompensation("");
        setDeadline("");
        setStatus("approved");
        setFeatured(false);
        setTags("");
      }
      setError(null);
    }
  }, [opportunity, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("organization", organization);
    formData.append("description", description);
    formData.append("summary", summary);
    formData.append("application_url", applicationUrl);
    formData.append("opportunity_type", opportunityType);
    formData.append("location_type", locationType);
    if (location) formData.append("location", location);
    if (compensation) formData.append("compensation", compensation);
    if (deadline) formData.append("deadline", new Date(deadline).toISOString());
    formData.append("status", status);
    formData.append("featured", featured ? "true" : "false");
    formData.append("tags", tags);

    let result;
    if (opportunity) {
      result = await updateOpportunity(opportunity.id, formData);
    } else {
      result = await createOpportunity(formData);
    }

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-md">
        <div className="mx-auto w-full h-full flex flex-col">
          <DrawerHeader className="shrink-0 border-b border-border">
            <DrawerTitle>
              {opportunity ? "Edit Opportunity" : "Create Opportunity"}
            </DrawerTitle>
            <DrawerDescription>
              {opportunity
                ? "Modify the opportunity details."
                : "Add a new bespoke opportunity manually."}
            </DrawerDescription>
          </DrawerHeader>

          <ScrollArea className="flex-1 px-4 py-4">
            <form
              id="edit-opp-form"
              onSubmit={handleSubmit}
              className="space-y-6 pb-8"
            >
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Organization</Label>
                  <Input
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Application URL</Label>
                  <Input
                    type="url"
                    value={applicationUrl}
                    onChange={(e) => setApplicationUrl(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Short Summary</Label>
                  <Textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    required
                    className="h-20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (Markdown)</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="min-h-[150px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={opportunityType}
                      onValueChange={setOpportunityType}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="job">Job</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="hackathon">Hackathon</SelectItem>
                        <SelectItem value="scholarship">Scholarship</SelectItem>
                        <SelectItem value="fellowship">Fellowship</SelectItem>
                        <SelectItem value="grant">Grant</SelectItem>
                        <SelectItem value="bootcamp">Bootcamp</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Location Type</Label>
                    <Select
                      value={locationType}
                      onValueChange={setLocationType}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="onsite">Onsite</SelectItem>
                        <SelectItem value="unspecified">Unspecified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Location (Optional)</Label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Lagos, Nigeria"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Compensation (Optional)</Label>
                    <Input
                      value={compensation}
                      onChange={(e) => setCompensation(e.target.value)}
                      placeholder="e.g. Paid, $1k Prize"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Deadline (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending_review">
                          Pending Review
                        </SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags (CSV)</Label>
                  <Input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="react, typescript, ui"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    id="featured"
                    checked={featured}
                    onCheckedChange={setFeatured}
                  />
                  <Label htmlFor="featured">Featured Opportunity</Label>
                </div>
              </div>
            </form>
          </ScrollArea>

          <DrawerFooter className="shrink-0 border-t border-border flex-row justify-end gap-2 p-4">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
            <Button type="submit" form="edit-opp-form" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2" variant="simple-spin" />{" "}
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
