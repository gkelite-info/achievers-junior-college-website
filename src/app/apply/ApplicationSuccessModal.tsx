"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, CheckCircle, Copy, DownloadSimple, EnvelopeSimple, X } from "@phosphor-icons/react";

type Props = {
  applicationId: string;
  details: Record<string, string>;
  onProceed: () => void;
  onDownload: () => void;
  onClose: () => void;
};

export default function ApplicationSuccessModal({ applicationId, details, onProceed, onDownload, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(applicationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const fullName = [details.firstName, details.lastName].filter(Boolean).join(" ") || "Applicant";
  const email = details.email || "your registered email";

  return (
    <div
      className="fixed inset-0 bg-[#081D36]/65 backdrop-blur-[4px] flex items-center justify-center p-4 sm:p-6 z-[1000]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative bg-white rounded-xl w-full max-w-[510px] shadow-2xl overflow-hidden m-auto border border-slate-100">
        <div className="relative bg-[#081D36] text-white px-5 py-4 flex items-center gap-3.5">
          <button
            type="button"
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#10b981] text-white shrink-0 shadow-md">
            <CheckCircle size={24} weight="fill" />
          </div>
          <div className="flex flex-col pr-7">
            <h2 id="modal-title" className="text-base font-bold tracking-tight text-white m-0">
              Application Saved Successfully!
            </h2>
            <p className="text-[11.5px] text-slate-300 mt-0.5 leading-snug">
              Your intermediate admission details have been recorded.
            </p>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-3">
          <div className="bg-slate-50 border-[1.5px] border-dashed border-slate-300 rounded-lg p-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Assigned Application Number
              </span>
              <span className="text-[17px] font-extrabold text-[#081D36] tracking-wide font-mono">
                {applicationId}
              </span>
            </div>
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-semibold rounded-md border transition cursor-pointer ${copied
                  ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              onClick={copyToClipboard}
              title="Copy Application Number"
            >
              {copied ? <Check size={14} weight="bold" /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-200 rounded-lg p-2.5" role="status">
            <EnvelopeSimple size={20} weight="duotone" className="text-[#0047A9] shrink-0" />
            <div className="text-[11.5px] text-blue-900 leading-snug">
              Keep your <strong>Application Number ({applicationId})</strong> for future reference. Registered email: <strong>{email}</strong>.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#fbfcfe] border border-slate-200 rounded-lg p-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-slate-500 font-medium">Applicant Name</span>
              <span className="text-xs text-slate-900 font-semibold break-all">{fullName}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-slate-500 font-medium">Applying For</span>
              <span className="text-xs text-slate-900 font-semibold break-all">
                {details.applicationFor || "Intermediate 1st Year"}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-slate-500 font-medium">Chosen Stream</span>
              <span className="text-xs text-slate-900 font-semibold break-all">{details.course || "—"}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-slate-500 font-medium">Registration Fee</span>
              <span className="text-xs text-slate-900 font-semibold break-all">
                ₹{details.registrationFee || "500"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-[#ff7810] hover:bg-[#e66606] text-white text-[13px] font-semibold shadow-md transition cursor-pointer active:translate-y-px"
              onClick={onProceed}
            >
              Proceed to Review & Payment <ArrowRight size={16} weight="bold" />
            </button>
            <div className="flex gap-2 flex-col sm:flex-row">
              <button
                type="button"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 text-[11.5px] font-medium transition cursor-pointer"
                onClick={onDownload}
              >
                <DownloadSimple size={15} /> Download Slip
              </button>
              <button
                type="button"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 text-[11.5px] font-medium transition cursor-pointer"
                onClick={onClose}
              >
                Back to Edit Form
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
