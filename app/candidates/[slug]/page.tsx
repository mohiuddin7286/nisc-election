"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCandidates } from "@/lib/election";
import { ArrowLeft, MapPin, BookOpen } from "lucide-react";

export default function CandidateManifestoPage() {
  const params = useParams();
  const slug = params.slug as string;
  const candidates = getCandidates();
  const candidate = candidates.find((c) => c.slug === slug);

  if (!candidate) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-heading text-2xl font-bold text-nisc-navy">Candidate Not Found</h1>
        <p className="text-sm text-nisc-gray mt-2">The candidate you are looking for does not exist.</p>
        <Link href="/candidates" className="nisc-btn-primary text-sm mt-6 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Candidates
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-3xl mx-auto space-y-8">
      {/* Back link */}
      <Link
        href="/candidates"
        className="inline-flex items-center gap-1.5 text-sm text-nisc-gray hover:text-nisc-orange transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> All Candidates
      </Link>

      {/* Header */}
      <div className="nisc-section p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20" style={{ backgroundColor: candidate.color }} />
        <div className="relative z-10">
          <span
            className="nisc-badge border text-sm mx-auto"
            style={{
              backgroundColor: candidate.colorLight,
              color: candidate.color,
              borderColor: candidate.color + "40",
            }}
          >
            {candidate.icon} {candidate.codename}
          </span>

          <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-nisc-navy mt-4">
            {candidate.name}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-sm text-nisc-gray">
            <span>{candidate.year} • {candidate.department}</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-nisc-orange" />
              {candidate.state}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {candidate.contestingFor.map((pos) => (
              <span
                key={pos}
                className="text-xs bg-white text-nisc-navy font-medium px-3 py-1.5 rounded-lg border border-nisc-border"
              >
                {pos}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Vision */}
      <div className="nisc-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-nisc-orange" />
          <h2 className="font-heading font-bold text-xl text-nisc-navy">My Vision for NISC</h2>
        </div>
        <p className="text-sm text-nisc-gray leading-relaxed whitespace-pre-line">
          {candidate.vision}
        </p>
      </div>

      {/* Manifesto Pillars */}
      <div className="space-y-4">
        <h2 className="font-heading font-bold text-xl text-nisc-navy nisc-underline text-center">
          Manifesto
        </h2>

        {candidate.pillars.map((pillar, i) => (
          <div key={i} className="nisc-card p-6">
            <div className="flex items-start gap-3">
              <span
                className="text-sm font-bold shrink-0 mt-0.5"
                style={{ color: candidate.color }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-heading font-bold text-lg text-nisc-navy mb-2">
                  {pillar.title}
                </h3>
                <p className="text-sm text-nisc-gray leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Closing Statement */}
      <div className="nisc-section p-6 text-center">
        <p className="text-sm text-nisc-gray leading-relaxed whitespace-pre-line italic max-w-xl mx-auto">
          {candidate.closingStatement}
        </p>
      </div>

      {/* Vote CTA */}
      <div className="text-center">
        <Link href="/voter" className="nisc-btn-primary text-sm inline-flex items-center gap-2">
          Cast Your Vote →
        </Link>
      </div>
    </div>
  );
}
