"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const enquiry = formData.get("enquiry") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !phone || !enquiry || !message) {
    return { success: false, error: "All fields are required" };
  }

  const subject = `${enquiry} enquiry from ${name}`;
  const htmlContent = `
    <h2>New Enquiry Received</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Enquiry Type:</strong> ${enquiry}</p>
    <br/>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, "<br/>")}</p>
  `;

  console.log("Starting email send process...");
  console.log("RESEND_API_KEY present:", !!process.env.RESEND_API_KEY);
  console.log("Form data:", { name, email, phone, enquiry, message });

  try {
    console.log("Calling Resend API...");
    const { data, error } = await resend.emails.send({
      from: `${name} via Website <noreply@achieversjuniorcollege.in>`,
      to: "achieversjnrcollege@gmail.com",
      subject: subject,
      html: htmlContent,
      replyTo: email,
    });

    console.log("Resend API response:", { data, error });

    if (error) {
      console.error("Resend returned an error:", error);
      return { success: false, error: error.message };
    }

    console.log("Email sent successfully! ID:", data?.id);
    return { success: true, data };
  } catch (error: any) {
    console.error("Caught an exception during email send:", error);
    return { success: false, error: error.message || "Failed to send email" };
  }
}
