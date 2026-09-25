import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { pool } from "@/lib/db";

// Initialize Resend
// Note: You must add RESEND_API_KEY to your .env.local
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

    const { getCourseCode } = await import("@/lib/helpers/emailService");

    const emailPayloads = recipients.map((recipient: any) => {
      const { emailId, firstName, lastName, applicationNumber, course } = recipient;

      const courseCode = getCourseCode(course);
      const courseDisplay = courseCode ? `${course} (${courseCode})` : course;

      let subject = "";
      let emailContent = "";

      const baseStyles = `font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #f9fafb; padding: 20px;`;
      const cardStyles = `background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);`;
      const headerStyles = `background: linear-gradient(135deg, #0047A9 0%, #081D36 100%); padding: 30px; text-align: center;`;
      const h1Styles = `color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;`;
      const bodyStyles = `padding: 40px 30px; color: #334155; line-height: 1.6;`;
      const footerStyles = `background-color: #f8fafc; padding: 24px 30px; border-top: 1px solid #e2e8f0; text-align: center;`;

      if (templateType === "congratulate") {
        subject = `Admission Selection Offer - ${applicationNumber}`;
        emailContent = `
          <div style="${baseStyles}">
            <div style="${cardStyles}">
              <div style="${headerStyles}">
                <h1 style="${h1Styles}">Achievers Junior College</h1>
                <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 16px;">Congratulations! Admission Offer</p>
              </div>
              <div style="${bodyStyles}">
                <p style="font-size: 18px; margin-top: 0;">Dear <strong>${firstName} ${lastName}</strong>,</p>
                <p style="font-size: 16px;">We are thrilled to inform you that you have been selected for admission into Achievers Junior College for the course <strong>${courseDisplay}</strong>.</p>
                <div style="background-color: #f1f5f9; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                  <p style="margin: 0; font-size: 14px; color: #64748b; text-transform: uppercase; font-weight: 600;">Your Application Number</p>
                  <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: 1px;">${applicationNumber}</p>
                </div>
                <p style="font-size: 16px;">Please complete your admission process by visiting the college campus with your original documents.</p>
                <p style="font-size: 16px; margin-bottom: 0;">Best Regards,<br/><strong>Admissions Team</strong><br/>Achievers Junior College</p>
              </div>
              <div style="${footerStyles}">
                <p style="margin: 0; color: #64748b; font-size: 14px; font-weight: 600;">Achievers Junior College</p>
              </div>
            </div>
          </div>
        `;
      } else if (templateType === "verification") {
        subject = `Document Verification Required - ${applicationNumber}`;
        emailContent = `
          <div style="${baseStyles}">
            <div style="${cardStyles}">
              <div style="${headerStyles}">
                <h1 style="${h1Styles}">Achievers Junior College</h1>
                <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 16px;">Document Verification Required</p>
              </div>
              <div style="${bodyStyles}">
                <p style="font-size: 18px; margin-top: 0;">Dear <strong>${firstName} ${lastName}</strong>,</p>
                <p style="font-size: 16px;">Your application for <strong>${courseDisplay}</strong> requires further document verification.</p>
                <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                  <p style="margin: 0; font-size: 14px; color: #854d0e; text-transform: uppercase; font-weight: 600;">Your Application Number</p>
                  <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: 800; color: #422006; letter-spacing: 1px;">${applicationNumber}</p>
                </div>
                <p style="font-size: 16px;">Please ensure all your submitted documents are clear and accurate. You may be contacted by our admissions team shortly for further verification steps.</p>
                <p style="font-size: 16px; margin-bottom: 0;">Best Regards,<br/><strong>Admissions Team</strong><br/>Achievers Junior College</p>
              </div>
              <div style="${footerStyles}">
                <p style="margin: 0; color: #64748b; font-size: 14px; font-weight: 600;">Achievers Junior College</p>
              </div>
            </div>
          </div>
        `;
      } else if (templateType === "regret") {
        subject = `Update on Application - ${applicationNumber}`;
        emailContent = `
          <div style="${baseStyles}">
            <div style="${cardStyles}">
              <div style="${headerStyles}">
                <h1 style="${h1Styles}">Achievers Junior College</h1>
                <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 16px;">Application Update</p>
              </div>
              <div style="${bodyStyles}">
                <p style="font-size: 18px; margin-top: 0;">Dear <strong>${firstName} ${lastName}</strong>,</p>
                <p style="font-size: 16px;">Thank you for applying to Achievers Junior College for <strong>${courseDisplay}</strong>.</p>
                <div style="background-color: #f1f5f9; border-left: 4px solid #94a3b8; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                  <p style="margin: 0; font-size: 14px; color: #64748b; text-transform: uppercase; font-weight: 600;">Your Application Number</p>
                  <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: 800; color: #334155; letter-spacing: 1px;">${applicationNumber}</p>
                </div>
                <p style="font-size: 16px;">We regret to inform you that we are unable to offer you admission at this time. We wish you the best in your future academic endeavors.</p>
                <p style="font-size: 16px; margin-bottom: 0;">Best Regards,<br/><strong>Admissions Team</strong><br/>Achievers Junior College</p>
              </div>
              <div style="${footerStyles}">
                <p style="margin: 0; color: #64748b; font-size: 14px; font-weight: 600;">Achievers Junior College</p>
              </div>
            </div>
          </div>
        `;
      } else {
        subject = `Application Update - ${applicationNumber}`;
        emailContent = `<p>Dear ${firstName}, an update has been made to your application ${applicationNumber} for ${courseDisplay}.</p>`;
      }

      return {
        from: process.env.RESEND_FROM_EMAIL || 'Achievers Junior College <noreply@achieversjuniorcollege.in>', // Since you have a paid account, we use a custom domain
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

    // Update the applications in the DB (public.users table)
    const applicationIds = recipients.map((r: any) => r.applicationId || r.applicationNumber).filter(Boolean);

    if (applicationIds.length > 0) {
      const client = await pool.connect();
      try {
        // We build a parameterized query for the IN clause
        const placeholders = applicationIds.map((_: any, index: number) => `$${index + 2}`).join(", ");
        const updateQuery = `
          UPDATE public.users 
          SET "admissionStatus" = $1, "updatedAt" = NOW() 
          WHERE "applicationNumber" IN (${placeholders}) OR "userId"::text IN (${placeholders})
        `;

        await client.query(updateQuery, [admissionStatus, ...applicationIds]);
      } catch (dbError) {
        console.error("Database update error:", dbError);
        return NextResponse.json({ error: "Emails sent but failed to update database status" }, { status: 500 });
      } finally {
        client.release();
      }
    }

    return NextResponse.json({ success: true, message: `Successfully processed ${emailPayloads.length} emails.` }, { status: 200 });

  } catch (error) {
    console.error("Bulk email error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
