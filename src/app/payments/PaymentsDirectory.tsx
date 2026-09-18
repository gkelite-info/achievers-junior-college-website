"use client";

import { useRef, useState } from "react";
import ApplicationSummary from "../apply/ApplicationSummary";
import { applicants } from "./sampleApplicants";
import { useRouter } from "next/navigation";
import styles from "./PaymentsDirectory.module.css";
import ApplicationLookupModal from "./ApplicationLookupModal";



export default function PaymentsDirectory() {
  const router = useRouter();
  const [selected, setSelected] = useState<Record<string, string> | null>(null);

  const [lookup, setLookup] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lastView = useRef<HTMLButtonElement | null>(null);

  function download() {
    if (!selected) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(selected, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selected.applicationId}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <div className={styles.page}>
    <section className={styles.directory} hidden={selected !== null} aria-labelledby="payments-heading">
      <div className={styles.header}><div><p className={styles.eyebrow}>Admissions & Payments</p><h1 id="payments-heading">View Your Application</h1><p>Enter your application or mobile number and date of birth to view your details and proceed to payment.</p></div></div>
      <button ref={lastView} type="button" className={styles.lookupButton} onClick={() => setLookup("")}>View Application</button>
    </section>
    {selected && <ApplicationSummary key={selected.applicationId} details={selected} attachments={{ profileImage: "/sample-student-profile.png" }} headingRef={headingRef} onBack={() => { setSelected(null); requestAnimationFrame(() => lastView.current?.focus()); }} onEdit={() => router.push(`/apply?application=${encodeURIComponent(selected.applicationId)}`)} onDownload={download} backLabel="Back to Payments" />}
    {lookup !== null && <ApplicationLookupModal applicants={applicants} initialApplicationNumber={lookup} onClose={() => setLookup(null)} onMatch={(person) => { setLookup(null); setSelected(person); }} />}
  </div>;
}
