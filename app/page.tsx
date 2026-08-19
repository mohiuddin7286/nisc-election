"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import ElectionStatus from "@/components/election/ElectionStatus";
import ElectionTimeline from "@/components/election/ElectionTimeline";
import CandidateGrid from "@/components/election/CandidateGrid";
import { getCandidates } from "@/lib/election";
import {
  Vote,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

export default function Home() {
  const candidates = getCandidates();

  return (
    <div className="space-y-10 pb-12">
      {/* ── Hero Section ── */}
      <section className="nisc-section p-8 md:p-12 text-center relative overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-orange-200/40 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-blue-200/40 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Badge */}
          <span className="nisc-badge bg-nisc-orange-light text-nisc-orange border border-orange-200 mx-auto">
            <span className="w-2 h-2 rounded-full bg-nisc-orange animate-pulse-dot inline-block" />
            2026–27 Leadership Elections
          </span>

          {/* Logo */}
          <div className="w-20 h-20 mx-auto mt-6 mb-4 rounded-2xl overflow-hidden shadow-card border border-nisc-border/50">
            <Image src="/logo.png" alt="NISC" width={80} height={80} className="object-cover" />
          </div>

          {/* Title */}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-nisc-navy leading-tight tracking-tight mt-4">
            2026–27 Elections Portal —{" "}
            <span className="gradient-text">Voting Live</span>
          </h1>

          <p className="text-base md:text-lg text-nisc-gray mt-4 max-w-xl mx-auto leading-relaxed">
            Official election rules announced on 19 August 2026. Voting officially started at 12:00 PM, 19 August 2026. Cast your secret ballot now!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              href="/voter"
              className="nisc-btn-primary text-sm flex items-center gap-2 px-6"
            >
              <Vote className="w-4 h-4" /> Cast Your Vote <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/candidates"
              className="nisc-btn-outline text-sm flex items-center gap-2 px-6"
            >
              Explore Manifestos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Election Status Banner ── */}
      <ElectionStatus />

      {/* ── Contesting Candidates ── */}
      <section>
        <div className="text-center mb-6">
          <p className="nisc-badge bg-nisc-orange-light text-nisc-orange border border-orange-200 mx-auto w-fit mb-3">
            Contesting Candidates
          </p>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-nisc-navy">
            2026–27 Leadership Contenders
          </h2>
          <p className="text-sm text-nisc-gray mt-2">
            All three candidates are contesting for both President and Vice President.
          </p>
        </div>
        <CandidateGrid candidates={candidates} />
      </section>

      {/* ── Election Timeline ── */}
      <ElectionTimeline />

      {/* ── Election Info Cards ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Election In-Charges */}
        <div className="nisc-card p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-nisc-gray" />
              <h3 className="font-heading font-bold text-nisc-navy">Election In-Charges</h3>
            </div>
            <span className="nisc-badge bg-blue-50 text-blue-600 border border-blue-200 text-[10px]">
              To Be Appointed
            </span>
          </div>
          <p className="text-sm text-nisc-gray leading-relaxed mb-4">
            Two members will serve as neutral observers throughout the election process to maintain transparency and fairness in the conduct and activities of candidates.
          </p>
          <p className="text-xs text-nisc-gray italic">
            Observers maintain strict impartiality and oversee candidate conduct until polling completes.
          </p>
        </div>

        {/* Manifesto Guidelines */}
        <div className="nisc-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <h3 className="font-heading font-bold text-nisc-navy">Candidate Manifesto Guidelines</h3>
          </div>
          <ul className="space-y-2">
            {[
              "Must follow the NISC Rulebook",
              "Must focus on building a strong and inclusive student community",
              "Must promote academic assistance, guidance, teamwork and mutual support",
              "Must focus on the overall development of NISC and its members",
              "Must NOT simply promote Hindi culture",
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-nisc-gray">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Voting Procedure Notice */}
      <div className="nisc-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-nisc-gray shrink-0 mt-0.5" />
          <div>
            <h3 className="font-heading font-bold text-nisc-navy">
              Voting Procedure & Rules Announced
            </h3>
            <p className="text-sm text-nisc-gray mt-0.5">
              Official voting regulations & rules announced on 19 August 2026. Polling is currently OPEN.
            </p>
          </div>
        </div>
        <span className="nisc-badge bg-green-50 text-green-700 border border-green-200 shrink-0 text-xs">
          Voting Live (Started 19 Aug, 12:00 PM)
        </span>
      </div>

      {/* ── Election Confidentiality ── */}
      <section className="nisc-section p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
        <h3 className="font-heading font-bold text-xl text-nisc-orange mb-2">
          Election Confidentiality
        </h3>
        <p className="text-sm text-nisc-gray max-w-2xl mx-auto leading-relaxed mb-4">
          Candidates and members are strictly requested not to discuss or share internal election matters with outsiders or faculty. Any attempt to involve outsiders or faculty in the election process may result in strict action under applicable NISC rules.
        </p>
        <div className="border-t border-nisc-border pt-4 max-w-xl mx-auto">
          <p className="text-sm font-semibold text-nisc-navy tracking-wide">
            &ldquo;KEEP IT DEMOCRATIC. KEEP IT FAIR. LET THE MEMBERS CHOOSE THEIR LEADERS.&rdquo;
          </p>
        </div>
      </section>
    </div>
  );
}
