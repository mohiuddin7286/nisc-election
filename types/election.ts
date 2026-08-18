export type Position = "President" | "Vice President";

export type ElectionStatus = "UPCOMING" | "OPEN" | "PAUSED" | "CLOSED";

export interface ManifestoPillar {
  title: string;
  description: string;
}

export interface Candidate {
  id: string;
  slug: string;
  name: string;
  codename: string;
  year: string;
  department: string;
  state: string;
  color: string;        // Theme color for the candidate badge
  colorLight: string;   // Light variant for backgrounds
  icon: string;         // Emoji icon for the badge
  contestingFor: Position[];
  vision: string;
  pillars: ManifestoPillar[];
  closingStatement: string;
  voteCount: number;
}

export interface Voter {
  id: string;
  name: string;
  rollNumber: string;
  year: string;
  department: string;
  state: string;
  hasVoted: boolean;
  voteReceiptId?: string;
  voteTimestamp?: string;
}

export interface VoteRecord {
  receiptId: string;
  timestamp: string;
  selections: Record<Position, string>; // Position -> Candidate ID
  voterRoll: string; // Roll number (hashed in production)
}

export interface ElectionState {
  status: ElectionStatus;
  resultsPublished: boolean;
  totalVotesCast: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  category: "VOTE" | "ADMIN" | "SYSTEM" | "EDIT";
}
