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
import { Zap } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { claimEventPoints } from "@/app/actions/user-events";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface ClaimDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string | null;
  eventTitle: string;
}

export function ClaimDrawer({
  open,
  onOpenChange,
  eventId,
  eventTitle,
}: ClaimDrawerProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    if (!code.trim()) {
      toast.error("Please enter the claim code.");
      return;
    }

    setLoading(true);
    const res = await claimEventPoints(eventId, code.trim());
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else if (res?.success) {
      // Confetti celebration!
      const duration = 3 * 1000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#025c48", "#95fde2", "#ffb703"],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#025c48", "#95fde2", "#ffb703"],
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      toast.success(`Success! You earned +${res.pointsAwarded} XP!`);
      onOpenChange(false);
      setCode("");
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm px-4 py-8">
          <DrawerHeader className="px-0 pt-0 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <DrawerTitle className="text-2xl font-serif text-center">
              Claim Points
            </DrawerTitle>
            <DrawerDescription className="text-center mt-2">
              You are claiming attendance points for{" "}
              <strong className="text-foreground">{eventTitle}</strong>. Enter the claim code provided by the organizer at the venue or in the meeting chat.
            </DrawerDescription>
          </DrawerHeader>

          <form onSubmit={handleClaim} className="space-y-6 mt-4">
            <div>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter Claim Code"
                className="text-center text-3xl font-mono tracking-widest h-16 uppercase bg-foreground/5 border-2 focus-visible:ring-brand focus-visible:border-brand transition-all rounded-2xl"
                maxLength={10}
                required
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            <DrawerFooter className="px-0 pb-0">
              <Button
                type="submit"
                disabled={loading || code.length < 3}
                variant="default"
                className="w-full h-12 rounded-xl text-lg font-bold"
              >
                {loading ? (
                  <Loader className="w-5 h-5 mr-2" variant="simple-spin" />
                ) : (
                  "Claim XP"
                )}
              </Button>
              <DrawerClose asChild>
                <Button variant="ghost" className="w-full mt-2">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
