"use client";

import { useEffect, useRef, useState } from "react";
import ApplicationSummary from "../apply/ApplicationSummary";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./PaymentsDirectory.module.css";
import ApplicationLookupModal from "./ApplicationLookupModal";
import { toast } from "react-hot-toast";
import { applicationToDetails } from "@/lib/helpers/applicationsAPI";
import { SpinnerGap } from "@phosphor-icons/react";

export default function PaymentsDirectory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Record<string, string> | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  const [lookup, setLookup] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lastView = useRef<HTMLButtonElement | null>(null);

  const status = searchParams.get("status");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (status === "success" && sessionId) {
      setVerifyingPayment(true);
      toast.loading("Verifying your payment with Stripe...", { id: "payment-verify" });

      fetch(`/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.verified && data.application) {
            toast.success("Payment confirmed successfully! Your application fee is paid.", { id: "payment-verify" });
            setSelected(applicationToDetails(data.application));
          } else if (data.verified) {
            toast.success("Payment verified successfully!", { id: "payment-verify" });
          } else {
            toast.error("Payment could not be confirmed.", { id: "payment-verify" });
          }
        })
        .catch((err) => {
          console.error("Payment verification error:", err);
          toast.error("Failed to verify payment with Stripe.", { id: "payment-verify" });
        })
        .finally(() => {
          setVerifyingPayment(false);
          // Remove query params from address bar without reloading
          window.history.replaceState({}, "", "/payments");
        });
    } else if (status === "cancelled") {
      toast.error("Payment was cancelled. You can try again when you are ready.");
      window.history.replaceState({}, "", "/payments");
    }
  }, [status, sessionId]);

  function openLookup() {
    setLookup("");
  }

  function download() {
    if (!selected) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(selected, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selected.applicationId}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className={styles.page}>
      {verifyingPayment && (
        <div className="max-w-[800px] mx-auto my-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center gap-3 text-blue-900 font-medium text-sm shadow-sm animate-pulse">
          <SpinnerGap size={20} className="animate-spin text-[#0047A9]" />
          <span>Verifying your payment with Stripe and updating your application status...</span>
        </div>
      )}

      <section className={styles.directory} hidden={selected !== null} aria-labelledby="payments-heading">
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Admissions & Payments</p>
            <h1 id="payments-heading">Pay Fees or Check Status</h1>
            <p>
              Enter your application number and registered email address to verify with OTP and view your application or payment status.
            </p>
          </div>
        </div>
        <button ref={lastView} type="button" className={styles.lookupButton} onClick={openLookup}>
          View Application / Payment Status
        </button>
      </section>

      {selected && (
        <ApplicationSummary
          key={selected.applicationId}
          details={selected}
          attachments={{
            profileImage: selected.profilePreview || "",
            classXCertificate: selected.certificatePreview || "",
          }}
          headingRef={headingRef}
          onBack={() => {
            setSelected(null);
            requestAnimationFrame(() => lastView.current?.focus());
          }}
          onEdit={() => router.push(`/apply?application=${encodeURIComponent(selected.applicationId)}`)}
          onDownload={download}
          onDetailsChange={setSelected}
          backLabel="Back to Payments"
        />
      )}

      {lookup !== null && (
        <ApplicationLookupModal
          initialApplicationNumber={lookup}
          onClose={() => setLookup(null)}
          onMatch={(person) => {
            setLookup(null);
            setSelected(person);
          }}
        />
      )}
    </div>
  );
}
