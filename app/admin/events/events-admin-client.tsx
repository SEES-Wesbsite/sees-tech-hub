"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Search, Plus, Calendar, Users, MapPin, Edit } from "lucide-react";
import { CreateEventDrawer } from "./create-event-drawer";
import { EditEventDrawer } from "./edit-event-drawer";

interface EventsAdminClientProps {
  initialEvents: any[];
}

export function EventsAdminClient({ initialEvents }: EventsAdminClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const filteredEvents = initialEvents.filter((evt) => {
    if (
      searchQuery &&
      !evt.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (statusFilter !== "ALL" && evt.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-info/10 text-info border-info";
      case "live":
        return "bg-success/10 text-success border-success animate-pulse";
      case "completed":
        return "bg-foreground/10 text-muted-foreground border-border";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive";
      default:
        return "bg-foreground/10 text-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Actions */}
      <div className="flex flex-col md:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center justify-between md:justify-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-foreground/5 border-border rounded-xl w-full sm:w-64"
            />
          </div>
          <Button onClick={() => setCreateOpen(true)} variant="default">
            <Plus className="w-4 h-4" /> New Event
          </Button>
        </div>
        <div className="flex items-center gap-3 bg-foreground/5 p-1 rounded-xl w-fit">
          {["ALL", "upcoming", "live", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                statusFilter === status
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {status === "ALL"
                ? "All"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="bg-foreground/5 border border-border/50 rounded-2xl p-6 relative flex flex-col h-full hover:border-border transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <Badge variant="outline" className={getStatusColor(evt.status)}>
                {evt.status.toUpperCase()}
              </Badge>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground -mr-2 -mt-2"
                onClick={() => {
                  setSelectedEvent(evt);
                  setEditOpen(true);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>

            <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-2">
              {evt.title}
            </h3>

            <div className="space-y-2 mt-4 flex-grow">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                {format(new Date(evt.event_date), "MMM d, yyyy • h:mm a")}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2" />
                {evt.location || "TBA"}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-2" />
                {evt.rsvp_count} RSVPs • {evt.claim_count} Claims
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
              <span className="font-mono text-brand font-bold">
                +{evt.points_awarded} XP
              </span>
              {evt.claim_code && (
                <code className="px-2 py-1 bg-foreground/10 rounded font-mono text-xs">
                  {evt.claim_code}
                </code>
              )}
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border/50 rounded-2xl">
            No events found matching your criteria.
          </div>
        )}
      </div>

      <CreateEventDrawer open={createOpen} onOpenChange={setCreateOpen} />
      {selectedEvent && (
        <EditEventDrawer
          open={editOpen}
          onOpenChange={setEditOpen}
          eventData={selectedEvent}
        />
      )}
    </div>
  );
}
