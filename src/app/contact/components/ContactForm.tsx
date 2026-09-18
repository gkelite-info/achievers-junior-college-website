"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import styles from "./ContactForm.module.css";

const fieldClass = styles.field;

export default function ContactForm() {
  const [status, setStatus] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const subject = `${values.get("enquiry")} enquiry from ${values.get("name")}`;
    const body = `Name: ${values.get("name")}\nEmail: ${values.get("email")}\nPhone: ${values.get("phone")}\n\n${values.get("message")}`;
    window.location.href = `mailto:admissions@achieverscollege.edu.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus("Your email draft is ready to open. Send it from your email app to complete your enquiry. If it did not open, email admissions@achieverscollege.edu.in directly.");
  }
  return (
    <section aria-labelledby="message-heading" className={styles.panel}>
      <h2 id="message-heading" className={styles.heading}>Send Us a Message</h2>
      <p className={styles.description}>Fill out the form below and our team will get back to you shortly.</p>
      <form onSubmit={submit} className={styles.form} aria-describedby="email-draft-note">
        <div className={styles.grid}>
          <label className={styles.label}>Full Name <span className={styles.required}>*</span><input name="name" autoComplete="name" placeholder="Your full name" required maxLength={120} className={fieldClass} /></label>
          <label className={styles.label}>Email Address <span className={styles.required}>*</span><input name="email" type="email" autoComplete="email" placeholder="your@email.com" required maxLength={254} className={fieldClass} /></label>
          <label className={styles.label}>Phone Number <span className={styles.required}>*</span><input name="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" required minLength={7} maxLength={20} title="Enter a phone number with 7 to 20 characters." className={fieldClass} /></label>
          <label className={styles.label}>Select Enquiry <span className={styles.required}>*</span><select name="enquiry" required defaultValue="" className={fieldClass}><option value="" disabled>Choose an option</option><option>Admissions</option><option>Courses</option><option>Campus Visit</option><option>Alumni</option><option>Payments</option><option>General</option></select></label>
        </div>
        <label className={`${styles.label} ${styles.messageLabel}`}>Your Message <span className={styles.required}>*</span><textarea name="message" required maxLength={3000} rows={6} placeholder="Write your message here..." className={`${fieldClass} ${styles.message}`} /></label>
        <button type="submit" className={styles.submit}>Send Message <ArrowRight size={18} aria-hidden="true" /></button>
        <p id="email-draft-note" className="sr-only">Opens your email app with your message ready to send.</p>
        <p role="status" className={styles.status}>{status}</p>
      </form>
    </section>
  );
}
