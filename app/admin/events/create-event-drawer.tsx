"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles } from "lucide-react";
import { createEvent, generateEventWithAI } from "@/app/actions/admin-events";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { FileUploader } from "@/components/ui/file-uploader";
import { useLocalStorageState } from "@/hooks/use-local-storage";

export function CreateEventDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const [title, setTitle] = useLocalStorageState("create-event-title", "");
  const [description, setDescription] = useLocalStorageState(
    "create-event-desc",
    "",
  );
  const [eventDate, setEventDate] = useLocalStorageState(
    "create-event-date",
    "",
  );
  const [location, setLocation] = useLocalStorageState("create-event-loc", "");
  const [eventType, setEventType] = useLocalStorageState(
    "create-event-type",
    "general",
  );
  const [pointsAwarded, setPointsAwarded] = useLocalStorageState(
    "create-event-points",
    "50",
  );
  const [claimCode, setClaimCode] = useLocalStorageState(
    "create-event-code",
    "",
  );
  const [claimExpiresAt, setClaimExpiresAt] = useLocalStorageState(
    "create-event-exp",
    "",
  );
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [meetingUrl, setMeetingUrl] = useLocalStorageState(
    "create-event-meet",
    "",
  );

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt for the AI.");
      return;
    }
    setAiLoading(true);
    const res = await generateEventWithAI(aiPrompt);
    setAiLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else if (res?.data) {
      setTitle(res.data.title || "");
      setDescription(res.data.description || "");
      setEventType(res.data.event_type || "general");
      setPointsAwarded(res.data.points_awarded?.toString() || "50");
      setLocation(res.data.location || "");
      setLocation(res.data.location || "");
      setMeetingUrl(res.data.meeting_url || "");
      toast.success("Event details generated!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("eventDate", eventDate);
    formData.append("location", location);
    formData.append("eventType", eventType);
    formData.append("pointsAwarded", pointsAwarded);
    formData.append("claimCode", claimCode);
    if (claimExpiresAt) formData.append("claimExpiresAt", claimExpiresAt);
    if (coverImageFile) formData.append("coverImageFile", coverImageFile);
    if (meetingUrl) formData.append("meetingUrl", meetingUrl);

    const res = await createEvent(formData);
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Event created successfully!");
      onOpenChange(false);
      // Reset form
      setTitle("");
      setDescription("");
      setEventDate("");
      setLocation("");
      setPointsAwarded("50");
      setClaimCode("");
      setCoverImageFile(null);
      setMeetingUrl("");
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="w-full md:w-[600px] right-0 left-auto h-screen top-0 mt-0 rounded-none data-[vaul-drawer-direction=bottom]:h-auto data-[vaul-drawer-direction=bottom]:max-h-[85vh] data-[vaul-drawer-direction=bottom]:rounded-t-xl data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:inset-x-0">
        <ScrollArea className="h-full overflow-y-auto scrollbar-hide">
          <div className="p-6">
            <DrawerHeader className="px-0 pt-0 text-left">
              <DrawerTitle>Create New Event</DrawerTitle>
              <DrawerDescription>
                Schedule an event and configure claim codes for live points.
              </DrawerDescription>
            </DrawerHeader>

            {/* AI Generator */}
            <div className="bg-brand/5 border border-brand/20 p-4 rounded-xl mb-6">
              <Label className="text-brand font-bold flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" /> AI Assist
              </Label>
              <div className="flex flex-col gap-2">
                <Textarea
                  placeholder="e.g. Google Alumni system design talk next Friday"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="bg-background/50 min-h-[80px] max-h-[160px] resize-y"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleGenerateAI();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <Loader className="w-4 h-4 mr-2" variant="simple-spin" />
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>
            </div>

            <form
              id="create-event-form"
              onSubmit={handleSubmit}
              className="space-y-8 pb-8"
            >
              {/* --- Basic Details --- */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b border-border pb-2">
                  Basic Details
                </h4>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description (Markdown)</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-32 min-h-[100px] resize-y"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Event Type</Label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="alumni_talk">Alumni Talk</SelectItem>
                        <SelectItem value="hackathon">Hackathon</SelectItem>
                        <SelectItem value="dsa_sprint">DSA Sprint</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cover Image (Optional)</Label>
                    <FileUploader 
                      value={coverImageFile}
                      onChange={setCoverImageFile}
                      accept="image/*"
                      maxSizeMB={5}
                    />
                  </div>
                </div>
              </div>

              {/* --- Scheduling & Location --- */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b border-border pb-2">
                  Scheduling & Location
                </h4>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Event Date</Label>
                    <DateTimePicker
                      value={eventDate}
                      onChange={(d) => setEventDate(d)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Venue Location</Label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Hall B or TBA"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Online Link (Optional)</Label>
                  <Input
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    placeholder="https://zoom.us/..."
                  />
                </div>
              </div>

              {/* --- Gamification --- */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b border-border pb-2">
                  Gamification
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Points Awarded</Label>
                    <Input
                      type="number"
                      value={pointsAwarded}
                      onChange={(e) => setPointsAwarded(e.target.value)}
                      min="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Claim Code</Label>
                    <Input
                      value={claimCode}
                      onChange={(e) => setClaimCode(e.target.value)}
                      placeholder="e.g. SEES2026"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Claim Expires At</Label>
                  <DateTimePicker
                    value={claimExpiresAt}
                    onChange={(d) => setClaimExpiresAt(d)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deadline for users to enter the code.
                  </p>
                </div>
              </div>
            </form>
          </div>

          <DrawerFooter className="border-t border-border pt-4">
            <Button
              type="submit"
              form="create-event-form"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader className="w-5 h-5 mr-2" variant="simple-spin" />
              ) : null}
              Create Event
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full mt-2">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
