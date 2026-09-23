import Image from "next/image";
import { ArrowLeft, BookOpen, CreditCard, DownloadSimple, PencilSimple, User } from "@phosphor-icons/react";
import { useEffect, useState, type RefObject } from "react";
import PaymentPreview from "./PaymentPreview";

type Props = {
  details: Record<string, string>;
  attachments: Record<string, string>;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onEdit: () => void;
  onBack?: () => void;
  onDownload: () => void;
  backLabel?: string;
  onDetailsChange?: (details: Record<string, string>) => void;
};

export default function ApplicationSummary({
  details,
  attachments,
  headingRef,
  onEdit,
  onBack,
  onDownload,
  backLabel = "Back to Edit",
}: Props) {
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (!showPayment) headingRef.current?.focus({ preventScroll: true });
  }, [showPayment, headingRef]);

  const fullName = [details.firstName, details.lastName].filter(Boolean).join(" ") || "Student Name";

  function detail(label: string, key: string) {
    return (
      <div key={key} className="flex flex-col gap-0.5">
        <dt className="text-slate-500 font-medium text-[11px]">{label}</dt>
        <dd className="text-slate-900 font-semibold text-xs break-words">{details[key] || "—"}</dd>
      </div>
    );
  }

  if (showPayment) {
    return (
      <PaymentPreview
        onClose={() => setShowPayment(false)}
        applicantName={fullName}
        orderId={details.applicationId}
        amount={details.registrationFee}
      />
    );
  }

  return (
    <section className="max-w-[1100px] mx-auto px-4 py-8 text-[#182336]" aria-labelledby="review-heading">
      <button
        type="button"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#081D36] hover:text-[#0047A9] transition mb-4 cursor-pointer"
        onClick={onBack || onEdit}
        aria-label={backLabel}
        title={backLabel}
      >
        <ArrowLeft size={18} aria-hidden="true" />
        <span>{backLabel}</span>
      </button>

      <div className="p-3.5 mb-5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-center text-xs sm:text-sm font-medium" role="status">
        Your application details are ready for review. Submission is pending.
      </div>

      <div className="overflow-hidden bg-white border border-slate-200 rounded-xl shadow-md">
        <h1
          className="p-4 sm:p-5 bg-gradient-to-r from-[#081D36] to-[#0d3b66] text-white text-center text-lg sm:text-xl font-bold tracking-tight scroll-mt-24"
          id="review-heading"
          ref={headingRef}
          tabIndex={-1}
        >
          Intermediate Admission Application Summary
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 p-5 sm:p-6 gap-6 lg:gap-0">
          {/* Profile Column */}
          <div className="lg:col-span-3 flex flex-col items-center text-center px-2 sm:px-4">
            {attachments.profileImage && (
              <Image
                src={attachments.profileImage}
                alt={`${fullName}'s profile`}
                width={160}
                height={190}
                unoptimized
                className="w-[150px] h-[180px] object-contain rounded-lg border border-slate-200 p-1 mb-3 bg-slate-50 shadow-sm"
              />
            )}
            <p className="text-base font-bold text-[#081D36]">{fullName}</p>
            <p className="text-xs text-slate-500 break-all mt-0.5">{details.email || "Email not provided"}</p>
            {details.applicationId && (
              <span className="mt-2.5 inline-block px-2.5 py-1 bg-blue-50 border border-blue-200 text-[#0047A9] font-mono text-[11px] font-bold rounded-md">
                {details.applicationId}
              </span>
            )}
          </div>

          {/* Personal Details Column */}
          <div className="lg:col-span-5 px-2 sm:px-6 pt-4 lg:pt-0">
            <h2 className="text-sm font-bold text-[#081D36] mb-3 flex items-center gap-2 border-b pb-2 border-slate-100">
              <User size={16} className="text-[#0047A9]" />
              Personal Details
            </h2>
            <dl className="grid grid-cols-2 gap-3 mb-5">
              {details.applicationId && detail("Application No.", "applicationId")}
              {detail("Application For", "applicationFor")}
              {detail("Course", "course")}
              {detail("First Name", "firstName")}
              {detail("Last Name", "lastName")}
              {detail("Father Name", "fatherName")}
              {detail("Mother Name", "motherName")}
              {detail("Gender", "gender")}
              {detail("Date of Birth", "dateOfBirth")}
              {detail("Nationality", "nationality")}
              {detail("Category", "category")}
            </dl>

            <h2 className="text-sm font-bold text-[#081D36] mb-3 flex items-center gap-2 border-b pb-2 border-slate-100">
              <CreditCard size={16} className="text-[#0047A9]" />
              Payment Details
            </h2>
            <dl className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5">
                <dt className="text-slate-500 font-medium text-[11px]">Fees</dt>
                <dd className="text-slate-900 font-semibold text-xs">₹{details.registrationFee}</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-slate-500 font-medium text-[11px]">Payment Status</dt>
                <dd className="text-amber-600 font-semibold text-xs">Not Paid</dd>
              </div>
            </dl>
          </div>

          {/* Contact Details Column */}
          <div className="lg:col-span-4 px-2 sm:px-6 pt-4 lg:pt-0">
            <h2 className="text-sm font-bold text-[#081D36] mb-3 flex items-center gap-2 border-b pb-2 border-slate-100">
              <BookOpen size={16} className="text-[#0047A9]" />
              Contact Details
            </h2>
            <dl className="flex flex-col gap-2.5">
              {detail("Email ID", "email")}
              {detail("Mobile Number", "phone")}
              {detail("Postal Address", "address")}
              {detail("City", "city")}
              {detail("State", "state")}
              {detail("Postcode", "pinCode")}
            </dl>
          </div>
        </div>

        {/* Educational Qualification Table */}
        <section className="border-t border-slate-200 px-5 sm:px-6 py-5 bg-slate-50/50" aria-labelledby="education-summary-heading">
          <h2 id="education-summary-heading" className="text-sm font-bold text-[#081D36] mb-3 flex items-center gap-2">
            <BookOpen size={16} className="text-[#0047A9]" />
            Education Details
          </h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white" tabIndex={0} role="region" aria-label="Education details table">
            <table className="w-full min-w-[720px] text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  {["Class", "School", "Board", "Year", "Grade/Percentage (%)", "Medium", "Certificate"].map((label) => (
                    <th key={label} scope="col" className="p-3 font-semibold text-slate-700">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["X"].map((level) => (
                  <tr key={level} className="hover:bg-slate-50 transition">
                    <th scope="row" className="p-3 font-semibold text-[#081D36] whitespace-nowrap">
                      Class X
                    </th>
                    <td className="p-3 text-slate-700">{details[`class${level}School`] || "—"}</td>
                    <td className="p-3 text-slate-700">{details[`class${level}Board`] || "—"}</td>
                    <td className="p-3 text-slate-700">{details[`class${level}Year`] || "—"}</td>
                    <td className="p-3 text-slate-700">{details[`class${level}Percentage`] ? `${details[`class${level}Percentage`]}%` : "—"}</td>
                    <td className="p-3 text-slate-700">{details[`class${level}Medium`] || "—"}</td>
                    <td className="p-3 text-slate-700 max-w-[240px] break-all">
                      {attachments[`class${level}Certificate`] ? (
                        <a
                          href={attachments[`class${level}Certificate`]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0047A9] font-medium underline hover:text-[#ff7810]"
                        >
                          {details[`class${level}Certificate`]}
                        </a>
                      ) : (
                        details[`class${level}Certificate`] || "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer Actions */}
        <footer className="border-t border-slate-200 p-5 sm:p-6 text-center bg-white flex flex-col items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer"
            onClick={() => setShowPayment(true)}
          >
            <CreditCard size={18} weight="bold" />
            Proceed to Online Payment
          </button>
          <div className="flex flex-wrap justify-center gap-2.5">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
              onClick={onEdit}
            >
              <PencilSimple size={14} />
              Back to Edit Details
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
              onClick={onDownload}
            >
              <DownloadSimple size={14} />
              Download Application Details
            </button>
          </div>
          <p className="text-slate-400 text-[11.5px]">
            UI preview with sample details. No application is submitted and no payment is collected.
          </p>
        </footer>
      </div>
    </section>
  );
}
