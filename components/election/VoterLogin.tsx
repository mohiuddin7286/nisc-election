"use client";

import React, { useState } from "react";
import { authenticateVoter } from "@/lib/auth";
import { Voter } from "@/types/election";
import { LogIn, AlertCircle, Eye, EyeOff, KeyRound, Hash } from "lucide-react";

interface VoterLoginProps {
  onLoginSuccess: (voter: Voter) => void;
}

export default function VoterLogin({ onLoginSuccess }: VoterLoginProps) {
  const [rollNumber, setRollNumber] = useState("");
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await authenticateVoter(rollNumber, passcode);
      if (result.success && result.voter) {
        onLoginSuccess(result.voter);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to authenticate. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
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
          Enter your 10-digit KLH roll number and unique voter passcode to access your ballot.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label
              htmlFor="rollNumber"
              className="flex items-center gap-1.5 text-sm font-medium text-nisc-navy mb-1.5"
            >
              <Hash className="w-4 h-4 text-nisc-orange" /> Roll Number
            </label>
            <input
              id="rollNumber"
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="e.g. 2410080026"
              className="w-full px-4 py-3 rounded-xl border border-nisc-border bg-white text-nisc-navy placeholder:text-slate-400 focus:outline-none focus:border-nisc-orange focus:ring-2 focus:ring-nisc-orange/20 transition-all text-sm font-mono"
              autoComplete="off"
            />
          </div>

          <div className="text-left">
            <label
              htmlFor="passcode"
              className="flex items-center gap-1.5 text-sm font-medium text-nisc-navy mb-1.5"
            >
              <KeyRound className="w-4 h-4 text-nisc-orange" /> Unique Passcode
            </label>
            <div className="relative">
              <input
                id="passcode"
                type={showPasscode ? "text" : "password"}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="e.g. NISC-8029"
                className="w-full px-4 py-3 pr-10 rounded-xl border border-nisc-border bg-white text-nisc-navy placeholder:text-slate-400 focus:outline-none focus:border-nisc-orange focus:ring-2 focus:ring-nisc-orange/20 transition-all text-sm font-mono"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-nisc-gray hover:text-nisc-navy transition-colors p-1"
                title={showPasscode ? "Hide passcode" : "Show passcode"}
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-left">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !rollNumber.trim() || !passcode.trim()}
            className="w-full nisc-btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Verifying Credentials...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Verify & Access Ballot
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-nisc-gray mt-5">
          Only registered NISC members with a valid passcode can access the voting portal.
        </p>
      </div>
    </div>
  );
}

