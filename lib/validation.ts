/** Generates a unique vote receipt ID */
export function generateVoteReceiptId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "REC-";
  for (let i = 0; i < 4; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  id += "-NISC-2026";
  return id;
}

/** Validates a KLH roll number format (10-digit number starting with 24, 25, or 26) */
export function isValidRollNumber(roll: string): boolean {
  const cleaned = roll.trim();
  return /^2[4-6]\d{8}$/.test(cleaned);
}
