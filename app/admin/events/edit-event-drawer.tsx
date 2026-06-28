"use client";

import { useState, useEffect } from "react";
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
import { Loader2, Radio, CheckCircle, Ban } from "lucide-react";
import { updateEvent, setEventStatus } from "@/app/actions/admin-events";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader } from "@/components/ui/loader";
import { DateTimePicker } from "@/components/ui/date-time-picker";

export function EditEventDrawer({
  open,
  onOpenChange,
  eventData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventData: any;
}) {
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [eventType, setEventType] = useState("general");
  const [pointsAwarded, setPointsAwarded] = useState("50");
  const [claimCode, setClaimCode] = useState("");
  const [claimExpiresAt, setClaimExpiresAt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [status, setStatus] = useState("upcoming");

  useEffect(() => {
    if (eventData) {
      setTitle(eventData.title || "");
      setDescription(eventData.description || "");
      // Format datetime-local requires YYYY-MM-DDTHH:mm
      setEventDate(
        eventData.event_date
          ? new Date(eventData.event_date).toISOString().slice(0, 16)
          : "",
      );
      setLocation(eventData.location || "");
      setEventType(eventData.event_type || "general");
      setPointsAwarded(eventData.points_awarded?.toString() || "0");
      setClaimCode(eventData.claim_code || "");
      setClaimExpiresAt(
        eventData.claim_expires_at
          ? new Date(eventData.claim_expires_at).toISOString().slice(0, 16)
          : "",
      );
      setCoverImageUrl(eventData.cover_image_url || "");
      setMeetingUrl(eventData.meeting_url || "");
      setStatus(eventData.status || "upcoming");
    }
  }, [eventData]);

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
    if (coverImageUrl) formData.append("coverImageUrl", coverImageUrl);
    if (meetingUrl) formData.append("meetingUrl", meetingUrl);
    formData.append("status", status);

    const res = await updateEvent(eventData.id, formData);
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Event updated successfully!");
      onOpenChange(false);
    }
  };

  const handleStatusChange = async (
    newStatus: "upcoming" | "live" | "completed" | "cancelled",
  ) => {
    if (
      !confirm(
        `Are you sure you want to set the status to ${newStatus.toUpperCase()}?`,
      )
    )
      return;

    setStatusLoading(true);
    const res = await setEventStatus(eventData.id, newStatus);
    setStatusLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(`Event is now ${newStatus.toUpperCase()}`);
      setStatus(newStatus);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-full md:w-[600px] rounded-none">
        <ScrollArea className="h-full overflow-y-auto scrollbar-hide">
          <div className="p-6">
            <DrawerHeader className="px-0 pt-0 text-left">
              <DrawerTitle>Edit Event</DrawerTitle>
              <DrawerDescription>
                Update details or change lifecycle status.
              </DrawerDescription>
            </DrawerHeader>

            {/* Lifecycle Status Management */}
            <div className="bg-foreground/5 border border-border/50 rounded-xl p-4 mb-6 space-y-3">
              <Label className="font-bold text-foreground block">
                Event Lifecycle
              </Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={status === "live" ? "default" : "outline"}
                  className={
                    status === "live"
                      ? "bg-success text-success-foreground"
                      : "border-success text-success hover:bg-success/10"
                  }
                  onClick={() => handleStatusChange("live")}
                  disabled={statusLoading || status === "live"}
                >
                  <Radio className="w-4 h-4 mr-2" /> Go Live (Open Claims)
                </Button>
                <Button
                  type="button"
                  variant={status === "completed" ? "default" : "outline"}
                  onClick={() => handleStatusChange("completed")}
                  disabled={statusLoading || status === "completed"}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Mark Completed
                </Button>
                <Button
                  type="button"
                  variant={status === "cancelled" ? "destructive" : "outline"}
                  className={
                    status === "cancelled"
                      ? ""
                      : "border-destructive text-destructive hover:bg-destructive/10"
                  }
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={statusLoading || status === "cancelled"}
                >
                  <Ban className="w-4 h-4 mr-2" /> Cancel Event
                </Button>
              </div>
            </div>

            <form
              id="edit-event-form"
              onSubmit={handleSubmit}
              className="space-y-8 pb-8"
            >
              {/* --- Basic Details --- */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b border-border pb-2">Basic Details</h4>
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
                    <Label>Cover Image URL (Required for Hero UI)</Label>
                    <Input
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      placeholder="https://..."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* --- Scheduling & Location --- */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b border-border pb-2">Scheduling & Location</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <h4 className="font-semibold text-lg border-b border-border pb-2">Gamification</h4>
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
              form="edit-event-form"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader className="w-5 h-5 mr-2" variant="simple-spin" />
              ) : null}
              Save Changes
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
