import type { Metadata } from "next";
import "./globals.css";
import ElectionHeader from "@/components/election/ElectionHeader";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "NISC Election Portal 2026–27",
  description:
    "Official Election Portal for the North India Student Cell (NISC) Council Election 2026–27 at KL University Hyderabad.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <ElectionHeader />

        <main className="flex-1 container mx-auto px-4 py-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-nisc-border bg-white/60 backdrop-blur-md">
          {/* Gradient top bar */}
          <div className="h-1 bg-gradient-to-r from-nisc-orange via-amber-400 to-blue-500" />

          <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="md:col-span-1">
                <div className="flex items-center gap-2.5 mb-3">
                  <Image src="/logo.png" alt="NISC" width={32} height={32} className="rounded-lg" />
                  <div>
                    <p className="font-heading font-bold text-nisc-navy text-sm">
                      North India Student Cell
                    </p>
                    <p className="text-[10px] text-nisc-gray uppercase tracking-wider">
                      KL University Hyderabad
                    </p>
                  </div>
                </div>
                <p className="text-xs text-nisc-gray leading-relaxed mt-2">
                  A student-run community for North Indian students at KLH — fostering culture, academic mentorship, leadership, and a warm home away from home.
                </p>
              </div>

              {/* Explore */}
              <div>
                <p className="text-xs font-semibold text-nisc-gray uppercase tracking-wider mb-3">
                  Explore
                </p>
                <div className="space-y-2">
                  <Link href="/" className="block text-sm text-nisc-navy hover:text-nisc-orange transition-colors">
                    Election Home
                  </Link>
                  <Link href="/candidates" className="block text-sm text-nisc-navy hover:text-nisc-orange transition-colors">
                    Candidates
                  </Link>
                  <Link href="/voter" className="block text-sm text-nisc-navy hover:text-nisc-orange transition-colors">
                    Cast Your Vote
                  </Link>
                </div>
              </div>

              {/* Election */}
              <div>
                <p className="text-xs font-semibold text-nisc-gray uppercase tracking-wider mb-3">
                  Election
                </p>
                <div className="space-y-2">
                  <Link href="/results" className="block text-sm text-nisc-navy hover:text-nisc-orange transition-colors">
                    Results
                  </Link>
                  <Link href="/candidates/zeus" className="block text-sm text-nisc-navy hover:text-nisc-orange transition-colors">
                    Manifestos
                  </Link>
                </div>
              </div>

              {/* Governance */}
              <div>
                <p className="text-xs font-semibold text-nisc-gray uppercase tracking-wider mb-3">
                  Governance
                </p>
                <div className="space-y-2">
                  <span className="block text-sm text-nisc-navy">
                    Annual Election
                  </span>
                  <span className="block text-sm text-nisc-navy">
                    NISC Rulebook
                  </span>
                  {/* Discreet admin link */}
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-nisc-orange transition-colors mt-2"
                    title="Admin"
                  >
                    AD
                  </Link>
                </div>
              </div>
            </div>

            <div className="border-t border-nisc-border mt-8 pt-4 text-center text-xs text-nisc-gray">
              © 2026 North India Student Cell, KL University Hyderabad. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
