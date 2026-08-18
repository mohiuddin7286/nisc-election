"use client";

import React, { useState } from "react";
import { Candidate, Position, Voter } from "@/types/election";
import { ArrowLeft, ShieldCheck, AlertTriangle } from "lucide-react";

interface VoteReviewProps {
  voter: Voter;
  candidates: Candidate[];
  selections: Record<Position, string>;
  onBackToEdit: () => void;
  onConfirmSubmit: () => void;
}

export default function VoteReview({
  voter,
  candidates,
  selections,
  onBackToEdit,
  onConfirmSubmit,
}: VoteReviewProps) {
  const [confirmed, setConfirmed] = useState(false);

  const getCandidate = (id: string) => candidates.find((c) => c.id === id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="nisc-card p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-nisc-navy">
            Review Your Ballot
          </h2>
          <p className="text-sm text-nisc-gray mt-1">
            Please verify your selections before final submission. This action cannot be undone.
          </p>
        </div>

        {/* Voter Info */}
        <div className="bg-nisc-gray-light rounded-xl p-4 mb-6">
          <p className="text-xs text-nisc-gray font-medium uppercase tracking-wider mb-1">Voter</p>
          <p className="font-semibold text-nisc-navy">{voter.name}</p>
          <p className="text-sm text-nisc-gray">
            {voter.rollNumber} • {voter.year} • {voter.department}
          </p>
        </div>

        {/* Selections */}
        <div className="space-y-4 mb-6">
          {(Object.entries(selections) as [Position, string][]).map(([position, candId]) => {
            const cand = getCandidate(candId);
            if (!cand) return null;
            return (
              <div
                key={position}
                className="flex items-center gap-4 p-4 rounded-xl border border-nisc-border bg-white"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: cand.colorLight }}
                >
                  {cand.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-nisc-gray font-medium uppercase tracking-wider">
                    {position}
                  </p>
                  <p className="font-heading font-bold text-nisc-navy">{cand.name}</p>
                  <p className="text-xs text-nisc-gray">{cand.codename}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirmation Checkbox */}
        <label className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer mb-6">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-nisc-orange"
          />
          <span className="text-sm text-amber-800">
            I confirm that my selections are correct and I understand that this vote is final and cannot be changed.
          </span>
        </label>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onBackToEdit}
            className="flex-1 nisc-btn-outline text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back & Edit
          </button>
          <button
            onClick={onConfirmSubmit}
            disabled={!confirmed}
            className="flex-1 nisc-btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShieldCheck className="w-4 h-4" /> Submit My Vote
          </button>
        </div>
      </div>
    </div>
  );
}
