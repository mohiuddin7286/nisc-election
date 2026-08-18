"use client";

import React from "react";
import { CheckCircle2, Copy } from "lucide-react";

interface VoteConfirmationProps {
  receiptId: string;
  timestamp: string;
  onDone: () => void;
}

export default function VoteConfirmation({ receiptId, timestamp, onDone }: VoteConfirmationProps) {
  const copyReceipt = () => {
    navigator.clipboard.writeText(receiptId);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="nisc-card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>

        <h2 className="font-heading font-bold text-2xl text-nisc-navy mb-2">
          Vote Recorded!
        </h2>
        <p className="text-sm text-nisc-gray mb-6">
          Your ballot has been successfully cast and recorded. Thank you for participating in the NISC Election 2026–27.
        </p>

        {/* Receipt */}
        <div className="bg-nisc-gray-light rounded-xl p-4 mb-4">
          <p className="text-xs text-nisc-gray font-medium uppercase tracking-wider mb-2">
            Your Receipt ID
          </p>
          <div className="flex items-center justify-center gap-2">
            <code className="font-mono text-lg font-bold text-nisc-navy">{receiptId}</code>
            <button
              onClick={copyReceipt}
              className="p-1.5 rounded-lg hover:bg-white text-nisc-gray hover:text-nisc-orange transition-colors"
              title="Copy receipt"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-nisc-gray mt-2">
            {new Date(timestamp).toLocaleString("en-IN", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        </div>

        <p className="text-xs text-nisc-gray mb-6">
          Save this receipt ID for your records. Official results will be published after polls close.
        </p>

        <button onClick={onDone} className="nisc-btn-outline text-sm w-full">
          Return to Profile
        </button>
      </div>
    </div>
  );
}
