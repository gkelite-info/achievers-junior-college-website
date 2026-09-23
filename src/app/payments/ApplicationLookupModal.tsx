import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "@phosphor-icons/react";
import { applicationToDetails, lookupApplication } from "@/lib/helpers/applicationsAPI";
import styles from "./ApplicationLookupModal.module.css";

type Props = {
  initialApplicationNumber: string;
  onClose: () => void;
  onMatch: (person: Record<string, string>) => void;
};

export default function ApplicationLookupModal({ initialApplicationNumber, onClose, onMatch }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    const application = String(data.get("applicationNumber") || "");
    const mobile = String(data.get("mobileNumber") || "");
    const dateOfBirth = String(data.get("dateOfBirth") || "");
    if (!application.trim() || !mobile.trim() || !dateOfBirth) {
      setError("Enter your application number, registered mobile number and date of birth.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const match = await lookupApplication(application, mobile, dateOfBirth);
      if (!match) {
        setError("No application matches all three details. Check your application number, mobile number and date of birth.");
        return;
      }
      onMatch(applicationToDetails(match));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to load the application.");
    } finally { setPending(false); }
  }

  return <dialog ref={dialog} className={styles.modal} aria-labelledby="lookup-title" aria-describedby="lookup-description" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <header className={styles.header}><h2 id="lookup-title">View Application</h2><button type="button" onClick={onClose} aria-label="Close application lookup"><X size={22} aria-hidden="true" /></button></header>
    <form className={styles.form} onSubmit={submit} noValidate onChange={() => setError("")}>
      <p id="lookup-description">Enter your application number, registered mobile number and date of birth.</p>
      <div className={styles.fields}>
        <label>Application Number<input name="applicationNumber" defaultValue={initialApplicationNumber} placeholder="Application#" autoComplete="off" /></label>
        <label>Mobile Number<input name="mobileNumber" type="tel" inputMode="tel" placeholder="Mobile#" autoComplete="tel" /></label>
        <label className={styles.date}>Date of Birth <span aria-hidden="true">*</span><input name="dateOfBirth" type="date" required autoComplete="bday" /></label>
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <p className={styles.hint}>Use the details from your saved application.</p>
      <div className={styles.actions}><button type="button" onClick={onClose}>Cancel</button><button type="submit" disabled={pending}>{pending ? "Loading..." : "Submit"}</button></div>
    </form>
  </dialog>;
}
