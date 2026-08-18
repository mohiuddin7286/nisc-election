"use client";

import React, { useState } from "react";
import { authenticateVoter } from "@/lib/auth";
import { Voter } from "@/types/election";
import { LogIn, AlertCircle } from "lucide-react";

interface VoterLoginProps {
  onLoginSuccess: (voter: Voter) => void;
}

export default function VoterLogin({ onLoginSuccess }: VoterLoginProps) {
  const [rollNumber, setRollNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const result = authenticateVoter(rollNumber);
      if (result.success && result.voter) {
        onLoginSuccess(result.voter);
      } else {
        setError(result.message);
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="nisc-card p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-nisc-orange-light flex items-center justify-center mx-auto mb-5">
          <LogIn className="w-7 h-7 text-nisc-orange" />
        </div>

        <h2 className="font-heading font-bold text-2xl text-nisc-navy mb-2">
          Voter Authentication
        </h2>
        <p className="text-sm text-nisc-gray mb-6">
          Enter your KLH roll number to verify your identity and access the ballot.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label
              htmlFor="rollNumber"
              className="block text-sm font-medium text-nisc-navy mb-1.5"
            >
              Roll Number
            </label>
            <input
              id="rollNumber"
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="e.g. 2410080026"
              className="w-full px-4 py-3 rounded-xl border border-nisc-border bg-white text-nisc-navy placeholder:text-slate-400 focus:outline-none focus:border-nisc-orange focus:ring-2 focus:ring-nisc-orange/20 transition-all text-sm"
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-left">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !rollNumber.trim()}
            className="w-full nisc-btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Verifying...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Verify & Continue
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-nisc-gray mt-5">
          Only registered NISC members can access the voting portal.
        </p>
      </div>
    </div>
  );
}
