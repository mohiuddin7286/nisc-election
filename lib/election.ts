import { Candidate, ElectionState, AuditLog, VoteRecord, Position, Voter } from "@/types/election";
import { initialCandidates } from "@/data/candidates";
import { generateVoteReceiptId } from "./validation";
import { getStoredVotersList, saveStoredVotersList, mapDbVoterToVoter } from "./auth";
import { supabase } from "./supabase";

const CANDIDATES_KEY = "nisc_candidates";
const ELECTION_STATE_KEY = "nisc_election_state";
const AUDIT_LOGS_KEY = "nisc_audit_logs";
const VOTES_KEY = "nisc_votes";

// ── Candidates ──

export function mapDbCandidateToCandidate(row: any): Candidate {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    codename: row.codename,
    year: row.year,
    department: row.department,
    state: row.state,
    color: row.color,
    colorLight: row.color_light || row.colorLight,
    icon: row.icon,
    contestingFor: row.contesting_for || row.contestingFor,
    vision: row.vision,
    pillars: row.pillars,
    closingStatement: row.closing_statement || row.closingStatement,
    voteCount: Number(row.vote_count ?? row.voteCount ?? 0),
  };
}

export function getCandidates(): Candidate[] {
  if (typeof window === "undefined") return initialCandidates;
  try {
    const raw = localStorage.getItem(CANDIDATES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return initialCandidates;
}

export async function fetchCandidatesFromSupabase(): Promise<Candidate[]> {
  try {
    const { data, error } = await supabase.from("candidates").select("*");
    if (!error && data && data.length > 0) {
      const candidates = data.map(mapDbCandidateToCandidate);
      saveCandidates(candidates);
      return candidates;
    }
  } catch (err) {
    console.warn("Error fetching candidates from Supabase:", err);
  }
  return getCandidates();
}

export function saveCandidates(candidates: Candidate[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CANDIDATES_KEY, JSON.stringify(candidates));
}

// ── Election State ──

const defaultElectionState: ElectionState = {
  status: "OPEN",
  resultsPublished: false,
  totalVotesCast: 0,
};

export function getElectionState(): ElectionState {
  if (typeof window === "undefined") return defaultElectionState;
  try {
    const raw = localStorage.getItem(ELECTION_STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultElectionState;
}

export async function fetchElectionStateFromSupabase(): Promise<ElectionState> {
  try {
    const { data, error } = await supabase.from("election_state").select("*").eq("id", 1).maybeSingle();
    if (!error && data) {
      const state: ElectionState = {
        status: data.status || "OPEN",
        resultsPublished: Boolean(data.results_published),
        totalVotesCast: Number(data.total_votes_cast || 0),
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(ELECTION_STATE_KEY, JSON.stringify(state));
      }
      return state;
    }
  } catch (err) {
    console.warn("Error fetching election state from Supabase:", err);
  }
  return getElectionState();
}

export function updateElectionState(updates: Partial<ElectionState>): ElectionState {
  const current = getElectionState();
  const updated = { ...current, ...updates };
  if (typeof window !== "undefined") {
    localStorage.setItem(ELECTION_STATE_KEY, JSON.stringify(updated));
  }
  // Async update Supabase in background
  updateElectionStateAsync(updates).catch(() => {});
  return updated;
}

export async function updateElectionStateAsync(updates: Partial<ElectionState>): Promise<ElectionState> {
  const current = await fetchElectionStateFromSupabase();
  const updated = { ...current, ...updates };

  try {
    const payload: any = {};
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.resultsPublished !== undefined) payload.results_published = updates.resultsPublished;
    if (updates.totalVotesCast !== undefined) payload.total_votes_cast = updates.totalVotesCast;

    if (Object.keys(payload).length > 0) {
      await supabase.from("election_state").update(payload).eq("id", 1);
    }
  } catch (err) {
    console.warn("Error updating election state in Supabase:", err);
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(ELECTION_STATE_KEY, JSON.stringify(updated));
  }
  return updated;
}

// ── Audit Logs ──

export function getAuditLogs(): AuditLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export async function fetchAuditLogsFromSupabase(): Promise<AuditLog[]> {
  try {
    const { data, error } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      const logs: AuditLog[] = data.map((row) => ({
        id: row.id,
        timestamp: row.created_at || new Date().toISOString(),
        action: row.action,
        details: row.details,
        category: row.category,
      }));
      if (typeof window !== "undefined") {
        localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));
      }
      return logs;
    }
  } catch (err) {
    console.warn("Error fetching audit logs from Supabase:", err);
  }
  return getAuditLogs();
}

export function addAuditLog(action: string, details: string, category: AuditLog["category"]): void {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    action,
    details,
    category,
  };
  const updated = [newLog, ...logs];
  if (typeof window !== "undefined") {
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updated));
  }
  addAuditLogAsync(newLog).catch(() => {});
}

