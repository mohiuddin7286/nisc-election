"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/candidates", label: "Candidates" },
  { href: "/voter", label: "Vote" },
  { href: "/results", label: "Results" },
];

export default function ElectionHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-nisc-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm border border-nisc-border/50 group-hover:shadow-md transition-shadow">
            <Image src="/logo.png" alt="NISC" width={36} height={36} className="object-cover" />
          </div>
          <span className="font-heading font-bold text-lg text-nisc-navy tracking-tight">
            NISC
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-nisc-gray hover:text-nisc-orange transition-colors rounded-lg hover:bg-nisc-orange-light/50"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/voter"
            className="hidden md:inline-flex nisc-btn-primary text-sm px-5 py-2.5"
          >
            Cast Vote
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-nisc-gray hover:bg-nisc-gray-light transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-nisc-border/50 py-3 px-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-nisc-navy hover:text-nisc-orange hover:bg-nisc-orange-light/50 rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/voter"
            onClick={() => setMobileOpen(false)}
            className="block nisc-btn-primary text-sm text-center mt-2"
          >
            Cast Vote
          </Link>
        </div>
      )}
    </header>
  );
}
