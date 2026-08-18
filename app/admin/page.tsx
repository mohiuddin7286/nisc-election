"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authenticateAdmin } from "@/lib/auth";
import { Lock, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const success = authenticateAdmin(passcode);
      if (success) {
        router.push("/admin/dashboard");
      } else {
        setError("Invalid admin passcode.");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="py-20 max-w-sm mx-auto">
      <div className="nisc-card p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-7 h-7 text-nisc-gray" />
        </div>

        <h1 className="font-heading font-bold text-xl text-nisc-navy mb-1">
          Admin Access
        </h1>
        <p className="text-xs text-nisc-gray mb-6">
          Election administration panel. Authorized personnel only.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter admin passcode"
            className="w-full px-4 py-3 rounded-xl border border-nisc-border bg-white text-nisc-navy placeholder:text-slate-400 focus:outline-none focus:border-nisc-orange focus:ring-2 focus:ring-nisc-orange/20 transition-all text-sm"
            autoComplete="off"
          />

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-left">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !passcode.trim()}
            className="w-full nisc-btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