async function addAuditLogAsync(log: AuditLog): Promise<void> {
  try {
    await supabase.from("audit_logs").insert([
      {
        id: log.id,
        action: log.action,
        details: log.details,
        category: log.category,
        created_at: log.timestamp,
      },
    ]);
  } catch (err) {
    console.warn("Error inserting audit log into Supabase:", err);
  }
}

// ── Vote Records ──

export function getVoteRecords(): VoteRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export async function fetchVoteRecordsFromSupabase(): Promise<VoteRecord[]> {
  try {
    const { data, error } = await supabase.from("votes").select("*").order("created_at", { ascending: true });
    if (!error && data) {
      const records: VoteRecord[] = data.map((row) => ({
        receiptId: row.receipt_id,
        timestamp: row.created_at || new Date().toISOString(),
        selections: {
          President: row.president_vote,
          "Vice President": row.vp_vote,
        },
        voterRoll: row.voter_roll,
      }));
      if (typeof window !== "undefined") {
        localStorage.setItem(VOTES_KEY, JSON.stringify(records));
      }
      return records;
    }
  } catch (err) {
    console.warn("Error fetching votes from Supabase:", err);
  }
  return getVoteRecords();
}

// ── Helper: Recalculate Candidate Vote Counts ──

async function recalculateVoteCountsInSupabase(): Promise<void> {
  try {
    const { data: votes } = await supabase.from("votes").select("*");
    const { data: candidates } = await supabase.from("candidates").select("*");

    if (!candidates) return;

    const voteList = votes || [];
    const counts: Record<string, number> = {};
    for (const c of candidates) {
      counts[c.id] = 0;
    }

    for (const v of voteList) {
      if (v.president_vote && counts[v.president_vote] !== undefined) {
        counts[v.president_vote]++;
      }
      if (v.vp_vote && counts[v.vp_vote] !== undefined) {
        counts[v.vp_vote]++;
      }
    }

    for (const c of candidates) {
      const newCount = counts[c.id] || 0;
      await supabase.from("candidates").update({ vote_count: newCount }).eq("id", c.id);
    }

    await supabase.from("election_state").update({ total_votes_cast: voteList.length }).eq("id", 1);
  } catch (err) {
    console.warn("Error recalculating vote counts in Supabase:", err);
  }
}

// ── Submit Vote ──

export async function submitVoteBallot(
  voter: Voter,
  selections: Record<Position, string>
): Promise<{ success: boolean; receiptId?: string; message: string }> {
  // Fetch fresh state from Supabase
  const state = await fetchElectionStateFromSupabase();
  if (state.status !== "OPEN") {
    return {
      success: false,
      message: "Voting is not currently open. Please wait for the official voting period.",
    };
  }

  // Check if voter has already voted in Supabase
  try {
    const { data: voterDb } = await supabase
      .from("voters")
      .select("has_voted")
      .eq("roll_number", voter.rollNumber)
      .maybeSingle();

    if (voterDb && voterDb.has_voted) {
      return {
        success: false,
        message: "You have already cast your ballot in this election.",
      };
    }
  } catch {}

  if (voter.hasVoted) {
    return {
      success: false,
      message: "You have already cast your ballot in this election.",
    };
  }

  const receiptId = generateVoteReceiptId();
  const timestamp = new Date().toISOString();

  const presVote = selections["President"] || (selections as any)["president"] || "";
  const vpVote = selections["Vice President"] || (selections as any)["vice_president"] || "";

  try {
    // 1. Insert vote into Supabase votes table
    const { error: vErr } = await supabase.from("votes").insert([
      {
        receipt_id: receiptId,
        voter_roll: voter.rollNumber,
        president_vote: presVote,
        vp_vote: vpVote,
        created_at: timestamp,
      },
    ]);

    if (vErr) {
      console.error("Supabase vote insert error:", vErr);
      return { success: false, message: "Failed to record vote in central database. Please try again." };
    }

    // 2. Update voter in Supabase voters table
    await supabase
      .from("voters")
      .update({
        has_voted: true,
        vote_receipt_id: receiptId,
        vote_timestamp: timestamp,
      })
      .eq("roll_number", voter.rollNumber);

    // 3. Recalculate candidate vote counts and total_votes_cast in Supabase
    await recalculateVoteCountsInSupabase();

    // 4. Insert Audit Log
    addAuditLog(
      "Vote Cast",
      `Ballot receipt ${receiptId} generated for roll ${voter.rollNumber}.`,
      "VOTE"
    );

    // 5. Update local cache
    if (typeof window !== "undefined") {
      const votes = getVoteRecords();
      votes.push({
        receiptId,
        timestamp,
        selections,
        voterRoll: voter.rollNumber,
      });
      localStorage.setItem(VOTES_KEY, JSON.stringify(votes));

      const voters = getStoredVotersList();
      const voterIdx = voters.findIndex((v) => v.rollNumber === voter.rollNumber);
      if (voterIdx !== -1) {
        voters[voterIdx].hasVoted = true;
        voters[voterIdx].voteReceiptId = receiptId;
        voters[voterIdx].voteTimestamp = timestamp;
        saveStoredVotersList(voters);
      }
    }
  } catch (e) {
    console.error("Failed to store vote:", e);
    return { success: false, message: "An error occurred while saving your vote. Please try again." };
  }

  return {
    success: true,
    receiptId,
    message: "Your vote has been successfully recorded!",
  };
}

