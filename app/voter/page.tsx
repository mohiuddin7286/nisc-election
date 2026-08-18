"use client";

import React, { useEffect, useState } from "react";
import VoterLogin from "@/components/election/VoterLogin";
import VoterProfile from "@/components/election/VoterProfile";
import VotingForm from "@/components/election/VotingForm";
import VoteReview from "@/components/election/VoteReview";
import VoteConfirmation from "@/components/election/VoteConfirmation";
import { getStoredVoterSession, setStoredVoterSession, clearVoterSession, getStoredVotersList } from "@/lib/auth";
import { getCandidates, submitVoteBallot } from "@/lib/election";
import { Candidate, Position, Voter } from "@/types/election";
import { AlertCircle, Vote } from "lucide-react";

type VoterFlowStep = "LOGIN" | "PROFILE" | "BALLOT" | "REVIEW" | "CONFIRMATION";

export default function VoterPage() {
  const [voter, setVoter] = useState<Voter | null>(null);
  const [candidates] = useState<Candidate[]>(getCandidates());
  const [step, setStep] = useState<VoterFlowStep>("LOGIN");
  const [selections, setSelections] = useState<Record<Position, string> | null>(null);
  const [receipt, setReceipt] = useState<{ id: string; timestamp: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const session = getStoredVoterSession();
    if (session) {
      // Cross-reference with latest voter list to get updated hasVoted status
      const latestVoters = getStoredVotersList();
      const latest = latestVoters.find((v) => v.rollNumber === session.rollNumber);
      const refreshedVoter = latest || session;
      setVoter(refreshedVoter);
      setStep("PROFILE");
    }
  }, []);

  const handleLoginSuccess = (authenticatedVoter: Voter) => {
    setVoter(authenticatedVoter);
    setStep("PROFILE");
  };

  const handleReviewSelections = (ballotSelections: Record<Position, string>) => {
    setSelections(ballotSelections);
    setStep("REVIEW");
  };

  const handleConfirmSubmit = () => {
    if (!voter || !selections) return;

    const res = submitVoteBallot(voter, selections);
    if (res.success && res.receiptId) {
      const now = new Date().toISOString();
      setReceipt({ id: res.receiptId, timestamp: now });
      const updatedVoter = { ...voter, hasVoted: true, voteReceiptId: res.receiptId, voteTimestamp: now };
      setVoter(updatedVoter);
      setStoredVoterSession(updatedVoter); // Persist the updated session
      setStep("CONFIRMATION");
    } else {
      setSubmitError(res.message);
    }
  };

  return (
    <div className="py-6 space-y-6">
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="w-14 h-14 rounded-2xl bg-nisc-orange-light flex items-center justify-center mx-auto mb-4">
          <Vote className="w-7 h-7 text-nisc-orange" />
        </div>
        <h1 className="font-heading text-3xl font-extrabold text-nisc-navy">
          NISC Voter Portal
        </h1>
        <p className="text-sm text-nisc-gray mt-2">
          Secure voting portal for the NISC Council Election 2026–27.
        </p>
      </div>

      {submitError && (
        <div className="max-w-xl mx-auto bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Render Step */}
      {step === "LOGIN" && <VoterLogin onLoginSuccess={handleLoginSuccess} />}

      {step === "PROFILE" && voter && (
        <div className="max-w-4xl mx-auto">
          <VoterProfile
            voter={voter}
            onProceedToVoting={() => setStep("BALLOT")}
            onLogout={() => {
              clearVoterSession();
              setVoter(null);
              setStep("LOGIN");
            }}
          />
        </div>
      )}

      {step === "BALLOT" && (
        <div className="max-w-3xl mx-auto">
          <VotingForm
            candidates={candidates}
            onReviewSelections={handleReviewSelections}
          />
        </div>
      )}

      {step === "REVIEW" && voter && selections && (
        <VoteReview
          voter={voter}
          candidates={candidates}
          selections={selections}
          onBackToEdit={() => setStep("BALLOT")}
          onConfirmSubmit={handleConfirmSubmit}
        />
      )}

      {step === "CONFIRMATION" && receipt && (
        <VoteConfirmation
          receiptId={receipt.id}
          timestamp={receipt.timestamp}
          onDone={() => setStep("PROFILE")}
        />
      )}
    </div>
  );
}
