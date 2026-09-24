import Image from "next/image";
import { ArrowLeft, BookOpen, CheckCircle, CreditCard, DownloadSimple, PencilSimple, User } from "@phosphor-icons/react";
import { useEffect, useState, type RefObject } from "react";
import { toast } from "react-hot-toast";

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
      <div key={key} className="flex flex-col gap-1 p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <dt className="text-slate-500 font-medium text-[10.5px] uppercase tracking-wider">{label}</dt>
        <dd className="text-slate-900 font-semibold text-xs break-words">{details[key] || "—"}</dd>
      </div>
    );
  }

  async function handlePayment() {
    setShowPayment(true);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationNumber: details.applicationId, amount: details.registrationFee }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create checkout session");
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(error.message);
      setShowPayment(false);
    }
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

        <div className="grid grid-cols-1 lg:grid-cols-12 p-5 sm:p-6 gap-6 bg-slate-50/30">
          {/* Profile Column */}
          <div className="lg:col-span-4 flex flex-col items-center text-center p-5 bg-white border border-slate-200/90 rounded-xl shadow-xs self-start">
            {attachments.profileImage ? (
              <Image
                src={attachments.profileImage}
                alt={`${fullName}'s profile`}
                width={160}
                height={190}
                unoptimized
                className="w-[150px] h-[180px] object-contain rounded-lg border border-slate-200 p-1 mb-3 bg-slate-50 shadow-sm"
              />
            ) : (
              <div className="w-[150px] h-[180px] rounded-lg border border-slate-200 mb-3 bg-slate-100 flex items-center justify-center text-slate-400">
                <User size={48} />
              </div>
            )}
            <p className="text-base font-bold text-[#081D36]">{fullName}</p>
            <p className="text-xs text-slate-500 break-all mt-0.5">{details.email || "Email not provided"}</p>
            {details.applicationId && (
              <span className="mt-2.5 inline-block px-3 py-1 bg-blue-50 border border-blue-200 text-[#0047A9] font-mono text-xs font-bold rounded-md">
                {details.applicationId}
              </span>
            )}

            <div className="w-full border-t border-slate-100 mt-4 pt-4 flex flex-col gap-2 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Course</span>
                <span className="font-semibold text-slate-800 text-right">{details.course || "—"}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Academic Year</span>
                <span className="font-semibold text-slate-800">{details.academicYear || "2026-2027"}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Application Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  Submitted
                </span>
              </div>
            </div>
          </div>

          {/* Right Side Content - Boxed and Structured */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* Box 1: Personal Details */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-50 text-[#0047A9]">
                    <User size={18} weight="bold" />
                  </div>
                  <h2 className="text-sm font-bold text-[#081D36]">Personal Details</h2>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Applicant Info
                </span>
              </div>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
            </div>

            {/* Box 2: Contact Details */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-50 text-[#0047A9]">
                    <BookOpen size={18} weight="bold" />
                  </div>
                  <h2 className="text-sm font-bold text-[#081D36]">Contact Details</h2>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Communication
                </span>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {detail("Email ID", "email")}
                {detail("Mobile Number", "phone")}
                {detail("Postal Address", "address")}
                {detail("City", "city")}
                {detail("State", "state")}
                {detail("Postcode", "pinCode")}
              </dl>
            </div>

            {/* Box 3: Payment Details */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-50 text-[#0047A9]">
                    <CreditCard size={18} weight="bold" />
                  </div>
                  <h2 className="text-sm font-bold text-[#081D36]">Payment Details</h2>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    details.paymentStatus === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                      : "bg-amber-50 text-amber-700 border border-amber-300"
                  }`}
                >
                  {details.paymentStatus === "success" ? "✓ Paid" : "● Payment Pending"}
                </span>
              </div>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <dt className="text-slate-500 font-medium text-[10.5px] uppercase tracking-wider">Registration Fee</dt>
                  <dd className="text-slate-900 font-bold text-sm">₹{details.registrationFee || "500.00"}</dd>
                </div>
                <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <dt className="text-slate-500 font-medium text-[10.5px] uppercase tracking-wider">Payment Status</dt>
                  <dd className={`${details.paymentStatus === "success" ? "text-emerald-600 font-bold" : "text-amber-600 font-semibold"} text-xs flex items-center gap-1.5`}>
                    {details.paymentStatus === "success" ? (
                      <>
                        <CheckCircle size={15} weight="fill" className="text-emerald-500" />
                        <span>Paid</span>
                      </>
                    ) : (
                      <span>Not Paid</span>
                    )}
                  </dd>
                </div>
                <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <dt className="text-slate-500 font-medium text-[10.5px] uppercase tracking-wider">Payment Gateway</dt>
                  <dd className="text-slate-800 font-medium text-xs">Stripe Checkout</dd>
                </div>
              </dl>
            </div>
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
          {details.paymentStatus !== "success" ? (
            <button
              type="button"
              disabled={showPayment}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={handlePayment}
            >
              <CreditCard size={18} weight="bold" />
              {showPayment ? "Redirecting..." : "Proceed to Online Payment"}
            </button>
          ) : (
            <div className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-[#10b981]/10 border border-[#10b981] text-[#10b981] text-sm font-bold">
              <CreditCard size={18} weight="bold" />
              Application Fee Paid Successfully
            </div>
          )}
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
            Please contact administration if you face any issues during the payment process.
          </p>
        </footer>
      </div>
    </section>
  );
}
