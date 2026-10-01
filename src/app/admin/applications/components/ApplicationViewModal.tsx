"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  User,
  MapPin,
  GraduationCap,
  FileText,
  Calendar,
  Phone,
  EnvelopeSimple,
  IdentificationCard,
  CreditCard,
  CheckCircle,
  Clock,
  WarningCircle,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import { AchieversApplication } from "@/lib/helpers/admin/achieversAdmissionsHelper";

type ApplicationViewModalProps = {
  application: AchieversApplication | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function ApplicationViewModal({ application, isOpen, onClose }: ApplicationViewModalProps) {
  const [detailsLoading, setDetailsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setDetailsLoading(true);
      const timer = window.setTimeout(() => setDetailsLoading(false), 200);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen, application]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !application) return null;

  const data = application.raw || {};

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
      case "selected":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "pending":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "verification":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "failed":
      case "regret":
      case "rejected":
        return "text-rose-700 bg-rose-50 border-rose-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative bg-[#f8fafc] w-full max-w-5xl h-full max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/20 z-10 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-none px-6 py-4 bg-white border-b border-gray-100 flex justify-between items-center z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0E1528]/10 text-[#0E1528] rounded-xl">
              <IdentificationCard size={24} weight="duotone" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                {application.id} &bull; Submitted: {application.submitted}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Content Body */}
        {detailsLoading ? (
          <div className="flex-1 p-6 space-y-6 animate-pulse">
            <div className="h-44 bg-white rounded-2xl border border-gray-100 p-6 flex gap-6">
              <div className="w-32 h-32 bg-gray-200 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-1/3 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-100 rounded" />
                <div className="h-10 w-full bg-gray-50 rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48 bg-white rounded-2xl border border-gray-100" />
              <div className="h-48 bg-white rounded-2xl border border-gray-100" />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Top Section: Profile & Quick Info */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 border-4 border-white shadow-md relative flex items-center justify-center text-gray-400">
                  {data.profileImageUrl || application.raw?.profileImageUrl ? (
                    <img
                      src={data.profileImageUrl || application.raw?.profileImageUrl}
                      alt={application.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <User size={56} weight="duotone" className="text-gray-300" />
                  )}
                </div>
                <span className="mt-2.5 text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                  ID: {application.id}
                </span>
              </div>

              {/* Main Credentials */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <h3 className="text-2xl font-bold text-gray-900">{application.name}</h3>
                  <p className="text-sm font-semibold text-[#0E1528] mt-0.5">{application.course}</p>
                </div>

                <InfoCard icon={<EnvelopeSimple />} label="Email" value={application.email} />
                <InfoCard icon={<Phone />} label="Phone" value={application.mobile} />
                <InfoCard icon={<Calendar />} label="Date of Birth" value={data.dateOfBirth} />
                <InfoCard icon={<User />} label="Gender" value={data.gender || "N/A"} className="capitalize" />
                <InfoCard icon={<GraduationCap />} label="Program" value={data.applicationFor || "Intermediate"} />
                <InfoCard icon={<GraduationCap />} label="College" value="Achievers Junior College" />

                {/* Status Badges */}
                <div className="col-span-1 sm:col-span-2 flex gap-4 mt-2">
                  <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Payment Status</p>
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-lg border ${getStatusColor(application.payment)}`}>
                      {application.payment}
                    </span>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Admission Status</p>
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-lg border ${getStatusColor(application.admission)}`}>
                      {application.admission || "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal & Address Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Personal Details */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User size={18} className="text-[#0E1528]" /> Personal Details
                </h4>
                <div className="flex flex-col">
                  <DetailRow label="Father's Name" value={data.fatherName || data.fathersName} />
                  <DetailRow label="Mother's Name" value={data.motherName || data.mothersName} />
                  <DetailRow label="Nationality" value={data.nationality || "Indian"} />
                  <DetailRow label="Category" value={data.category} />
                  <DetailRow label="Aadhaar Number" value={data.aadhaarNumber || data.aadhaar || "N/A"} />
                </div>
              </div>

              {/* Address Details */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-[#0E1528]" /> Address Details
                </h4>
                <div className="flex flex-col">
                  <DetailRow label="Address" value={data.address || data.postalAddress} />
                  <DetailRow label="City" value={data.city} />
                  <DetailRow label="State" value={data.state} />
                  <DetailRow label="Pincode" value={data.pinCode || data.pincode} />
                </div>
              </div>
            </div>

            {/* Education Qualifications */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <GraduationCap size={18} className="text-[#0E1528]" /> Education Qualifications (SSC / 10th)
              </h4>
              {data.education_qualifications && data.education_qualifications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg whitespace-nowrap">Level</th>
                        <th className="px-4 py-3 whitespace-nowrap">School/Institution</th>
                        <th className="px-4 py-3 whitespace-nowrap">Board</th>
                        <th className="px-4 py-3 whitespace-nowrap">Passing Year</th>
                        <th className="px-4 py-3 whitespace-nowrap">Score</th>
                        <th className="px-4 py-3 rounded-tr-lg whitespace-nowrap">Certificate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.education_qualifications.map((edu: any, idx: number) => (
                        <tr key={edu.educationId || idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                            {edu.level || "Class X"}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {edu.schoolOrCollege || edu.schoolName || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {edu.boardOrUniversity || edu.board || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {edu.passingYear || "N/A"}
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#0E1528] whitespace-nowrap">
                            {edu.gradeOrPercentage || "N/A"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {edu.certificateUrl ? (
                              <a
                                href={edu.certificateUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E1528] hover:text-[#1a2542] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                <FileText size={16} /> View Doc <ArrowSquareOut size={14} />
                              </a>
                            ) : (
                              <span className="text-gray-400 text-xs">Not uploaded</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-sm">
                  No education qualifications records found.
                </div>
              )}
            </div>

            {/* Transaction / Fee Details */}
            {data.transaction && (
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <CreditCard size={18} className="text-[#0E1528]" /> Payment & Transaction Info
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">Payment Status</p>
                    <p className="text-base font-bold text-gray-900 mt-1 capitalize">{data.transaction.status}</p>
                  </div>
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">Amount Paid</p>
                    <p className="text-base font-bold text-[#0E1528] mt-1">₹{data.transaction.amount}</p>
                  </div>
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">Gateway Transaction ID</p>
                    <p className="text-xs font-mono text-gray-700 mt-1.5 truncate">
                      {data.transaction.gatewayTransactionId || data.transaction.transactionId || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | undefined;
  className?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="p-2 bg-slate-100 text-[#0E1528] rounded-lg shrink-0">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 18, weight: "duotone" })}
      </div>
      <div className="overflow-hidden min-w-0">
        <p className="text-[11px] text-gray-500 font-medium mb-0.5 uppercase tracking-wide">{label}</p>
        <p className={`text-sm font-semibold text-gray-900 truncate ${className}`}>{value || "N/A"}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs sm:text-sm text-gray-500 sm:w-1/3 shrink-0">{label}</span>
      <span className="text-xs sm:text-sm font-semibold text-gray-900 mt-1 sm:mt-0 break-words">{value || "N/A"}</span>
    </div>
  );
}
