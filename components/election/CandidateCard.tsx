"use client";

import React from "react";
import Link from "next/link";
import { Candidate } from "@/types/election";
import { MapPin } from "lucide-react";

interface CandidateCardProps {
  candidate: Candidate;
  compact?: boolean;
}

export default function CandidateCard({ candidate, compact = false }: CandidateCardProps) {
  return (
    <Link href={`/candidates/${candidate.slug}`}>
      <div className="nisc-card p-5 h-full cursor-pointer group">
        {/* Header: Badge + Year/Dept */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="nisc-badge border text-xs"
            style={{
              backgroundColor: candidate.colorLight,
              color: candidate.color,
              borderColor: candidate.color + "40",
            }}
          >
            {candidate.icon} {candidate.codename}
          </span>
          <span className="text-xs text-nisc-gray font-medium">
            {candidate.year} • {candidate.department}
          </span>
        </div>

        {/* Name */}
        <h3 className="font-heading font-bold text-xl text-nisc-navy group-hover:text-nisc-orange transition-colors">
          {candidate.name}
        </h3>

        {/* State */}
        <div className="flex items-center gap-1.5 mt-2 text-sm text-nisc-gray">
          <MapPin className="w-3.5 h-3.5 text-nisc-orange" />
          <span>State: {candidate.state}</span>
        </div>

        {/* Contesting For */}
        <div className="mt-4 pt-3 border-t border-nisc-border/50">
          <p className="text-xs font-semibold text-nisc-orange uppercase tracking-wider mb-2">
            Contesting Position
          </p>
          <div className="flex flex-wrap gap-1.5">
            {candidate.contestingFor.map((pos) => (
              <span
                key={pos}
                className="text-xs bg-nisc-gray-light text-nisc-navy font-medium px-2.5 py-1 rounded-md"
              >
                {pos}
              </span>
            ))}
          </div>
        </div>

        {/* Vision preview (not in compact mode) */}
        {!compact && (
          <p className="mt-4 text-sm text-nisc-gray leading-relaxed line-clamp-3">
            {candidate.vision}
          </p>
        )}

        {/* CTA */}
        <div className="mt-4 text-sm font-semibold text-nisc-orange group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
          Read Manifesto →
        </div>
      </div>
    </Link>
  );
}
