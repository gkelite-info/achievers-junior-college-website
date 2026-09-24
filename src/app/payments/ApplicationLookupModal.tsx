import { useEffect, useRef, useState, type FormEvent } from "react";
import { X, CheckCircle } from "@phosphor-icons/react";
import { toast } from "react-hot-toast";
import { applicationToDetails } from "@/lib/helpers/applicationsAPI";
import styles from "./ApplicationLookupModal.module.css";

type Props = {
  initialApplicationNumber: string;
  onClose: () => void;
  onMatch: (person: Record<string, string>) => void;
};

export default function ApplicationLookupModal({ initialApplicationNumber, onClose, onMatch }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<"lookup" | "otp">("lookup");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [appNumber, setAppNumber] = useState("");
  
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

  async function submitLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    const application = String(data.get("applicationNumber") || "");
    const emailValue = String(data.get("email") || "");
    
    if (!application.trim() || !emailValue.trim()) {
      setError("Enter your application number and registered email.");
      return;
    }
    
    setPending(true);
    setError("");
    
    try {
      // API call to request OTP will go here
      const res = await fetch("/api/applications?action=request_otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationNumber: application.trim(), email: emailValue.trim() })
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        setError(result.error || "Failed to generate OTP.");
        return;
      }
      
      setAppNumber(application.trim());
      setEmail(emailValue.trim());
      setStep("otp");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to request OTP.");
    } finally { 
      setPending(false); 
    }
  }

  async function submitOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    const otpValue = String(data.get("otp") || "");
    
    if (!otpValue.trim()) {
      setError("Enter the OTP sent to your email.");
      return;
    }
    
    setPending(true);
    setError("");
    
    try {
      // API call to verify OTP will go here
      const res = await fetch("/api/applications?action=verify_otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationNumber: appNumber, email, otp: otpValue.trim() })
      });
      
      const result = await res.json();
      
      if (!res.ok || !result.application) {
        setError(result.error || "Invalid or expired OTP.");
        return;
      }
      
      setIsVerified(true);
      toast.success("Successfully OTP verified!");
      setTimeout(() => {
        onMatch(applicationToDetails(result.application));
      }, 700);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to verify OTP.");
    } finally { 
      setPending(false); 
    }
  }

  return <dialog ref={dialog} className={styles.modal} aria-labelledby="lookup-title" aria-describedby="lookup-description" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <header className={styles.header}><h2 id="lookup-title">{step === "lookup" ? "View Application" : "Verify Email"}</h2><button type="button" onClick={onClose} aria-label="Close application lookup"><X size={22} aria-hidden="true" /></button></header>
    
    {step === "lookup" ? (
      <form key="lookup-form" className={styles.form} onSubmit={submitLookup} noValidate onChange={() => setError("")}>
        <p id="lookup-description">Enter your application number and registered email address.</p>
        <div className={styles.fields}>
          <label>Application Number<input name="applicationNumber" defaultValue={initialApplicationNumber} placeholder="Application#" autoComplete="off" /></label>
          <label>Email Address<input name="email" type="email" placeholder="Email Address" autoComplete="email" /></label>
        </div>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <p className={styles.hint}>Use the details from your saved application.</p>
        <div className={styles.actions}><button type="button" onClick={onClose}>Cancel</button><button type="submit" disabled={pending}>{pending ? "Loading..." : "Get OTP"}</button></div>
      </form>
    ) : (
      <form key="otp-form" className={styles.form} onSubmit={submitOtp} noValidate onChange={() => setError("")}>
        <p id="lookup-description">Enter the 6-digit OTP sent to {email}. It is valid for 10 minutes.</p>
        <div className={`${styles.fields} ${styles.otpField}`}>
          <label>One Time Password<input name="otp" type="text" inputMode="numeric" placeholder="Enter OTP" autoComplete="off" maxLength={6} disabled={isVerified} /></label>
        </div>
        {error && <p className={styles.error} role="alert">{error}</p>}
        {isVerified && (
          <div className={styles.success} role="status">
            <CheckCircle size={20} weight="fill" color="#10b981" />
            <span>Successfully OTP verified! Loading application...</span>
          </div>
        )}
        <div className={styles.actions}>
          <button type="button" disabled={pending || isVerified} onClick={() => { setStep("lookup"); setError(""); }}>Back</button>
          <button type="submit" disabled={pending || isVerified}>
            {isVerified ? "Verified ✓" : pending ? "Verifying..." : "Verify & View"}
          </button>
        </div>
      </form>
    )}
  </dialog>;
}
