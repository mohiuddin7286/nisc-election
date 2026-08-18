"use client";

import React, { useState } from "react";
import { Candidate, Position } from "@/types/election";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface VotingFormProps {
  candidates: Candidate[];
  onReviewSelections: (selections: Record<Position, string>) => void;
}

export default function VotingForm({ candidates, onReviewSelections }: VotingFormProps) {
  const [presidentPick, setPresidentPick] = useState<string | null>(null);
  const [vpPick, setVpPick] = useState<string | null>(null);

  const handleSubmit = () => {
    if (presidentPick && vpPick) {
      onReviewSelections({
        President: presidentPick,
        "Vice President": vpPick,
      });
    }
  };

  const renderCandidateOption = (
    candidate: Candidate,
    selected: string | null,
    onSelect: (id: string) => void
  ) => {
    const isSelected = selected === candidate.id;
    return (
      <button
        key={candidate.id}
        onClick={() => onSelect(candidate.id)}
        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
          isSelected
            ? "border-nisc-orange bg-nisc-orange-light shadow-sm"
            : "border-nisc-border bg-white hover:border-nisc-orange/40 hover:bg-nisc-orange-light/30"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{ backgroundColor: candidate.colorLight }}
            >
              {candidate.icon}
            </div>
            <div>
              <p className="font-heading font-bold text-nisc-navy">{candidate.name}</p>
              <p className="text-xs text-nisc-gray">
                {candidate.codename} • {candidate.year} • {candidate.department}
              </p>
            </div>
          </div>
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected
                ? "border-nisc-orange bg-nisc-orange"
                : "border-slate-300 bg-white"
            }`}
          >
            {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-8">
      {/* President Section */}
      <div className="nisc-card p-6">
        <div className="mb-5">
          <span className="nisc-badge bg-amber-50 text-amber-700 border border-amber-200 text-xs mb-2">
            Position 1
          </span>
          <h3 className="font-heading font-bold text-xl text-nisc-navy mt-2">
            Select Your President
          </h3>
          <p className="text-sm text-nisc-gray mt-1">
            Choose one candidate for the role of NISC President 2026–27.
          </p>
        </div>
        <div className="space-y-3">
          {candidates
            .filter((c) => c.contestingFor.includes("President"))
            .map((c) => renderCandidateOption(c, presidentPick, setPresidentPick))}
        </div>
      </div>

      {/* Vice President Section */}
      <div className="nisc-card p-6">
        <div className="mb-5">
          <span className="nisc-badge bg-blue-50 text-blue-700 border border-blue-200 text-xs mb-2">
            Position 2
          </span>
          <h3 className="font-heading font-bold text-xl text-nisc-navy mt-2">
            Select Your Vice President
          </h3>
          <p className="text-sm text-nisc-gray mt-1">
            Choose one candidate for the role of NISC Vice President 2026–27.
          </p>
        </div>
        <div className="space-y-3">
          {candidates
            .filter((c) => c.contestingFor.includes("Vice President"))
            .map((c) => renderCandidateOption(c, vpPick, setVpPick))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!presidentPick || !vpPick}
          className="nisc-btn-primary text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Review My Selections <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
