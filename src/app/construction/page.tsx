"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { WarningCircle, ShieldSlash, ArrowLeft, House } from "@phosphor-icons/react";

function ConstructionContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const isInactive = error === "account_inactive";

  return (
    <div className="min-h-screen bg-[#081225] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0E1B33] border border-slate-700/60 rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
          {isInactive ? (
            <ShieldSlash size={32} className="text-amber-400" weight="duotone" />
          ) : (
            <WarningCircle size={32} className="text-amber-400" weight="duotone" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          {isInactive ? "Account Inactive" : "Portal Unavailable"}
        </h1>

        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          {isInactive
            ? "Your administrative account is currently marked as inactive. Please reach out to your institution administrator or support team to restore access."
            : "This administrative portal or module is currently undergoing scheduled maintenance or updates. Please check back shortly."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors"
          >
            <ArrowLeft size={16} weight="bold" />
            Back to Login
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors border border-slate-700/50"
          >
            <House size={16} />
            College Website
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConstructionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#081225]" />}>
      <ConstructionContent />
    </Suspense>
  );
}
