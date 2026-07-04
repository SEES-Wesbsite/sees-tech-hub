"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";
import { verifyStage2Code } from "@/app/actions/hackathon";
import { ArrowRight, Lock } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";

export default function Stage2GatewayPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 5) {
      toast.error("Please enter a valid qualification code.");
      return;
    }

    setLoading(true);
    const res = await verifyStage2Code(code.trim().toUpperCase());
    
    if (res?.error) {
      toast.error(res.error);
      setLoading(false);
    }
    // If successful, the server action handles the redirect
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 flex flex-col items-center justify-center px-4">
      <FadeIn className="w-full max-w-md">
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xl text-center">
          <div className="w-16 h-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-2">
            Stage 2 Gateway
          </h1>
          <p className="text-slate-600 mb-8">
            Enter the unique Qualification Code from your acceptance email to access the final submission portal.
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. STH-X9A2M"
                className="text-center font-mono text-lg h-14"
                maxLength={10}
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading || !code}
              className="w-full h-14 text-lg bg-brand text-white hover:bg-brand-light shadow-lg shadow-brand/20 rounded-xl"
            >
              {loading ? <Loader className="w-5 h-5 mr-2" variant="simple-spin" /> : null}
              Access Stage 2 <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>
        </div>
      </FadeIn>
    </div>
  );
}
