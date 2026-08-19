import { Voter } from "@/types/election";
import { initialVoters } from "@/data/voters";
import { supabase } from "./supabase";

const VOTER_SESSION_KEY = "nisc_voter_session";
const ADMIN_SESSION_KEY = "nisc_admin_session";
const VOTERS_LIST_KEY = "nisc_voters_list";

export function mapDbVoterToVoter(row: any): Voter {
  return {
    id: row.id,
    name: row.name,
    rollNumber: row.roll_number,
    year: row.year,
    department: row.department,
    state: row.state,
    hasVoted: Boolean(row.has_voted),
    voteReceiptId: row.vote_receipt_id || undefined,
    voteTimestamp: row.vote_timestamp || undefined,
  };
}

// ── Voter Authentication ──

export async function authenticateVoter(rollNumber: string): Promise<{
  success: boolean;
  voter?: Voter;
  message: string;
}> {
  const cleaned = rollNumber.trim();
  if (!cleaned) {
    return { success: false, message: "Please enter your roll number." };
  }

  try {
    const { data, error } = await supabase
      .from("voters")
      .select("*")
      .eq("roll_number", cleaned)
      .maybeSingle();

    if (!error && data) {
      const voter = mapDbVoterToVoter(data);
      setStoredVoterSession(voter);
      return {
        success: true,
        voter,
        message: "Welcome, " + voter.name + "!",
      };
    }
  } catch (err) {
    console.warn("Supabase voter auth fallback to local list:", err);
  }

  // Fallback to local list
  const voters = getStoredVotersList();
  const found = voters.find((v) => v.rollNumber === cleaned);

  if (!found) {
    return {
      success: false,
      message: "Roll number not found in the NISC member registry. Only registered NISC members can vote.",
    };
  }

  setStoredVoterSession(found);
  return {
    success: true,
    voter: found,
    message: "Welcome, " + found.name + "!",
  };
}

// ── Voter Session ──

export function getStoredVoterSession(): Voter | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(VOTER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredVoterSession(voter: Voter): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(VOTER_SESSION_KEY, JSON.stringify(voter));
}

export function clearVoterSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(VOTER_SESSION_KEY);
}

// ── Voter Registry ──

export async function fetchVotersFromSupabase(): Promise<Voter[]> {
  try {
    const { data, error } = await supabase.from("voters").select("*").order("id", { ascending: true });
    if (!error && data && data.length > 0) {
      const voters = data.map(mapDbVoterToVoter);
      saveStoredVotersList(voters);
      return voters;
    }
  } catch (err) {
    console.warn("Error fetching voters from Supabase:", err);
  }
  return getStoredVotersList();
}

export function getStoredVotersList(): Voter[] {
  if (typeof window === "undefined") return initialVoters;
  try {
    const raw = localStorage.getItem(VOTERS_LIST_KEY);
    if (raw) {
      const storedVoters: Voter[] = JSON.parse(raw);
      const storedMap = new Map(storedVoters.map((v) => [v.id, v]));

      const mergedList: Voter[] = initialVoters.map((initVoter) => {
        const existing = storedMap.get(initVoter.id);
        if (existing) {
          return {
            ...initVoter,
            hasVoted: existing.hasVoted ?? false,
            voteReceiptId: existing.voteReceiptId,
            voteTimestamp: existing.voteTimestamp,
          };
        }
        return initVoter;
      });

      const initIds = new Set(initialVoters.map((v) => v.id));
      storedVoters.forEach((v) => {
        if (!initIds.has(v.id)) {
          mergedList.push(v);
        }
      });

      localStorage.setItem(VOTERS_LIST_KEY, JSON.stringify(mergedList));
      return mergedList;
    }
  } catch {
    // fallback
  }
  localStorage.setItem(VOTERS_LIST_KEY, JSON.stringify(initialVoters));
  return initialVoters;
}

export function saveStoredVotersList(voters: Voter[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(VOTERS_LIST_KEY, JSON.stringify(voters));
}

// ── Admin Authentication ──

export function authenticateAdmin(passcode: string): boolean {
  if (passcode === "nisc-admin-2026") {
    if (typeof window !== "undefined") {
      localStorage.setItem(ADMIN_SESSION_KEY, "true");
    }
    return true;
  }
  return false;
}

export function checkIsAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function logoutAdmin(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}
