"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "motion/react";
import { Lightbulb } from "lucide-react";

const BACKLOG = {
  software: [
    {
      title: "SEES Event RSVP & Ticketing",
      desc: "A streamlined platform for managing attendees, generating QR codes, and tracking event participation.",
    },
    {
      title: "UNILAG Ride Share",
      desc: "Connect students traveling the same routes to campus to share costs and reduce traffic.",
    },
    {
      title: "Study Room & Lab Booking Portal",
      desc: "An automated system to reserve study spaces in the library or time slots in department labs.",
    },
  ],
  ai: [
    {
      title: "Lecture Transcriber",
      desc: "Use local speech-to-text models to generate accurate, searchable transcripts of recorded lectures.",
    },
    {
      title: "CGPA Predictor",
      desc: "An AI tool that analyzes past performance and course difficulty to predict future grades and suggest study plans.",
    },
    {
      title: "Smart Waste Classifier",
      desc: "Computer vision applied to campus bins to help students sort recycling from general waste.",
    },
  ],
  cybersecurity: [
    {
      title: "Secure Voting Platform",
      desc: "A cryptographic, tamper-proof voting system for faculty and departmental elections.",
    },
    {
      title: "Campus Phishing Detector",
      desc: "A lightweight browser extension that warns students about fake university login portals or scholarship scams.",
    },
  ],
  embedded: [
    {
      title: "Smart Lab Access",
      desc: "NFC or biometric-based door locks for sensitive laboratory environments.",
    },
    {
      title: "IoT Hostel Power Monitor",
      desc: "A real-time dashboard tracking electricity consumption in specific hostel blocks to identify waste.",
    },
    {
      title: "Automated Department Noticeboard",
      desc: "An e-ink or LCD display system that updates remotely via a web portal, replacing paper notices.",
    },
  ],
};

export function ProjectBacklog() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-brand/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/10 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="container px-4 mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-brand/10 text-brand rounded-full mb-4">
            <Lightbulb className="w-6 h-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">
            Project Backlog
          </h2>
          <p className="text-slate-600 text-lg">
            Need inspiration? Here are some example ideas participants could
            build. You are free to pick one of these or invent your own!
          </p>
        </div>

        <Tabs defaultValue="software" className="w-full">
          <TabsList className="w-full flex gap-2 overflow-x-auto scrollbar-hide h-auto mb-8 bg-slate-100 border border-slate-200 rounded-xl p-4">
            <TabsTrigger className="py-3.5 rounded-md" value="software">
              Software
            </TabsTrigger>
            <TabsTrigger className="py-3.5 rounded-md" value="ai">
              AI / ML
            </TabsTrigger>
            <TabsTrigger className="py-3.5 rounded-md" value="cybersecurity">
              Cybersecurity
            </TabsTrigger>
            <TabsTrigger className="py-3.5 rounded-md" value="embedded">
              Embedded
            </TabsTrigger>
          </TabsList>

          {Object.entries(BACKLOG).map(([trackId, ideas]) => (
            <TabsContent
              key={trackId}
              value={trackId}
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <div className="flex flex-col gap-4">
                {ideas.map((idea, index) => (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: index * 0.1,
                      ease: "easeInOut",
                      duration: 0.4,
                    }}
                    key={`${trackId}-${index}`}
                    className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-brand/30 hover:shadow-md transition-all flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 group-hover:bg-brand/10 group-hover:text-brand flex items-center justify-center font-bold shrink-0 transition-colors">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-slate-900 font-bold mb-1">
                        {idea.title}
                      </h4>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        {idea.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
