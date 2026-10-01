"use client";

import { CreditCard } from "@phosphor-icons/react";

export default function AdminPaymentsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payments Directory</h1>
        <p className="text-sm text-gray-500 mt-1">Review applicant transaction logs, Stripe payments, and fee settlements.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-400 mx-auto flex items-center justify-center mb-3">
          <CreditCard size={32} />
        </div>
        <h3 className="text-base font-semibold text-gray-800">Financial & Payment Records</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          View all online Stripe registration fee transactions and reconciliation reports.
        </p>
      </div>
    </div>
  );
}
