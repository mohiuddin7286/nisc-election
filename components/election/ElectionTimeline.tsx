"use client";

import React from "react";
import { FileText, CheckCircle2, Megaphone, Vote, Trophy } from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Nomination",
    status: "CLOSED" as const,
    icon: FileText,
    description: "Eligible members submit nominations. Nomination process is now CLOSED.",
  },
  {
    step: 2,
    title: "Verification",
    status: "COMPLETED" as const,
    icon: CheckCircle2,
    description: "Applications reviewed by Election Committee. 2 non-eligible nominations were cancelled.",
  },
  {
    step: 3,
    title: "Campaign",
    status: "ACTIVE" as const,
    icon: Megaphone,
    description: "Candidates present vision & manifesto until 20 August 2026, 4:00 PM.",
  },
  {
    step: 4,
    title: "Voting",
    status: "UPCOMING" as const,
    icon: Vote,
    description: "Procedure & rules announced on 20 August 2026, 9:00 PM. Secret ballot conducted.",
  },
  {
    step: 5,
    title: "Results",
    status: "UPCOMING" as const,
    icon: Trophy,
    description: "Votes counted transparently and official winners declared.",
  },
];

const statusStyles: Record<string, { badge: string; text: string }> = {
  CLOSED: { badge: "bg-red-50 text-red-600 border-red-200", text: "text-red-600" },
  COMPLETED: { badge: "bg-green-50 text-green-600 border-green-200", text: "text-green-600" },
  ACTIVE: { badge: "bg-amber-50 text-amber-600 border-amber-200", text: "text-amber-600" },
  UPCOMING: { badge: "bg-blue-50 text-blue-600 border-blue-200", text: "text-blue-600" },
};

export default function ElectionTimeline() {
  return (
    <section className="py-8">
      <div className="text-center mb-8">
        <p className="nisc-badge bg-nisc-orange-light text-nisc-orange border border-orange-200 mx-auto w-fit mb-3">
          Election Process Status
        </p>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-nisc-navy">
          5 Steps to Democratic Transition
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {steps.map((s) => {
          const style = statusStyles[s.status];
          const Icon = s.icon;
          return (
            <div key={s.step} className="nisc-card p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-nisc-orange-light flex items-center justify-center">
                  <Icon className="w-5 h-5 text-nisc-orange" />
                </div>
                <span className={`nisc-badge border text-[10px] ${style.badge}`}>
                  {s.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-nisc-gray font-medium uppercase tracking-wider">
                  Step {s.step}
                </p>
                <h3 className="font-heading font-bold text-nisc-navy text-lg mt-0.5">
                  {s.title}
                </h3>
              </div>
              <p className="text-sm text-nisc-gray leading-relaxed">{s.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
