"use client";

import React from "react";
import { getCandidates } from "@/lib/election";
import CandidateGrid from "@/components/election/CandidateGrid";
import { Users } from "lucide-react";

export default function CandidatesPage() {
  const candidates = getCandidates();

  return (
    <div className="py-6 space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-nisc-orange-light flex items-center justify-center mx-auto mb-4">
          <Users className="w-7 h-7 text-nisc-orange" />
        </div>
        <h1 className="font-heading text-3xl font-extrabold text-nisc-navy">
          2026–27 Candidates
        </h1>
        <p className="text-sm text-nisc-gray mt-2">
          All three candidates are contesting for both President and Vice President. Click on any candidate to read their full manifesto.
        </p>
      </div>

      <CandidateGrid candidates={candidates} />
    </div>
  );
}
