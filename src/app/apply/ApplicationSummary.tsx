import Image from "next/image";
import { ArrowLeft } from "@phosphor-icons/react";
import { useEffect, useState, type RefObject } from "react";
import styles from "./ApplicationSummary.module.css";
import PaymentPreview from "./PaymentPreview";

type Props = {
  details: Record<string, string>;
  attachments: Record<string, string>;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onEdit: () => void;
  onBack?: () => void;
  onDownload: () => void;
  backLabel?: string;
};

export default function ApplicationSummary({ details, attachments, headingRef, onEdit, onBack, onDownload, backLabel = "Back to Edit" }: Props) {
  const [showPayment, setShowPayment] = useState(false);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (!showPayment) headingRef.current?.focus({ preventScroll: true });
  }, [showPayment, headingRef]);
  const fullName = [details.firstName, details.lastName].filter(Boolean).join(" ") || "Student Name";
  function detail(label: string, key: string) {
    return <div key={key}><dt>{label}</dt><dd>{details[key] || "—"}</dd></div>;
  }

  if (showPayment) return <PaymentPreview onClose={() => setShowPayment(false)} applicantName={fullName} orderId={details.applicationId} amount={details.registrationFee} />;

  return <section className={styles.summary} aria-labelledby="review-heading">
    <button type="button" className={styles.back} onClick={onBack || onEdit} aria-label={backLabel} title={backLabel}><ArrowLeft size={26} aria-hidden="true" /></button>
    <p className={styles.notice} role="status">Your application details are ready for review. Submission is pending.</p>
    <div className={styles.card}>
      <h1 className={styles.heading} id="review-heading" ref={headingRef} tabIndex={-1}>Intermediate Application Pending</h1>
      <div className={styles.columns}>
        <div className={styles.profile}>
          {attachments.profileImage && <Image src={attachments.profileImage} alt={`${fullName}'s profile`} width={180} height={210} unoptimized className={styles.photo} />}
          <p className={styles.name}>{fullName}</p>
          <p className={styles.email}>{details.email || "Email not provided"}</p>
        </div>
        <div className={styles.personal}>
          <h2>Personal Details</h2>
          <dl className={styles.details}>
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
          <h2 className={styles.paymentHeading}>Payment Details</h2>
          <dl className={styles.details}>
            <div><dt>Fees</dt><dd>₹{details.registrationFee}</dd></div>
            <div><dt>Payment Status</dt><dd>Not Paid</dd></div>
          </dl>
        </div>
        <div className={styles.contact}>
          <h2>Contact Details</h2>
          <dl className={styles.contactDetails}>
            {detail("Email ID", "email")}
            {detail("Mobile Number", "phone")}
            {detail("Postal Address", "address")}
            {detail("City", "city")}
            {detail("State", "state")}
            {detail("Postcode", "pinCode")}
          </dl>
        </div>
      </div>
      <section className={styles.education} aria-labelledby="education-summary-heading">
        <h2 id="education-summary-heading">Education Details</h2>
        <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Education details table">
          <table>
            <thead><tr>{["Class", "School", "Board", "Year", "Grade/Percentage (%)", "Medium", "Certificate"].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead>
            <tbody>{["IX", "X"].map((level) => <tr key={level}>
              <th scope="row">{level}</th>
              {["School", "Board", "Year", "Percentage", "Medium"].map((field) => <td key={field}>{details[`class${level}${field}`] ? `${details[`class${level}${field}`]}${field === "Percentage" ? "%" : ""}` : "—"}</td>)}
              <td>{attachments[`class${level}Certificate`] ? <a href={attachments[`class${level}Certificate`]} target="_blank" rel="noopener noreferrer">{details[`class${level}Certificate`]}</a> : details[`class${level}Certificate`] || "—"}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>
      <footer className={styles.footer}>
        <button type="button" className={styles.pay} onClick={() => setShowPayment(true)}>Proceed to Online Payment</button>
        <div className={styles.secondaryActions}><button type="button" onClick={onEdit}>Back to Edit Details</button><button type="button" onClick={onDownload}>Download Application Details</button></div>
        <p className={styles.note}>UI preview with sample details. No application is submitted and no payment is collected.</p>
      </footer>
    </div>
  </section>;
}
