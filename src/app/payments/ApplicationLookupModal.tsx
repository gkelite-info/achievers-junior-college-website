import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "@phosphor-icons/react";
import { findApplication } from "./applicationLookup";
import styles from "./ApplicationLookupModal.module.css";

type Props = {
  applicants: Record<string, string>[];
  initialApplicationNumber: string;
  onClose: () => void;
  onMatch: (person: Record<string, string>) => void;
};

export default function ApplicationLookupModal({ applicants, initialApplicationNumber, onClose, onMatch }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const element = dialog.current;
    function positionModal() {
      const headerBottom = document.querySelector("body > header")?.getBoundingClientRect().bottom ?? 68;
      const footerTop = document.querySelector("body > footer")?.getBoundingClientRect().top ?? window.innerHeight;
      element?.style.setProperty("--lookup-top", `${Math.max(12, headerBottom + 12)}px`);
      element?.style.setProperty("--lookup-bottom", `${Math.max(12, window.innerHeight - footerTop + 12)}px`);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    positionModal();
    element?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("resize", positionModal);
    return () => { window.removeEventListener("resize", positionModal); element?.close(); document.body.style.overflow = overflow; };
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const application = String(data.get("applicationNumber") || "");
    const mobile = String(data.get("mobileNumber") || "");
    const dateOfBirth = String(data.get("dateOfBirth") || "");
    if (!application.trim() && !mobile.trim() && !dateOfBirth && applicants[0]) {
      onMatch(applicants[0]);
      return;
    }
    if (!application.trim() && !mobile.trim()) {
      setError("Enter an application number or mobile number.");
      return;
    }
    const match = findApplication(applicants, application, mobile, dateOfBirth);
    if (!match) {
      setError("No application matches these details. Check the application or mobile number and date of birth.");
      return;
    }
    onMatch(match);
  }

  return <dialog ref={dialog} className={styles.modal} aria-labelledby="lookup-title" aria-describedby="lookup-description" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <header className={styles.header}><h2 id="lookup-title">View Application</h2><button type="button" onClick={onClose} aria-label="Close application lookup"><X size={22} aria-hidden="true" /></button></header>
    <form className={styles.form} onSubmit={submit} noValidate onChange={() => setError("")}>
      <p id="lookup-description">Enter your application number or mobile number and date of birth.</p>
      <div className={styles.fields}>
        <label>Application Number<input name="applicationNumber" defaultValue={initialApplicationNumber} placeholder="Application#" autoComplete="off" /></label>
        <label>Mobile Number<input name="mobileNumber" type="tel" inputMode="tel" placeholder="Mobile#" autoComplete="tel" /></label>
        <label className={styles.date}>Date of Birth <span aria-hidden="true">*</span><input name="dateOfBirth" type="date" required autoComplete="bday" /></label>
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <p className={styles.hint}>Leave all fields empty and Submit to preview sample details. Or use mobile 9000000000 and date of birth 18 June 2010.</p>
      <div className={styles.actions}><button type="button" onClick={onClose}>Cancel</button><button type="submit">Submit</button></div>
    </form>
  </dialog>;
}
