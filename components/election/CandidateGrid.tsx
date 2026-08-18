"use client";

import React from "react";
import { Candidate } from "@/types/election";
import CandidateCard from "./CandidateCard";

interface CandidateGridProps {
  candidates: Candidate[];
  compact?: boolean;
}

export default function CandidateGrid({ candidates, compact = false }: CandidateGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {candidates.map((candidate) => (
        <CandidateCard key={candidate.id} candidate={candidate} compact={compact} />
      ))}
    </div>
  );
}
