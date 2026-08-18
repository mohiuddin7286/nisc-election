"use client";

import React from "react";
import { getCandidates, getElectionState } from "@/lib/election";
import { Trophy, Lock, BarChart3 } from "lucide-react";

export default function ResultsPage() {
  const state = getElectionState();
  const candidates = getCandidates();

  const isPublished = state.resultsPublished;

  // Sort by votes for display
  const sorted = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
  const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

  return (
    <div className="py-6 max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-nisc-orange-light flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-7 h-7 text-nisc-orange" />
        </div>
        <h1 className="font-heading text-3xl font-extrabold text-nisc-navy">
          Election Results
        </h1>
        <p className="text-sm text-nisc-gray mt-2">
          NISC Council Election 2026–27
        </p>
      </div>

      {!isPublished ? (
        /* Results Not Published */
        <div className="nisc-card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="font-heading font-bold text-xl text-nisc-navy mb-2">
            Results Not Yet Published
          </h2>
          <p className="text-sm text-nisc-gray max-w-md mx-auto leading-relaxed">
            The election results will be published here once the voting period has closed and the votes have been counted. Please check back later.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-nisc-gray-light rounded-xl px-4 py-2.5 text-xs text-nisc-gray">
            <BarChart3 className="w-4 h-4" />
            <span>
              Current status: <strong className="text-nisc-navy">{state.status}</strong>
              {state.totalVotesCast > 0 && (
                <> • {state.totalVotesCast} vote{state.totalVotesCast !== 1 && "s"} cast</>
              )}
            </span>
          </div>
        </div>
      ) : (
        /* Published Results */
        <div className="space-y-5">
          <div className="nisc-card p-4 text-center">
            <p className="text-sm text-nisc-gray">
              Total Votes Cast: <strong className="text-nisc-navy">{state.totalVotesCast}</strong>
            </p>
          </div>

          {/* President Results */}
          <div className="nisc-card p-6">
            <h3 className="font-heading font-bold text-lg text-nisc-navy mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> President
            </h3>
            <div className="space-y-3">
              {sorted.map((candidate, i) => {
                const pct = totalVotes > 0
                  ? Math.round((candidate.voteCount / totalVotes) * 100)
                  : 0;
                return (
                  <div key={candidate.id} className="flex items-center gap-4">
                    {i === 0 && (
                      <span className="text-lg">🏆</span>
                    )}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                      style={{ backgroundColor: candidate.colorLight }}
                    >
                      {candidate.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-nisc-navy text-sm truncate">
                          {candidate.name}
                          <span className="text-xs text-nisc-gray ml-1">({candidate.codename})</span>
                        </span>
                        <span className="text-sm font-bold text-nisc-navy ml-2">
                          {candidate.voteCount} <span className="text-xs text-nisc-gray font-normal">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-nisc-gray-light rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: candidate.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vice President Results - same data, same order for this election */}
          <div className="nisc-card p-6">
            <h3 className="font-heading font-bold text-lg text-nisc-navy mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-blue-500" /> Vice President
            </h3>
            <div className="space-y-3">
              {sorted.map((candidate, i) => {
                const pct = totalVotes > 0
                  ? Math.round((candidate.voteCount / totalVotes) * 100)
                  : 0;
                return (
                  <div key={candidate.id} className="flex items-center gap-4">
                    {i === 0 && (
                      <span className="text-lg">🏆</span>
                    )}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                      style={{ backgroundColor: candidate.colorLight }}
                    >
                      {candidate.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-nisc-navy text-sm truncate">
                          {candidate.name}
                          <span className="text-xs text-nisc-gray ml-1">({candidate.codename})</span>
                        </span>
                        <span className="text-sm font-bold text-nisc-navy ml-2">
                          {candidate.voteCount} <span className="text-xs text-nisc-gray font-normal">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-nisc-gray-light rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: candidate.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
