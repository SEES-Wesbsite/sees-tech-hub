import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, ArrowRight, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface RecommendedEventsProps {
  events: any[];
}

export function RecommendedEvents({ events }: RecommendedEventsProps) {
  if (!events || events.length === 0) return null;

  return (
    <Card className="bg-foreground/5 border-border/50 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-3 border-b border-border/10 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand" />
          Upcoming Events
        </CardTitle>
        <Link href="/events" className="text-sm text-brand hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/10">
          {events.map((event) => {
            const startDate = new Date(event.start_time);
            return (
              <Link 
                key={event.id} 
                href={`/events/${event.id}`}
                className="block p-4 hover:bg-foreground/5 transition-colors group"
              >
                <div className="flex gap-4">
                  {/* Date Badge */}
                  <div className="flex flex-col items-center justify-center bg-foreground/5 border border-border/50 rounded-xl min-w-[60px] h-[60px] p-2">
                    <span className="text-xs font-bold text-brand uppercase">{format(startDate, 'MMM')}</span>
                    <span className="text-xl font-black font-mono leading-none mt-1">{format(startDate, 'd')}</span>
                  </div>
                  
                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground group-hover:text-brand transition-colors line-clamp-1">
                      {event.title}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{format(startDate, 'h:mm a')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1 max-w-[150px]">{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
