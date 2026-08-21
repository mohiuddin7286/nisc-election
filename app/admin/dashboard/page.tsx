"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { checkIsAdminAuthenticated, logoutAdmin, fetchVotersFromSupabase } from "@/lib/auth";
import {
  fetchElectionStateFromSupabase,
  updateElectionStateAsync,
  fetchCandidatesFromSupabase,
  fetchAuditLogsFromSupabase,
  fetchVoteRecordsFromSupabase,
  adminEditVote,
  adminResetVoterVote,
  adminResetAllVotes,
  addAuditLog,
} from "@/lib/election";
import { ElectionState, AuditLog, Candidate, Position, Voter, VoteRecord } from "@/types/election";
import {
  LogOut,
  BarChart3,
  Users,
  Settings,
  Search,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  Play,
  Pause,
  Square,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  KeyRound,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [state, setState] = useState<ElectionState | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>([]);



  // Voter passcodes & filter state
  const [showAllPasscodes, setShowAllPasscodes] = useState(false);
  const [copiedRoll, setCopiedRoll] = useState<string | null>(null);
  const [voterFilterText, setVoterFilterText] = useState("");





  const refreshData = useCallback(async () => {
    try {
      const [st, cands, vtrs, logs, recs] = await Promise.all([
        fetchElectionStateFromSupabase(),
        fetchCandidatesFromSupabase(),
        fetchVotersFromSupabase(),
        fetchAuditLogsFromSupabase(),
        fetchVoteRecordsFromSupabase(),
      ]);
      setState(st);
      setCandidates(cands);
      setVoters(vtrs);
      setAuditLogs(logs);
      setVoteRecords(recs);
    } catch (err) {
      console.error("Error refreshing admin data:", err);
    }
  }, []);

  useEffect(() => {
    if (!checkIsAdminAuthenticated()) {
      router.push("/admin");
      return;
    }
    refreshData();
    const interval = setInterval(() => {
      refreshData();
    }, 3000);
    return () => clearInterval(interval);
  }, [router, refreshData]);

  if (!state) return null;

  const totalMembers = voters.length;
  const votedCount = voters.filter((v) => v.hasVoted).length;
  const turnoutPct = totalMembers > 0 ? Math.round((votedCount / totalMembers) * 100) : 0;

  const handleStatusChange = async (newStatus: ElectionState["status"]) => {
    const updated = await updateElectionStateAsync({ status: newStatus });
    setState(updated);
    addAuditLog("Election Status Changed", `Status changed to ${newStatus}`, "ADMIN");
    refreshData();
  };

  const handlePublishResults = async () => {
    const updated = await updateElectionStateAsync({ resultsPublished: !state.resultsPublished });
    setState(updated);
    addAuditLog(
      state.resultsPublished ? "Results Unpublished" : "Results Published",
      `Admin ${state.resultsPublished ? "unpublished" : "published"} election results.`,
      "ADMIN"
    );
    refreshData();
  };



  const handleCopyPasscode = (roll: string, passcode: string) => {
    navigator.clipboard.writeText(passcode);
    setCopiedRoll(roll);
    setTimeout(() => setCopiedRoll(null), 2000);
  };





  const handleLogout = () => {
    logoutAdmin();
    router.push("/admin");
  };

  const statusButtons: { status: ElectionState["status"]; icon: React.ElementType; label: string; color: string }[] = [
    { status: "UPCOMING", icon: Clock, label: "Upcoming", color: "bg-slate-100 text-slate-600 border-slate-200" },
    { status: "OPEN", icon: Play, label: "Open", color: "bg-green-50 text-green-600 border-green-200" },
    { status: "PAUSED", icon: Pause, label: "Paused", color: "bg-amber-50 text-amber-600 border-amber-200" },
    { status: "CLOSED", icon: Square, label: "Closed", color: "bg-red-50 text-red-600 border-red-200" },
  ];

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-nisc-navy flex items-center gap-2">
            <Settings className="w-6 h-6 text-nisc-orange" /> Admin Dashboard
          </h1>
          <p className="text-sm text-nisc-gray mt-1">NISC Election 2026–27 Management Console</p>
        </div>
        <button
          onClick={handleLogout}
          className="nisc-btn-outline text-sm flex items-center gap-2 text-red-500 border-red-200 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="nisc-card p-4">
          <p className="text-xs text-nisc-gray font-medium">Total Members</p>
          <p className="font-heading text-2xl font-bold text-nisc-navy mt-1">{totalMembers}</p>
        </div>
        <div className="nisc-card p-4">
          <p className="text-xs text-nisc-gray font-medium">Votes Cast</p>
          <p className="font-heading text-2xl font-bold text-green-600 mt-1">{votedCount}</p>
        </div>
        <div className="nisc-card p-4">
          <p className="text-xs text-nisc-gray font-medium">Turnout</p>
          <p className="font-heading text-2xl font-bold text-nisc-orange mt-1">{turnoutPct}%</p>
        </div>
        <div className="nisc-card p-4">
          <p className="text-xs text-nisc-gray font-medium">Election Status</p>
          <p className="font-heading text-lg font-bold text-nisc-navy mt-1">{state.status}</p>
        </div>
      </div>

      {/* Election Controls */}
      <div className="nisc-card p-6">
        <h2 className="font-heading font-bold text-lg text-nisc-navy mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-nisc-orange" /> Election Controls
        </h2>

        <div className="space-y-4">
          {/* Status Toggle */}
          <div>
            <p className="text-sm text-nisc-gray mb-2">Change Election Status</p>
            <div className="flex flex-wrap gap-2">
              {statusButtons.map((btn) => {
                const Icon = btn.icon;
                const isActive = state.status === btn.status;
                return (
                  <button
                    key={btn.status}
                    onClick={() => handleStatusChange(btn.status)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      isActive
                        ? `${btn.color} ring-2 ring-offset-1 ring-current`
                        : "bg-white border-nisc-border text-nisc-gray hover:bg-nisc-gray-light"
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {btn.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Publish Results */}
          <div className="flex items-center justify-between p-4 bg-nisc-gray-light rounded-xl">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-nisc-gray" />
              <div>
                <p className="font-semibold text-nisc-navy text-sm">Publish Results</p>
                <p className="text-xs text-nisc-gray">
                  {state.resultsPublished
                    ? "Results are currently VISIBLE to voters."
                    : "Results are currently HIDDEN from voters."}
                </p>
              </div>
            </div>
            <button
              onClick={handlePublishResults}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                state.resultsPublished
                  ? "bg-green-50 text-green-600 border-green-200"
                  : "bg-white text-nisc-gray border-nisc-border hover:border-nisc-orange"
              }`}
            >
              {state.resultsPublished ? "Published ✓" : "Publish"}
            </button>
          </div>

        </div>
      </div>

      {/* Vote Counts (Separated by Position) */}
      <div className="nisc-card p-6 space-y-6">
        <h2 className="font-heading font-bold text-lg text-nisc-navy flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-nisc-orange" /> Vote Counts by Position
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* President Votes */}
          <div className="bg-nisc-gray-light/40 border border-nisc-border p-4 rounded-xl space-y-3">
            <h3 className="font-heading font-bold text-md text-nisc-navy flex items-center gap-2 border-b border-nisc-border pb-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> President Votes
            </h3>
            <div className="space-y-3 pt-1">
              {candidates.map((c) => {
                const count = voteRecords.filter((r) => r.selections?.["President"] === c.id).length;
                const pct = votedCount > 0 ? Math.round((count / votedCount) * 100) : 0;
                return (
                  <div key={`pres-${c.id}`} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                      style={{ backgroundColor: c.colorLight }}
                    >
                      {c.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-nisc-navy text-sm">
                          {c.name} <span className="text-xs text-nisc-gray font-normal">({c.codename})</span>
                        </span>
                        <span className="text-sm font-bold text-nisc-navy">
                          {count} <span className="text-xs text-nisc-gray font-normal">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: c.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vice President Votes */}
          <div className="bg-nisc-gray-light/40 border border-nisc-border p-4 rounded-xl space-y-3">
            <h3 className="font-heading font-bold text-md text-nisc-navy flex items-center gap-2 border-b border-nisc-border pb-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Vice President Votes
            </h3>
            <div className="space-y-3 pt-1">
              {candidates.map((c) => {
                const count = voteRecords.filter((r) => r.selections?.["Vice President"] === c.id).length;
                const pct = votedCount > 0 ? Math.round((count / votedCount) * 100) : 0;
                return (
                  <div key={`vp-${c.id}`} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                      style={{ backgroundColor: c.colorLight }}
                    >
                      {c.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-nisc-navy text-sm">
                          {c.name} <span className="text-xs text-nisc-gray font-normal">({c.codename})</span>
                        </span>
                        <span className="text-sm font-bold text-nisc-navy">
                          {count} <span className="text-xs text-nisc-gray font-normal">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: c.color,
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
      </div>



      {/* Voter List */}
      <div className="nisc-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="font-heading font-bold text-lg text-nisc-navy flex items-center gap-2">
            <Users className="w-5 h-5 text-nisc-orange" /> Voter Registry ({totalMembers} members)
          </h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={voterFilterText}
              onChange={(e) => setVoterFilterText(e.target.value)}
              placeholder="Search name or roll..."
              className="px-3 py-1.5 rounded-xl border border-nisc-border bg-white text-xs text-nisc-navy placeholder:text-slate-400 focus:outline-none focus:border-nisc-orange"
            />
            <button
              onClick={() => setShowAllPasscodes(!showAllPasscodes)}
              className="px-3 py-1.5 rounded-xl border border-nisc-border bg-white hover:bg-nisc-gray-light text-xs font-semibold text-nisc-navy flex items-center gap-1.5 transition-all"
            >
              {showAllPasscodes ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-nisc-gray" /> Hide Passcodes
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-nisc-orange" /> Show Passcodes
                </>
              )}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-nisc-border text-left">
                <th className="py-2 pr-4 text-xs text-nisc-gray font-medium">Name</th>
                <th className="py-2 pr-4 text-xs text-nisc-gray font-medium">Roll Number</th>
                <th className="py-2 pr-4 text-xs text-nisc-gray font-medium">Passcode</th>
                <th className="py-2 pr-4 text-xs text-nisc-gray font-medium">Year</th>
                <th className="py-2 pr-4 text-xs text-nisc-gray font-medium">Dept</th>
                <th className="py-2 text-xs text-nisc-gray font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {voters
                .filter((v) => {
                  if (!voterFilterText.trim()) return true;
                  const q = voterFilterText.toLowerCase();
                  return (
                    v.name.toLowerCase().includes(q) ||
                    v.rollNumber.toLowerCase().includes(q) ||
                    (v.passcode && v.passcode.toLowerCase().includes(q))
                  );
                })
                .map((v) => {
                  const passcodeVal = v.passcode || "NISC-8000";
                  const isCopied = copiedRoll === v.rollNumber;
                  return (
                    <tr key={v.id} className="border-b border-nisc-border/50 hover:bg-nisc-gray-light/50">
                      <td className="py-2 pr-4 font-medium text-nisc-navy">{v.name}</td>
                      <td className="py-2 pr-4 text-nisc-gray font-mono text-xs">{v.rollNumber}</td>
                      <td className="py-2 pr-4 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className={showAllPasscodes ? "text-nisc-navy font-semibold" : "text-slate-400"}>
                            {showAllPasscodes ? passcodeVal : "••••••••"}
                          </span>
                          <button
                            onClick={() => handleCopyPasscode(v.rollNumber, passcodeVal)}
                            className="text-nisc-gray hover:text-nisc-orange p-1 transition-colors"
                            title="Copy passcode"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-nisc-gray">{v.year}</td>
                      <td className="py-2 pr-4 text-nisc-gray">{v.department}</td>
                      <td className="py-2">
                        {v.hasVoted ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Voted
                          </span>
                        ) : (
                          <span className="text-xs text-nisc-gray">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
