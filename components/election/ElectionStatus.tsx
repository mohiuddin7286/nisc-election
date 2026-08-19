"use client";

import React from "react";
import { ShieldCheck, Clock } from "lucide-react";
import { getElectionState } from "@/lib/election";

export default function ElectionStatus() {
  const state = getElectionState();

  const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    UPCOMING: { label: "UPCOMING", color: "text-amber-600", bgColor: "bg-amber-50 border-amber-200" },
    OPEN: { label: "OPEN", color: "text-green-600", bgColor: "bg-green-50 border-green-200" },
    PAUSED: { label: "PAUSED", color: "text-orange-600", bgColor: "bg-orange-50 border-orange-200" },
    CLOSED: { label: "CLOSED", color: "text-red-600", bgColor: "bg-red-50 border-red-200" },
  };

  const cfg = statusConfig[state.status] || statusConfig.UPCOMING;

  return (
    <div className="nisc-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-heading font-bold text-nisc-navy">Election Status</h3>
            <span className={`nisc-badge ${cfg.bgColor} ${cfg.color} border text-xs`}>
              {cfg.label}
            </span>
          </div>
          <p className="text-sm text-nisc-gray">
            Election rules announced and voting officially started on 19 August 2026 at 12:00 PM.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-nisc-gray shrink-0">
        <Clock className="w-4 h-4 text-nisc-orange" />
        <span>
          Voting Started:{" "}
          <span className="font-semibold text-nisc-orange">19 August 2026, 12:00 PM</span>
        </span>
      </div>
    </div>
  );
}