// ── Admin: Edit Vote ──

export async function adminEditVote(
  voterRoll: string,
  newSelections: Record<Position, string>,
  adminNote: string
): Promise<{ success: boolean; message: string }> {
  const presVote = newSelections["President"] || (newSelections as any)["president"] || "";
  const vpVote = newSelections["Vice President"] || (newSelections as any)["vice_president"] || "";

  try {
    const { data: existingVote } = await supabase
      .from("votes")
      .select("*")
      .eq("voter_roll", voterRoll)
      .maybeSingle();

    if (!existingVote) {
      return { success: false, message: "No vote record found for this roll number." };
    }

    await supabase
      .from("votes")
      .update({
        president_vote: presVote,
        vp_vote: vpVote,
      })
      .eq("voter_roll", voterRoll);

    await recalculateVoteCountsInSupabase();

    addAuditLog(
      "Vote Edited (Admin)",
      `Admin modified ballot for roll ${voterRoll}. Note: ${adminNote}`,
      "EDIT"
    );

    return { success: true, message: "Vote has been updated successfully." };
  } catch (err) {
    console.error("Error editing vote:", err);
    return { success: false, message: "Error updating vote in database." };
  }
}

// ── Admin: Reset Voter's Vote ──

export async function adminResetVoterVote(
  voterRoll: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data: voterDb } = await supabase
      .from("voters")
      .select("*")
      .eq("roll_number", voterRoll)
      .maybeSingle();

    if (!voterDb) {
      return { success: false, message: "Voter not found in registry." };
    }

    if (!voterDb.has_voted) {
      return { success: false, message: "This voter has not cast a vote yet." };
    }

    // 1. Delete vote record from votes table
    await supabase.from("votes").delete().eq("voter_roll", voterRoll);

    // 2. Reset voter status in voters table
    await supabase
      .from("voters")
      .update({
        has_voted: false,
        vote_receipt_id: null,
        vote_timestamp: null,
      })
      .eq("roll_number", voterRoll);

    // 3. Recalculate counts
    await recalculateVoteCountsInSupabase();

    // 4. Insert audit log
    addAuditLog(
      "Voter Vote Reset (Admin)",
      `Admin reset vote for member ${voterDb.name} (${voterRoll}). Reason: ${reason}`,
      "EDIT"
    );

    return {
      success: true,
      message: `Vote for ${voterDb.name} (${voterRoll}) has been successfully reset.`,
    };
  } catch (err) {
    console.error("Error resetting voter vote:", err);
    return { success: false, message: "Error resetting vote in database." };
  }
}

// ── Admin: Reset All Votes ──

export async function adminResetAllVotes(): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Delete all votes in Supabase votes table
    const { data: allVotes } = await supabase.from("votes").select("receipt_id");
    if (allVotes && allVotes.length > 0) {
      for (const v of allVotes) {
        await supabase.from("votes").delete().eq("receipt_id", v.receipt_id);
      }
    }
    await supabase.from("votes").delete().neq("receipt_id", "dummy-id");

    // 2. Reset all voters in Supabase
    await supabase
      .from("voters")
      .update({
        has_voted: false,
        vote_receipt_id: null,
        vote_timestamp: null,
      })
      .neq("id", "dummy-id");

    // 3. Reset candidate vote counts in Supabase
    const { data: cands } = await supabase.from("candidates").select("id");
    if (cands) {
      for (const c of cands) {
        await supabase.from("candidates").update({ vote_count: 0 }).eq("id", c.id);
      }
    }

    // 4. Reset election state total votes cast in Supabase
    await supabase.from("election_state").update({ total_votes_cast: 0 }).eq("id", 1);

    // 5. Clear LocalStorage caches
    if (typeof window !== "undefined") {
      localStorage.setItem(VOTES_KEY, JSON.stringify([]));

      const currentCands = getCandidates();
      const resetCands = currentCands.map((c) => ({ ...c, voteCount: 0 }));
      saveCandidates(resetCands);

      const voters = getStoredVotersList();
      const resetVoters = voters.map((v) => ({
        ...v,
        hasVoted: false,
        voteReceiptId: undefined,
        voteTimestamp: undefined,
      }));
      saveStoredVotersList(resetVoters);

      const state = getElectionState();
      localStorage.setItem(
        ELECTION_STATE_KEY,
        JSON.stringify({ ...state, totalVotesCast: 0 })
      );
    }

    // 6. Log Audit Action
    addAuditLog(
      "All Votes Reset (Admin)",
      "Admin executed a complete election vote reset. All candidate totals set to 0 and all ballots cleared.",
      "ADMIN"
    );

    return {
      success: true,
      message: "All election votes have been successfully reset!",
    };
  } catch (err) {
    console.error("Error performing full vote reset:", err);
    return {
      success: false,
      message: "Failed to reset all votes in central database.",
    };
  }
}

