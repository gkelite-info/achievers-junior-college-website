"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import styles from "./ContactForm.module.css";
import { sendContactEmail } from "../actions";

const fieldClass = styles.field;

export default function ContactForm() {
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("Sending...");
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    try {
      const result = await sendContactEmail(formData);
      if (result.success) {
        setStatus("Your message has been sent successfully!");
        form.reset();
      } else {
        setStatus(result.error || "Failed to send message. Please try again.");
      }
    } catch (error) {
      setStatus("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
        <button type="submit" disabled={isSubmitting} className={styles.submit}>
          {isSubmitting ? "Sending..." : "Send Message"} <ArrowRight size={18} aria-hidden="true" />
        </button>
        <p id="email-draft-note" className="sr-only">Opens your email app with your message ready to send.</p>
        <p role="status" className={styles.status}>{status}</p>
      </form>
    </section>
  );
}
