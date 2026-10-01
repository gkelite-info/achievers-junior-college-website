import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { pool } from "@/lib/db";
import { supabase } from "@/lib/supabaseClient";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");

export async function POST(request: NextRequest) {
  try {
    const { recipients, templateType } = await request.json();

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: "No recipients provided" }, { status: 400 });
    }

    if (!templateType) {
      return NextResponse.json({ error: "Template type is required" }, { status: 400 });
    }

    const emailPayloads = recipients.map((recipient: any) => {
      const { emailId, firstName, lastName, applicationNumber } = recipient;

      let subject = "";
      let emailContent = "";

      const baseStyles = `font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #f9fafb; padding: 20px;`;
      const cardStyles = `background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);`;
      const headerStyles = `background: linear-gradient(135deg, #0047A9 0%, #081D36 100%); padding: 30px; text-align: center;`;
      const h1Styles = `color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;`;
      const bodyStyles = `padding: 40px 30px; color: #334155; line-height: 1.6;`;
      const footerStyles = `background-color: #f8fafc; padding: 24px 30px; border-top: 1px solid #e2e8f0; text-align: center;`;

      if (templateType === "verification") {
        subject = `Certificate Verification Schedule - ${applicationNumber}`;
        emailContent = `
          <div style="${baseStyles}">
            <div style="${cardStyles}">
              <div style="${headerStyles}">
                <h1 style="${h1Styles}">Achievers Junior College</h1>
                <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 16px;">Certificate Verification Schedule</p>
              </div>
              <div style="${bodyStyles}">
                <p style="font-size: 16px; margin-top: 0;">Dear <strong>${firstName} ${lastName}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6;">We have reviewed your application and would like to invite you for the physical verification of your certificates and documents as part of the admission process.</p>
                <p style="font-size: 16px; line-height: 1.6;">Please visit the campus between 10:00 AM and 4:00 PM on any working day.</p>
                <p style="font-size: 16px; margin-top: 30px; margin-bottom: 0;">Best regards,<br/><strong>Admissions Office</strong><br/>Achievers Junior College</p>
              </div>
              <div style="${footerStyles}">
                <p style="margin: 0; color: #64748b; font-size: 14px; font-weight: 600;">Achievers Junior College</p>
              </div>
            </div>
          </div>
        `;
      } else if (templateType === "congratulate") {
        subject = `Admission Selection Offer - ${applicationNumber}`;
        emailContent = `
          <div style="${baseStyles}">
            <div style="${cardStyles}">
              <div style="${headerStyles}">
                <h1 style="${h1Styles}">Achievers Junior College</h1>
                <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 16px;">Congratulations! Admission Offer</p>
              </div>
              <div style="${bodyStyles}">
                <p style="font-size: 16px; margin-top: 0;">Dear <strong>${firstName} ${lastName}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6;">Congratulations! We are pleased to inform you that you have been selected for admission at Achievers Junior College.</p>
                <p style="font-size: 16px; margin-top: 30px; margin-bottom: 0;">Best regards,<br/><strong>Admissions Office</strong><br/>Achievers Junior College</p>
              </div>
              <div style="${footerStyles}">
                <p style="margin: 0; color: #64748b; font-size: 14px; font-weight: 600;">Achievers Junior College</p>
              </div>
            </div>
          </div>
        `;
      } else if (templateType === "regret") {
        subject = `Admission Application Status Update - ${applicationNumber}`;
        emailContent = `
          <div style="${baseStyles}">
            <div style="${cardStyles}">
              <div style="${headerStyles}">
                <h1 style="${h1Styles}">Achievers Junior College</h1>
                <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 16px;">Application Status Update</p>
              </div>
              <div style="${bodyStyles}">
                <p style="font-size: 16px; margin-top: 0;">Dear <strong>${firstName} ${lastName}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6;">Thank you for your interest in Achievers Junior College. We regret to inform you that we are unable to offer you admission at this time.</p>
                <p style="font-size: 16px; margin-top: 30px; margin-bottom: 0;">Best regards,<br/><strong>Admissions Office</strong><br/>Achievers Junior College</p>
              </div>
              <div style="${footerStyles}">
                <p style="margin: 0; color: #64748b; font-size: 14px; font-weight: 600;">Achievers Junior College</p>
              </div>
            </div>
          </div>
        `;
      } else {
        subject = `Application Update - ${applicationNumber}`;
        emailContent = `<p>Dear ${firstName}, an update has been made to your application ${applicationNumber}.</p>`;
      }

      return {
        from: process.env.RESEND_FROM_EMAIL || 'Achievers Junior College <noreply@achieversjuniorcollege.in>',
        to: emailId,
        subject: subject,
        html: emailContent,
      };
    });

    // Send emails in batches of 100
    const BATCH_SIZE = 100;
    const errors = [];

    for (let i = 0; i < emailPayloads.length; i += BATCH_SIZE) {
      const chunk = emailPayloads.slice(i, i + BATCH_SIZE);
      const { data, error } = await resend.batch.send(chunk);
      if (error) {
        console.error("Resend batch error:", error);
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: "Failed to send some emails", details: errors }, { status: 500 });
    }

    // Map template to database status (strictly "Pending" | "Verification" | "Selected" | "Regret")
    let admissionStatus: "Pending" | "Verification" | "Selected" | "Regret" = "Pending";
    if (templateType === "congratulate") admissionStatus = "Selected";
    else if (templateType === "verification") admissionStatus = "Verification";
    else if (templateType === "regret") admissionStatus = "Regret";

    // Update the applications in the DB using applicationNumber (e.g., 'AJC-2026-0011')
    const appNumbers = recipients.map((r: any) => r.applicationNumber).filter(Boolean);

    if (appNumbers.length > 0) {
      // 1. Update via Supabase client (triggers Realtime subscriptions for UI update)
      try {
        const { error: sbError } = await supabase
          .from("users")
          .update({ admissionStatus, updatedAt: new Date().toISOString() })
          .in("applicationNumber", appNumbers);
        if (sbError) {
          console.error("Supabase admissionStatus update error:", sbError);
        }
      } catch (sbErr) {
        console.error("Supabase update exception:", sbErr);
      }

      // 2. Fallback update via pg pool
      try {
        const client = await pool.connect();
        try {
          const placeholders = appNumbers.map((_: any, index: number) => `$${index + 2}`).join(", ");
          const updateQuery = `
            UPDATE public.users 
            SET "admissionStatus" = $1, "updatedAt" = NOW() 
            WHERE "applicationNumber" IN (${placeholders})
          `;
          await client.query(updateQuery, [admissionStatus, ...appNumbers]);
        } finally {
          client.release();
        }
      } catch (dbError) {
        console.error("Database pool update error:", dbError);
      }
    }

    return NextResponse.json(
      { success: true, message: `Successfully processed ${emailPayloads.length} emails.`, admissionStatus },
      { status: 200 }
    );

  } catch (error) {
    console.error("Bulk email error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
