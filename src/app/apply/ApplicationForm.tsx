"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { ArrowRight, BookOpen, CalendarBlank, CurrencyInr, EnvelopeSimple, FileText, FloppyDisk, Globe, GraduationCap, ImageSquare, MapPin, Phone, User, UsersThree, ArrowCounterClockwise } from "@phosphor-icons/react";
import styles from "./ApplicationForm.module.css";
import ApplicationSummary from "./ApplicationSummary";
import Image from "next/image";
import { withDemoDefaults } from "./demoApplication";

const draftKey = "achievers-application-draft-v1";
const courses = ["MPC", "BiPC", "MEC", "CEC", "ACE"];

function Field({ label, icon, children, wide = false }: { label: string; icon: ReactNode; children: ReactNode; wide?: boolean }) {
  return <label className={`${styles.field} ${wide ? styles.wide : ""}`}><span>{label}: <b>*</b></span><span className={styles.control}><span className={styles.icon} aria-hidden="true">{icon}</span>{children}</span></label>;
}

function Select({ name, placeholder, options }: { name: string; placeholder: string; options: string[] }) {
  return <select name={name} required defaultValue=""><option value="" disabled>{placeholder}</option>{options.map((option) => <option key={option}>{option}</option>)}</select>;
}

function validateFile(event: ChangeEvent<HTMLInputElement>, type: "image/jpeg" | "application/pdf") {
  const input = event.currentTarget;
  const file = input.files?.[0];
  const extension = type === "image/jpeg" ? /\.jpe?g$/i : /\.pdf$/i;
  input.setCustomValidity(file && (!extension.test(file.name) || (file.type && file.type !== type)) ? `Choose a ${type === "image/jpeg" ? "JPG image" : "PDF certificate"}.` : file && file.size > 5 * 1024 * 1024 ? "Choose a file smaller than 5 MB." : "");
  input.reportValidity();
}

