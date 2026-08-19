"use client";

import React, { useState } from "react";
import { Voter } from "@/types/election";
import { User, Hash, BookOpen, MapPin, LogOut, ArrowRight, CheckCircle2, KeyRound, Eye, EyeOff } from "lucide-react";

interface VoterProfileProps {
  voter: Voter;
  onProceedToVoting: () => void;
  onLogout: () => void;
}

export default function VoterProfile({ voter, onProceedToVoting, onLogout }: VoterProfileProps) {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="nisc-card p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-nisc-orange-light flex items-center justify-center">
            <User className="w-6 h-6 text-nisc-orange" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl text-nisc-navy">{voter.name}</h2>
            <p className="text-sm text-nisc-gray">Verified NISC Member</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="text-sm text-nisc-gray hover:text-red-500 flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-nisc-gray-light rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-nisc-gray mb-1">
            <Hash className="w-3 h-3 text-nisc-orange" /> Roll Number
          </div>
          <p className="font-semibold font-mono text-nisc-navy text-sm">{voter.rollNumber}</p>
        </div>
        <div className="bg-nisc-gray-light rounded-xl p-3">
          <div className="flex items-center justify-between text-xs text-nisc-gray mb-1">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3 h-3 text-nisc-orange" /> Passcode
            </span>
            <button
              onClick={() => setShowPass(!showPass)}
              className="text-[10px] text-nisc-gray hover:text-nisc-navy"
            >
              {showPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          </div>
          <p className="font-semibold font-mono text-nisc-navy text-sm">
            {showPass ? voter.passcode || "NISC-8000" : "••••••••"}
          </p>
        </div>
        <div className="bg-nisc-gray-light rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-nisc-gray mb-1">
            <BookOpen className="w-3 h-3 text-nisc-orange" /> Department
          </div>
          <p className="font-semibold text-nisc-navy text-sm">{voter.department}</p>
        </div>
        <div className="bg-nisc-gray-light rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-nisc-gray mb-1">
            <User className="w-3 h-3 text-nisc-orange" /> Year
          </div>
          <p className="font-semibold text-nisc-navy text-sm">{voter.year}</p>
        </div>
        <div className="bg-nisc-gray-light rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-nisc-gray mb-1">
            <MapPin className="w-3 h-3 text-nisc-orange" /> State
          </div>
          <p className="font-semibold text-nisc-navy text-sm">{voter.state}</p>
        </div>
      </div>

      {voter.hasVoted ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-700 text-sm">You have already voted</p>
            <p className="text-xs text-green-600 mt-0.5">
              Receipt: {voter.voteReceiptId} • {voter.voteTimestamp && new Date(voter.voteTimestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={onProceedToVoting}
          className="w-full nisc-btn-primary text-sm flex items-center justify-center gap-2"
        >
          Proceed to Ballot <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
