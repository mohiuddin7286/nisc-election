"use client";

import React, { useEffect, useState } from "react";
import {
  getCandidates,
  getElectionState,
  fetchCandidatesFromSupabase,
  fetchElectionStateFromSupabase,
  fetchVoteRecordsFromSupabase,
} from "@/lib/election";
import { fetchVotersFromSupabase } from "@/lib/auth";
import { Candidate, ElectionState, VoteRecord, Voter } from "@/types/election";
import { Trophy, Lock, BarChart3, Award, ShieldCheck, CheckCircle2, Crown, Users } from "lucide-react";

export default function ResultsPage() {
  const [state, setState] = useState<ElectionState>(getElectionState());
  const [candidates, setCandidates] = useState<Candidate[]>(getCandidates());
  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [st, cands, recs, vtrs] = await Promise.all([
        fetchElectionStateFromSupabase(),
        fetchCandidatesFromSupabase(),
        fetchVoteRecordsFromSupabase(),
        fetchVotersFromSupabase(),
      ]);
      setState(st);
      setCandidates(cands);
      setVoteRecords(recs);
      setVoters(vtrs);
    } catch (err) {
      console.error("Error loading results data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const isPublished = state.resultsPublished;
  const totalBallots = voteRecords.length;
  const totalEligible = voters.length;
  const turnoutPct = totalEligible > 0 ? Math.round((totalBallots / totalEligible) * 100) : 0;

  // Calculate separate President Standings
  const presStandings = [...candidates]
    .map((c) => {
      const count = voteRecords.filter((r) => r.selections?.["President"] === c.id).length;
      const pct = totalBallots > 0 ? Math.round((count / totalBallots) * 100) : 0;
      return { ...c, presCount: count, presPct: pct };
    })
    .sort((a, b) => b.presCount - a.presCount);

  // Calculate separate Vice President Standings
  const vpStandings = [...candidates]
    .map((c) => {
      const count = voteRecords.filter((r) => r.selections?.["Vice President"] === c.id).length;
      const pct = totalBallots > 0 ? Math.round((count / totalBallots) * 100) : 0;
      return { ...c, vpCount: count, vpPct: pct };
    })
    .sort((a, b) => b.vpCount - a.vpCount);

  const presWinner = presStandings[0];
  const vpWinner = vpStandings[0];

  const getRankBadge = (index: number) => {
    if (index === 0) return <span className="text-xl" title="1st Place">🥇</span>;
    if (index === 1) return <span className="text-xl" title="2nd Place">🥈</span>;
    if (index === 2) return <span className="text-xl" title="3rd Place">🥉</span>;
    return <span className="text-xs font-bold text-nisc-gray w-5 text-center">#{index + 1}</span>;
  };

  return (
    <div className="py-8 max-w-4xl mx-auto space-y-8 px-2 sm:px-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-nisc-orange-light border border-nisc-orange/20 text-nisc-orange text-xs font-bold uppercase tracking-wider shadow-sm">
          <ShieldCheck className="w-4 h-4 text-nisc-orange" />
          Official Election Commission Report
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-nisc-navy tracking-tight">
          NISC Election Results 2026–27
        </h1>

        <p className="text-sm text-nisc-gray max-w-lg mx-auto">
          Certified tally for the North India Student Cell Council Election at KL University Hyderabad.
        </p>
      </div>

      {!isPublished ? (
        /* Results Not Published Card */
        <div className="nisc-card p-8 sm:p-12 text-center border-slate-200 bg-white/80 shadow-md">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5 text-amber-600 shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="font-heading font-bold text-2xl text-nisc-navy mb-2">
            Results Under Verification
          </h2>

          <p className="text-sm text-nisc-gray max-w-md mx-auto leading-relaxed">
            The election results are currently locked by the Election Commission. Official standings will be published here upon conclusion of the voting period and tally audit.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 bg-nisc-gray-light/80 border border-nisc-border rounded-xl px-5 py-3 text-xs text-nisc-navy font-semibold">
            <BarChart3 className="w-4 h-4 text-nisc-orange" />
            <span>
              Status: <span className="uppercase text-nisc-orange font-bold">{state.status}</span>
              {totalBallots > 0 && (
                <span className="text-nisc-gray font-normal ml-1">
                  • {totalBallots} ballot{totalBallots !== 1 && "s"} recorded
                </span>
              )}
            </span>
          </div>
        </div>
      ) : (
        /* Published Official Results */
        <div className="space-y-8">
          {/* Key Metrics Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="nisc-card p-4 border border-nisc-border text-center">
              <p className="text-xs font-semibold text-nisc-gray uppercase tracking-wider">Total Ballots</p>
              <p className="font-heading text-2xl font-bold text-nisc-navy mt-1">{totalBallots}</p>
            </div>
            <div className="nisc-card p-4 border border-nisc-border text-center">
              <p className="text-xs font-semibold text-nisc-gray uppercase tracking-wider">Eligible Voters</p>
              <p className="font-heading text-2xl font-bold text-nisc-navy mt-1">{totalEligible}</p>
            </div>
            <div className="nisc-card p-4 border border-nisc-border text-center">
              <p className="text-xs font-semibold text-nisc-gray uppercase tracking-wider">Voter Turnout</p>
              <p className="font-heading text-2xl font-bold text-nisc-orange mt-1">{turnoutPct}%</p>
            </div>
            <div className="nisc-card p-4 border border-nisc-border text-center">
              <p className="text-xs font-semibold text-nisc-gray uppercase tracking-wider">Certification</p>
              <p className="font-heading text-sm font-bold text-emerald-600 mt-2.5 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Verified
              </p>
            </div>
          </div>

          {/* Winner Spotlight Banner */}
          {totalBallots > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* President Elect Card */}
              {presWinner && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border border-amber-300 p-6 shadow-md">
                  <div className="absolute -top-3 -right-3 w-16 h-16 bg-amber-500/10 rounded-full blur-xl" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                      <Crown className="w-3.5 h-3.5" /> President Elect
                    </span>
                    <span className="text-2xl">🏆</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner"
                      style={{ backgroundColor: presWinner.colorLight }}
                    >
                      {presWinner.icon}
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-xl text-nisc-navy">
                        {presWinner.name}
                      </h3>
                      <p className="text-xs text-nisc-gray mt-0.5">
                        Codename: <strong className="text-nisc-navy">{presWinner.codename}</strong> • {presWinner.department} ({presWinner.year})
                      </p>
                      <p className="text-sm font-bold text-amber-700 mt-2">
                        {presWinner.presCount} Votes <span className="text-xs font-normal text-nisc-gray">({presWinner.presPct}% of total)</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Vice President Elect Card */}
              {vpWinner && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-white border border-blue-300 p-6 shadow-md">
                  <div className="absolute -top-3 -right-3 w-16 h-16 bg-blue-500/10 rounded-full blur-xl" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                      <Crown className="w-3.5 h-3.5" /> Vice President Elect
                    </span>
                    <span className="text-2xl">🏆</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner"
                      style={{ backgroundColor: vpWinner.colorLight }}
                    >
                      {vpWinner.icon}
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-xl text-nisc-navy">
                        {vpWinner.name}
                      </h3>
                      <p className="text-xs text-nisc-gray mt-0.5">
                        Codename: <strong className="text-nisc-navy">{vpWinner.codename}</strong> • {vpWinner.department} ({vpWinner.year})
                      </p>
                      <p className="text-sm font-bold text-blue-700 mt-2">
                        {vpWinner.vpCount} Votes <span className="text-xs font-normal text-nisc-gray">({vpWinner.vpPct}% of total)</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Detailed Position Standings */}
          <div className="space-y-6">
            {/* President Standings */}
            <div className="nisc-card p-6 border border-nisc-border shadow-sm">
              <div className="flex items-center justify-between border-b border-nisc-border pb-4 mb-5">
                <h3 className="font-heading font-bold text-xl text-nisc-navy flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" /> Presidential Election Standings
                </h3>
                <span className="text-xs font-medium text-nisc-gray">
                  Total President Votes: <strong className="text-nisc-navy">{totalBallots}</strong>
                </span>
              </div>

              <div className="space-y-4">
                {presStandings.map((c, idx) => (
                  <div
                    key={`pres-stand-${c.id}`}
                    className={`p-4 rounded-xl border transition-all ${
                      idx === 0
                        ? "bg-amber-50/50 border-amber-200"
                        : "bg-nisc-gray-light/30 border-nisc-border"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 shrink-0">
                        {getRankBadge(idx)}
                      </div>

                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                        style={{ backgroundColor: c.colorLight }}
                      >
                        {c.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1.5">
                          <div>
                            <span className="font-heading font-bold text-nisc-navy text-base">
                              {c.name}
                            </span>
                            <span className="text-xs text-nisc-gray ml-2 font-medium">
                              ({c.codename}) • {c.department}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-heading font-bold text-nisc-navy text-base">
                              {c.presCount}
                            </span>
                            <span className="text-xs text-nisc-gray ml-1 font-normal">
                              ({c.presPct}%)
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-2.5 rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${c.presPct}%`,
                              backgroundColor: c.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vice President Standings */}
            <div className="nisc-card p-6 border border-nisc-border shadow-sm">
              <div className="flex items-center justify-between border-b border-nisc-border pb-4 mb-5">
                <h3 className="font-heading font-bold text-xl text-nisc-navy flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-blue-500" /> Vice Presidential Election Standings
                </h3>
                <span className="text-xs font-medium text-nisc-gray">
                  Total VP Votes: <strong className="text-nisc-navy">{totalBallots}</strong>
                </span>
              </div>

              <div className="space-y-4">
                {vpStandings.map((c, idx) => (
                  <div
                    key={`vp-stand-${c.id}`}
                    className={`p-4 rounded-xl border transition-all ${
                      idx === 0
                        ? "bg-blue-50/50 border-blue-200"
                        : "bg-nisc-gray-light/30 border-nisc-border"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 shrink-0">
                        {getRankBadge(idx)}
                      </div>

                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                        style={{ backgroundColor: c.colorLight }}
                      >
                        {c.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1.5">
                          <div>
                            <span className="font-heading font-bold text-nisc-navy text-base">
                              {c.name}
                            </span>
                            <span className="text-xs text-nisc-gray ml-2 font-medium">
                              ({c.codename}) • {c.department}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-heading font-bold text-nisc-navy text-base">
                              {c.vpCount}
                            </span>
                            <span className="text-xs text-nisc-gray ml-1 font-normal">
                              ({c.vpPct}%)
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-2.5 rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${c.vpPct}%`,
                              backgroundColor: c.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Verification Footer */}
          <div className="nisc-card p-4 border border-nisc-border bg-nisc-gray-light/40 text-center flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-nisc-gray">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Certified & Sealed by NISC Election Commission 2026–27</span>
            </div>
            <span>KL University Hyderabad • Student Cell Governance</span>
          </div>
        </div>
      )}
    </div>
  );
}
