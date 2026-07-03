"use client";

import { motion } from "motion/react";
import { Users } from "lucide-react";

const TEAM_MEMBERS = [
  {
    name: "Victor Mathias",
    role: "President, SEES UNILAG",
    img: "excos/mathias.jpg",
  },
  {
    name: "Akeem Jr Odebiyi",
    role: "Team Lead",
    img: "excos/akeem.jpg",
  },
  {
    name: "Eyitayo Obembe",
    role: "Technical Lead",
    img: "excos/eyitayo.jpg",
  },
  {
    name: "Daniel Olorunda",
    role: "Events and Partnerships Lead",
    img: "excos/light.jpg",
  },
  {
    name: "Prosper Marshall",
    role: "Community Manager",
    img: "excos/prosper.jpg",
  },
];

export function TeamRoster() {
  return (
    <section className="py-24 md:py-32 bg-slate-50 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mb-6 mx-auto">
            <Users className="w-4 h-4" />
            The Builders
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-[1.1] mb-6 max-w-2xl mx-auto">
            Meet the people behind the{" "}
            <span className="font-serif italic text-brand">Hub.</span>
          </h2>
        </div>

        {/* Masonry/Asymmetrical Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {TEAM_MEMBERS.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative group overflow-hidden rounded-2xl bg-slate-200 ${
                i === 0
                  ? "md:col-span-2 md:row-span-2 aspect-square md:aspect-auto"
                  : "aspect-[3/4]"
              }`}
            >
              <img
                src={member.img}
                alt={member.name}
                className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
              />

              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <h3 className="text-white font-serif font-semibold text-xl md:text-2xl">
                  {member.name}
                </h3>
                <p className="text-white/80 font-medium text-sm">
                  {member.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-600 mb-6 font-medium">
            Think you have what it takes to build the Hub?
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-300 text-slate-800 font-bold hover:bg-slate-100 transition-colors"
          >
            <Users className="w-4 h-4" />
            Apply to Join the Team
          </a>
        </div>
      </div>
    </section>
  );
}
