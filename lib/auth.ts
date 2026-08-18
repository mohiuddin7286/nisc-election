import { Voter } from "@/types/election";
import { initialVoters } from "@/data/voters";

const VOTER_SESSION_KEY = "nisc_voter_session";
const ADMIN_SESSION_KEY = "nisc_admin_session";
const VOTERS_LIST_KEY = "nisc_voters_list";

// ── Voter Authentication ──

export function authenticateVoter(rollNumber: string): {
  success: boolean;
  voter?: Voter;
  message: string;
} {
  const cleaned = rollNumber.trim();
  if (!cleaned) {
    return { success: false, message: "Please enter your roll number." };
  }

  const voters = getStoredVotersList();
  const found = voters.find((v) => v.rollNumber === cleaned);

  if (!found) {
    return {
      success: false,
      message: "Roll number not found in the NISC member registry. Only registered NISC members can vote.",
    };
  }

  // Save session
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

export function getStoredVotersList(): Voter[] {
  if (typeof window === "undefined") return initialVoters;
  try {
    const raw = localStorage.getItem(VOTERS_LIST_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
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
