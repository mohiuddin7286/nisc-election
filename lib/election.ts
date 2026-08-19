import { Candidate, ElectionState, AuditLog, VoteRecord, Position, Voter } from "@/types/election";
import { initialCandidates } from "@/data/candidates";
import { generateVoteReceiptId } from "./validation";
import { getStoredVotersList, saveStoredVotersList } from "./auth";

const CANDIDATES_KEY = "nisc_candidates";
const ELECTION_STATE_KEY = "nisc_election_state";
const AUDIT_LOGS_KEY = "nisc_audit_logs";
const VOTES_KEY = "nisc_votes";

// ── Candidates ──

export function getCandidates(): Candidate[] {
  if (typeof window === "undefined") return initialCandidates;
  try {
    const raw = localStorage.getItem(CANDIDATES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return initialCandidates;
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

export function updateElectionState(updates: Partial<ElectionState>): ElectionState {
  const current = getElectionState();
  const updated = { ...current, ...updates };
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

export function addAuditLog(action: string, details: string, category: AuditLog["category"]): void {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action,
    details,
    category,
  };
  const updated = [newLog, ...logs];
  if (typeof window !== "undefined") {
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updated));
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

// ── Submit Vote ──

export function submitVoteBallot(
  voter: Voter,
  selections: Record<Position, string>
): { success: boolean; receiptId?: string; message: string } {
  const state = getElectionState();
  if (state.status !== "OPEN") {
    return {
      success: false,
      message: "Voting is not currently open. Please wait for the official voting period.",
    };
  }

  if (voter.hasVoted) {
    return {
      success: false,
      message: "You have already cast your ballot in this election.",
    };
  }

  const receiptId = generateVoteReceiptId();
  const timestamp = new Date().toISOString();

  const newRecord: VoteRecord = {
    receiptId,
    timestamp,
    selections,
    voterRoll: voter.rollNumber,
  };

  if (typeof window !== "undefined") {
    try {
      // Save vote record
      const votes = getVoteRecords();
      votes.push(newRecord);
      localStorage.setItem(VOTES_KEY, JSON.stringify(votes));

      // Update candidate vote counts
      const candidates = getCandidates();
      for (const [, candId] of Object.entries(selections)) {
        const idx = candidates.findIndex((c) => c.id === candId);
        if (idx !== -1) {
          candidates[idx].voteCount += 1;
        }
      }
      saveCandidates(candidates);

      // Update voter status
      const voters = getStoredVotersList();
      const voterIdx = voters.findIndex((v) => v.rollNumber === voter.rollNumber);
      if (voterIdx !== -1) {
        voters[voterIdx].hasVoted = true;
        voters[voterIdx].voteReceiptId = receiptId;
        voters[voterIdx].voteTimestamp = timestamp;
        saveStoredVotersList(voters);
      }

      // Update election state
      updateElectionState({ totalVotesCast: state.totalVotesCast + 1 });

      // Add audit log
      addAuditLog(
        "Vote Cast",
        `Ballot receipt ${receiptId} generated for roll ${voter.rollNumber}.`,
        "VOTE"
      );
    } catch (e) {
      console.error("Failed to store vote:", e);
      return { success: false, message: "An error occurred while saving your vote. Please try again." };
    }
  }

  return {
    success: true,
    receiptId,
    message: "Your vote has been successfully recorded!",
  };
}

// ── Admin: Edit Vote ──

export function adminEditVote(
  voterRoll: string,
  newSelections: Record<Position, string>,
  adminNote: string
): { success: boolean; message: string } {
  if (typeof window === "undefined") return { success: false, message: "Server-side not supported." };

  const votes = getVoteRecords();
  const voteIdx = votes.findIndex((v) => v.voterRoll === voterRoll);

  if (voteIdx === -1) {
    return { success: false, message: "No vote record found for this roll number." };
  }

  const oldSelections = votes[voteIdx].selections;

  // Decrement old candidate counts
  const candidates = getCandidates();
  for (const [, candId] of Object.entries(oldSelections)) {
    const idx = candidates.findIndex((c) => c.id === candId);
    if (idx !== -1) candidates[idx].voteCount = Math.max(0, candidates[idx].voteCount - 1);
  }

  // Increment new candidate counts
  for (const [, candId] of Object.entries(newSelections)) {
    const idx = candidates.findIndex((c) => c.id === candId);
    if (idx !== -1) candidates[idx].voteCount += 1;
  }

  saveCandidates(candidates);

  // Update vote record
  votes[voteIdx].selections = newSelections;
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));

  // Audit log
  addAuditLog(
    "Vote Edited (Admin)",
    `Admin modified ballot for roll ${voterRoll}. Note: ${adminNote}`,
    "EDIT"
  );

  return { success: true, message: "Vote has been updated successfully." };
}

// ── Admin: Reset Voter's Vote ──

export function adminResetVoterVote(
  voterRoll: string,
  reason: string
): { success: boolean; message: string } {
  if (typeof window === "undefined") return { success: false, message: "Server-side not supported." };

  const voters = getStoredVotersList();
  const voterIdx = voters.findIndex((v) => v.rollNumber === voterRoll);

  if (voterIdx === -1) {
    return { success: false, message: "Voter not found." };
  }

  const voter = voters[voterIdx];
  if (!voter.hasVoted) {
    return { success: false, message: "This voter has not cast a vote yet." };
  }

  // Find their vote record
  const votes = getVoteRecords();
  const voteIdx = votes.findIndex((v) => v.voterRoll === voterRoll);

  if (voteIdx !== -1) {
    const ballot = votes[voteIdx];
    // Decrement candidate vote counts
    const candidates = getCandidates();
    for (const [, candId] of Object.entries(ballot.selections)) {
      const cIdx = candidates.findIndex((c) => c.id === candId);
      if (cIdx !== -1) {
        candidates[cIdx].voteCount = Math.max(0, candidates[cIdx].voteCount - 1);
      }
    }
    saveCandidates(candidates);

    // Remove vote record
    votes.splice(voteIdx, 1);
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
  }

  // Reset voter status
  voters[voterIdx].hasVoted = false;
  delete voters[voterIdx].voteReceiptId;
  delete voters[voterIdx].voteTimestamp;
  saveStoredVotersList(voters);

  // Update total votes cast count
  const state = getElectionState();
  updateElectionState({ totalVotesCast: Math.max(0, state.totalVotesCast - 1) });

  // Audit log
  addAuditLog(
    "Voter Vote Reset (Admin)",
    `Admin reset vote for member ${voter.name} (${voterRoll}). Reason: ${reason}`,
    "EDIT"
  );

  return {
    success: true,
    message: `Vote for ${voter.name} (${voterRoll}) has been successfully reset.`,
  };
}


