"use client";

import Link from "next/link";
import { FileText, Users, CreditCard, ArrowRight } from "@phosphor-icons/react";

export default function AdminHomePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome to the Achievers Junior College administration portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/applications"
          className="group block p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#0E1528] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileText size={24} weight="duotone" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#0E1528] transition-colors">
            Applications & Admissions
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Review admissions, update fee structures, and manage applicants.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E1528] mt-4">
            Open Applications <ArrowRight size={14} weight="bold" />
          </span>
        </Link>

        <Link
          href="/admin/payments"
          className="group block p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <CreditCard size={24} weight="duotone" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            Payments Directory
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Inspect transaction history, payment verification, and receipts.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 mt-4">
            View Payments <ArrowRight size={14} weight="bold" />
          </span>
        </Link>

        <Link
          href="/admin/profile"
          className="group block p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users size={24} weight="duotone" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
            Profile & Settings
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage your administrator credentials and notification preferences.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 mt-4">
            Manage Profile <ArrowRight size={14} weight="bold" />
          </span>
        </Link>
      </div>
    </div>
  );
}