export default function ApplicationForm({ startAtSummary = false, initialDetails }: { startAtSummary?: boolean; initialDetails?: Record<string, string> }) {
  const form = useRef<HTMLFormElement>(null);
  const reviewHeading = useRef<HTMLHeadingElement>(null);
  const [status, setStatus] = useState("");
  const [review, setReview] = useState<Record<string, string> | null>(() => startAtSummary ? withDemoDefaults({}) : null);
  const [attachments, setAttachments] = useState<Record<string, string>>((): Record<string, string> => startAtSummary ? { profileImage: "/sample-student-profile.png" } : {});
  const attachmentUrls = useRef<string[]>([]);

  useEffect(() => () => { attachmentUrls.current.forEach((url) => URL.revokeObjectURL(url)); }, []);

  useEffect(() => {
    try {
      const saved = initialDetails ? null : localStorage.getItem(draftKey);
      if ((!initialDetails && !saved) || !form.current) return;
      const values: unknown = initialDetails || JSON.parse(saved!);
      if (!values || typeof values !== "object" || Array.isArray(values)) return;
      for (const [name, value] of Object.entries(values)) {
        if (typeof value !== "string") continue;
        const input = form.current.elements.namedItem(name);
        if (input instanceof RadioNodeList) input.value = value;
        else if (input instanceof HTMLInputElement && input.type !== "file" && !input.readOnly) input.value = value;
        else if (input instanceof HTMLSelectElement || input instanceof HTMLTextAreaElement) input.value = value;
      }
    } catch { /* The form remains usable when browser storage is unavailable. */ }
  }, [initialDetails]);

  useEffect(() => {
    if (review) {
      reviewHeading.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [review]);

  function values() {
    const result: Record<string, string> = {};
    if (!form.current) return result;
    new FormData(form.current).forEach((value, name) => { if (typeof value === "string") result[name] = value; });
    return result;
  }

  function saveDraft() {
    try {
      localStorage.setItem(draftKey, JSON.stringify(values()));
      setStatus("Draft saved on this browser. Reattach your profile image and certificates when you return.");
    } catch { setStatus("The draft could not be saved in this browser. Keep this page open to retain your details."); }
  }

  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const details = { ...initialDetails, ...values() };
    attachmentUrls.current.forEach((url) => URL.revokeObjectURL(url));
    attachmentUrls.current = [];
    const files: Record<string, string> = {};
    new FormData(event.currentTarget).forEach((value, name) => {
      if (value instanceof File && value.size > 0) {
        details[name] = value.name;
        files[name] = URL.createObjectURL(value);
        attachmentUrls.current.push(files[name]);
      }
    });
    setAttachments({ profileImage: "/sample-student-profile.png", ...files });
    try { localStorage.setItem(draftKey, JSON.stringify(values())); } catch { /* Review does not require browser storage. */ }
    setReview(withDemoDefaults(details));
  }

  function reset() {
    try { localStorage.removeItem(draftKey); } catch { /* Reset the visible form even without storage. */ }
    form.current?.reset();
    form.current?.querySelectorAll<HTMLInputElement>('input[type="file"]').forEach((input) => input.setCustomValidity(""));
    setReview(null);
    setStatus("Application form reset.");
  }

  function download() {
    const blob = new Blob([JSON.stringify(review, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "achievers-application.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className={styles.page}>
      <section className={styles.panel} aria-labelledby="application-heading" hidden={review !== null}>
        <header className={styles.header}>
          <span className={styles.badge}><FileText size={27} aria-hidden="true" /></span>
          <div><h1 id="application-heading">Intermediate Application Form</h1><p>Fill in your details carefully. All fields marked with <b>*</b> are required.</p></div>
        </header>

        <form ref={form} onSubmit={next} hidden={review !== null}>
          {initialDetails && <div className="mb-6 flex items-center gap-4 rounded-lg border border-[#dce3ed] bg-white p-4"><Image src="/sample-student-profile.png" alt="Current student profile" width={60} height={75} className="rounded object-contain" /><div className="text-xs leading-6"><p className="font-semibold">Editing {initialDetails.firstName} {initialDetails.lastName} ? {initialDetails.applicationId}</p><p>Current certificates: {initialDetails.classIXCertificate}, {initialDetails.classXCertificate}</p><p>Choose new files below only if you want to replace them.</p></div></div>}
          <h2 className={styles.sectionTitle}><FileText size={15} aria-hidden="true" />Personal Details</h2>
          <div className={styles.grid}>
            <Field label="Application For" icon={<GraduationCap />}><Select name="applicationFor" placeholder="Select Application For" options={["Intermediate First Year", "Intermediate Second Year"]} /></Field>
            <Field label="Course" icon={<BookOpen />}><Select name="course" placeholder="Select Course" options={courses} /></Field>
            <Field label="First Name" icon={<User />}><input name="firstName" autoComplete="given-name" placeholder="Enter first name" maxLength={100} required /></Field>
            <Field label="Last Name" icon={<User />}><input name="lastName" autoComplete="family-name" placeholder="Enter last name" maxLength={100} required /></Field>
            <Field label="Father’s Name" icon={<User />}><input name="fatherName" placeholder="Enter father’s name" maxLength={150} required /></Field>
            <Field label="Mother’s Name" icon={<User />}><input name="motherName" placeholder="Enter mother’s name" maxLength={150} required /></Field>
            <fieldset className={styles.gender}><legend>Gender: <b>*</b></legend><div>{["Female", "Male", "Other"].map((gender) => <label key={gender}><input type="radio" name="gender" value={gender} defaultChecked={gender === "Female"} required />{gender}</label>)}</div></fieldset>
            <Field label="Date of Birth" icon={<CalendarBlank />}><input name="dateOfBirth" type="date" autoComplete="bday" required onChange={(event) => { event.currentTarget.setCustomValidity(event.currentTarget.valueAsNumber > Date.now() ? "Date of birth cannot be in the future." : ""); }} /></Field>
            <Field label="Nationality" icon={<Globe />}><Select name="nationality" placeholder="Select Nationality" options={["Indian", "Other"]} /></Field>
            <Field label="Category" icon={<UsersThree />}><Select name="category" placeholder="Select Category" options={["General", "EWS", "OBC", "SC", "ST", "Other"]} /></Field>
            <Field label="Postal Address" icon={<MapPin />} wide><textarea name="address" autoComplete="street-address" placeholder="Enter your complete address" rows={2} required maxLength={500} /></Field>
            <Field label="State" icon={<BookOpen />}><input name="state" autoComplete="address-level1" list="application-states" placeholder="Select State" required /><datalist id="application-states">{["Telangana", "Andhra Pradesh", "Karnataka", "Tamil Nadu", "Maharashtra", "Kerala", "Odisha", "Chhattisgarh"].map((state) => <option key={state} value={state} />)}</datalist></Field>
            <Field label="City" icon={<MapPin />}><input name="city" autoComplete="address-level2" placeholder="Enter city" required maxLength={100} /></Field>
            <Field label="Pin Code" icon={<MapPin />}><input name="pinCode" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="Enter pin code" title="Enter a six-digit pin code." required /></Field>
            <Field label="Contact No." icon={<Phone />}><input name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={20} placeholder="Enter contact number" required /></Field>
            <Field label="Email-id" icon={<EnvelopeSimple />}><input name="email" type="email" autoComplete="email" placeholder="Enter email address" required /></Field>
            <Field label="Profile Image (jpg only)" icon={<ImageSquare />}><input name="profileImage" type="file" accept=".jpg,.jpeg,image/jpeg" onChange={(event) => validateFile(event, "image/jpeg")} required={!initialDetails?.profileImage} /></Field>
            <Field label="Admission Registration Fee" icon={<CurrencyInr />}><input name="registrationFee" value="500" readOnly /></Field>
          </div>

          <h2 className={styles.sectionTitle}><BookOpen size={15} aria-hidden="true" />Educational Qualification</h2>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead><tr>{["Class", "School", "Board", "Year", "Grade/Percentage (%)", "Medium", "Certificate (pdf only)"].map((heading, i) => <th key={heading} scope="col">{heading}{i > 0 && <b> *</b>}</th>)}</tr></thead>
              <tbody>{["X", "IX"].map((level) => <tr key={level}>
                <th scope="row">{level}</th>
                <td><input name={`class${level}School`} aria-label={`Class ${level} school`} placeholder="Enter school" required /></td>
                <td><input name={`class${level}Board`} aria-label={`Class ${level} board`} placeholder="Enter board" required /></td>
                <td><input name={`class${level}Year`} aria-label={`Class ${level} passing year`} type="number" min={1980} max={new Date().getFullYear()} placeholder="YYYY" required /></td>
                <td><input name={`class${level}Percentage`} aria-label={`Class ${level} percentage`} type="number" min={0} max={100} step="0.01" placeholder="Enter %" required /></td>
                <td><select name={`class${level}Medium`} aria-label={`Class ${level} medium`} defaultValue="" required><option value="" disabled>Select</option>{["English", "Telugu", "Hindi", "Urdu", "Other"].map((medium) => <option key={medium}>{medium}</option>)}</select></td>
                <td><input name={`class${level}Certificate`} aria-label={`Class ${level} certificate`} type="file" accept=".pdf,application/pdf" onChange={(event) => validateFile(event, "application/pdf")} required={!initialDetails?.[`class${level}Certificate`]} /></td>
              </tr>)}</tbody>
            </table>
          </div>
          <div className={styles.actions}>
            <button type="button" onClick={reset} className={styles.reset}><ArrowCounterClockwise size={15} />Reset</button>
            <button type="button" onClick={saveDraft} className={styles.draft}><FloppyDisk size={15} />Save as Draft</button>
            <button type="submit" formNoValidate={process.env.NODE_ENV === "development"} className={styles.next}>Save and Next <ArrowRight size={16} /></button>
          </div>
          <p role="status" className={styles.status}>{status}</p>
        </form>

      </section>
      {review && <ApplicationSummary details={review} attachments={attachments} headingRef={reviewHeading} onEdit={() => setReview(null)} onDownload={download} />}
    </div>
  );
}
