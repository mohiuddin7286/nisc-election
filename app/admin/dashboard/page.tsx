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
  Play,
  Pause,
  Square,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [state, setState] = useState<ElectionState | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>([]);

  // Vote edit
  const [searchRoll, setSearchRoll] = useState("");
  const [foundVoter, setFoundVoter] = useState<Voter | null>(null);
  const [foundVote, setFoundVote] = useState<VoteRecord | null>(null);
  const [editPres, setEditPres] = useState("");
  const [editVP, setEditVP] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editMsg, setEditMsg] = useState<string | null>(null);

  // Voter Vote Reset
  const [resetVoterRoll, setResetVoterRoll] = useState<string | null>(null);
  const [resetVoterReason, setResetVoterReason] = useState("");
  const [resetVoterMsg, setResetVoterMsg] = useState<string | null>(null);

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

  const handleResetVoterVoteAction = async (voterRoll: string) => {
    if (!resetVoterReason.trim()) {
      setResetVoterMsg("Please provide a reason before resetting this member's vote.");
      return;
    }
    const result = await adminResetVoterVote(voterRoll, resetVoterReason);
    setResetVoterMsg(result.message);
    if (result.success) {
      await refreshData();
      setResetVoterRoll(null);
      setResetVoterReason("");
      if (foundVoter && foundVoter.rollNumber === voterRoll) {
        setFoundVoter({ ...foundVoter, hasVoted: false });
        setFoundVote(null);
      }
    }
  };

  const handleSearchVoter = () => {
    setEditMsg(null);
    const voter = voters.find((v) => v.rollNumber === searchRoll.trim());
    if (!voter) {
      setFoundVoter(null);
      setFoundVote(null);
      setEditMsg("No voter found with this roll number.");
      return;
    }
    setFoundVoter(voter);
    const vote = voteRecords.find((v) => v.voterRoll === voter.rollNumber);
    setFoundVote(vote || null);
    if (vote) {
      setEditPres(vote.selections["President"] || "");
      setEditVP(vote.selections["Vice President"] || "");
    }
  };

  const handleSaveEdit = async () => {
    if (!foundVoter || !editPres || !editVP || !editNote.trim()) {
      setEditMsg("Please fill all fields including an edit note.");
      return;
    }
    const result = await adminEditVote(
      foundVoter.rollNumber,
      { President: editPres, "Vice President": editVP } as Record<Position, string>,
      editNote
    );
    setEditMsg(result.message);
    if (result.success) {
      await refreshData();
      setEditNote("");
    }
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

      {/* Vote Counts */}
      <div className="nisc-card p-6">
        <h2 className="font-heading font-bold text-lg text-nisc-navy mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-nisc-orange" /> Current Vote Counts
        </h2>
        <div className="space-y-3">
          {candidates.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                style={{ backgroundColor: c.colorLight }}
              >
                {c.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-nisc-navy text-sm">{c.name} ({c.codename})</span>
                  <span className="text-sm font-bold text-nisc-navy">{c.voteCount}</span>
                </div>
                <div className="w-full bg-nisc-gray-light rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: votedCount > 0 ? `${(c.voteCount / votedCount) * 100}%` : "0%",
                      backgroundColor: c.color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ballot Details — Who voted for whom */}
      <div className="nisc-card p-6">
        <h2 className="font-heading font-bold text-lg text-nisc-navy mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-nisc-orange" /> Ballot Details ({voteRecords.length} ballots)
        </h2>
        {voteRecords.length === 0 ? (
          <p className="text-sm text-nisc-gray text-center py-4">No votes cast yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-nisc-border text-left">
                  <th className="py-2 pr-4 text-xs text-nisc-gray font-medium">#</th>
                  <th className="py-2 pr-4 text-xs text-nisc-gray font-medium">Roll Number</th>
                  <th className="py-2 pr-4 text-xs text-nisc-gray font-medium">Voter Name</th>
                  <th className="py-2 pr-4 text-xs text-nisc-gray font-medium">President Vote</th>
                  <th className="py-2 pr-4 text-xs text-nisc-gray font-medium">Vice President Vote</th>
                  <th className="py-2 pr-4 text-xs text-nisc-gray font-medium">Receipt</th>
                  <th className="py-2 text-xs text-nisc-gray font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {voteRecords.map((record, idx) => {
                  const voterInfo = voters.find((v) => v.rollNumber === record.voterRoll);
                  const presCand = candidates.find((c) => c.id === record.selections["President"]);
                  const vpCand = candidates.find((c) => c.id === record.selections["Vice President"]);
                  return (
                    <tr key={record.receiptId} className="border-b border-nisc-border/50 hover:bg-nisc-gray-light/50">
                      <td className="py-2 pr-4 text-nisc-gray text-xs">{idx + 1}</td>
                      <td className="py-2 pr-4 font-mono text-xs text-nisc-navy">{record.voterRoll}</td>
                      <td className="py-2 pr-4 font-medium text-nisc-navy">
                        {voterInfo?.name || "Unknown"}
                      </td>
                      <td className="py-2 pr-4">
                        {presCand ? (
                          <span
                            className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: presCand.colorLight, color: presCand.color }}
                          >
                            {presCand.icon} {presCand.name}
                          </span>
                        ) : (
                          <span className="text-xs text-nisc-gray">—</span>
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        {vpCand ? (
                          <span
                            className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: vpCand.colorLight, color: vpCand.color }}
                          >
                            {vpCand.icon} {vpCand.name}
                          </span>
                        ) : (
                          <span className="text-xs text-nisc-gray">—</span>
                        )}
                      </td>
                      <td className="py-2 pr-4 font-mono text-[10px] text-nisc-gray">{record.receiptId}</td>
                      <td className="py-2 text-[10px] text-nisc-gray">
                        {new Date(record.timestamp).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vote Search & Edit */}
      <div className="nisc-card p-6">
        <h2 className="font-heading font-bold text-lg text-nisc-navy mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-nisc-orange" /> Search & Edit Vote
        </h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchRoll}
            onChange={(e) => setSearchRoll(e.target.value)}
            placeholder="Enter roll number"
            className="flex-1 px-4 py-2.5 rounded-xl border border-nisc-border bg-white text-nisc-navy placeholder:text-slate-400 focus:outline-none focus:border-nisc-orange focus:ring-2 focus:ring-nisc-orange/20 text-sm"
          />
          <button onClick={handleSearchVoter} className="nisc-btn-primary text-sm px-5">
            Search
          </button>
        </div>

        {editMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-700">{editMsg}</p>
          </div>
        )}

        {foundVoter && (
          <div className="space-y-4">
            <div className="bg-nisc-gray-light rounded-xl p-4">
              <p className="font-semibold text-nisc-navy text-sm">{foundVoter.name}</p>
              <p className="text-xs text-nisc-gray">
                {foundVoter.rollNumber} • {foundVoter.year} • {foundVoter.department} •{" "}
                {foundVoter.hasVoted ? "Has Voted ✓" : "Has NOT voted"}
              </p>
            </div>

            {foundVote && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-nisc-navy mb-1">President</label>
                  <select
                    value={editPres}
                    onChange={(e) => setEditPres(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-nisc-border bg-white text-sm text-nisc-navy focus:outline-none focus:border-nisc-orange"
                  >
                    <option value="">Select...</option>
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.codename})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nisc-navy mb-1">Vice President</label>
                  <select
                    value={editVP}
                    onChange={(e) => setEditVP(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-nisc-border bg-white text-sm text-nisc-navy focus:outline-none focus:border-nisc-orange"
                  >
                    <option value="">Select...</option>
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.codename})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nisc-navy mb-1">Edit Reason (required)</label>
                  <input
                    type="text"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Reason for this modification..."
                    className="w-full px-4 py-2.5 rounded-xl border border-nisc-border bg-white text-sm text-nisc-navy placeholder:text-slate-400 focus:outline-none focus:border-nisc-orange"
                  />
                </div>
                <button onClick={handleSaveEdit} className="nisc-btn-primary text-sm">
                  Save Changes
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Voter List */}
      <div className="nisc-card p-6">
        <h2 className="font-heading font-bold text-lg text-nisc-navy mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-nisc-orange" /> Voter Registry ({totalMembers} members)
        </h2>

        {resetVoterMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-700">{resetVoterMsg}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-nisc-border text-left">
                <th className="py-2 pr-4 text-xs text-nisc-gray font-medium">Name</th>
                <th className="py-2 pr-4 text-xs text-nisc-gray font-medium">Roll</th>
                <th className="py-2 pr-4 text-xs text-nisc-gray font-medium">Year</th>
                <th className="py-2 pr-4 text-xs text-nisc-gray font-medium">Dept</th>
                <th className="py-2 text-xs text-nisc-gray font-medium">Status & Actions</th>
              </tr>
            </thead>
            <tbody>
              {voters.map((v) => (
                <React.Fragment key={v.id}>
                  <tr className="border-b border-nisc-border/50 hover:bg-nisc-gray-light/50">
                    <td className="py-2 pr-4 font-medium text-nisc-navy">{v.name}</td>
                    <td className="py-2 pr-4 text-nisc-gray font-mono text-xs">{v.rollNumber}</td>
                    <td className="py-2 pr-4 text-nisc-gray">{v.year}</td>
                    <td className="py-2 pr-4 text-nisc-gray">{v.department}</td>
                    <td className="py-2">
                      {v.hasVoted ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Voted
                          </span>
                          <button
                            onClick={() => {
                              setResetVoterMsg(null);
                              setResetVoterRoll(resetVoterRoll === v.rollNumber ? null : v.rollNumber);
                              setResetVoterReason("");
                            }}
                            className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded transition-all"
                            title="Reset this member's vote so they can revote"
                          >
                            <RotateCcw className="w-3 h-3" /> Reset Vote
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-nisc-gray">Pending</span>
                      )}
                    </td>
                  </tr>

                  {resetVoterRoll === v.rollNumber && (
                    <tr className="bg-red-50/60 border-b border-red-200">
                      <td colSpan={5} className="p-3">
                        <div className="space-y-2 max-w-lg">
                          <p className="text-xs font-semibold text-red-700 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Reset vote for {v.name} ({v.rollNumber})?
                          </p>
                          <p className="text-xs text-nisc-gray">
                            This will delete their ballot, decrement candidate counts, and allow this member to vote again.
                          </p>
                          <input
                            type="text"
                            value={resetVoterReason}
                            onChange={(e) => setResetVoterReason(e.target.value)}
                            placeholder="Reason for vote reset (required)..."
                            className="w-full px-3 py-1.5 rounded-lg border border-red-200 bg-white text-xs text-nisc-navy placeholder:text-slate-400 focus:outline-none focus:border-red-400"
                          />
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleResetVoterVoteAction(v.rollNumber)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-all"
                            >
                              Confirm Reset
                            </button>
                            <button
                              onClick={() => {
                                setResetVoterRoll(null);
                                setResetVoterReason("");
                              }}
                              className="px-3 py-1 bg-white border border-nisc-border text-nisc-navy rounded-lg text-xs font-medium hover:bg-nisc-gray-light transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log */}
      <div className="nisc-card p-6">
        <h2 className="font-heading font-bold text-lg text-nisc-navy mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-nisc-orange" /> Audit Log
        </h2>
        {auditLogs.length === 0 ? (
          <p className="text-sm text-nisc-gray text-center py-4">No audit entries yet.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 bg-nisc-gray-light/50 rounded-xl">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  log.category === "VOTE" ? "bg-green-500" :
                  log.category === "ADMIN" ? "bg-blue-500" :
                  log.category === "EDIT" ? "bg-amber-500" :
                  "bg-slate-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-nisc-navy text-sm">{log.action}</span>
                    <span className="text-[10px] text-nisc-gray">
                      {new Date(log.timestamp).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>
                  <p className="text-xs text-nisc-gray mt-0.5">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
