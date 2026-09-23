import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export function getCourseCode(course: string): string {
  if (!course) return "";
  const lower = course.toLowerCase();
  if (lower.includes("biology")) return "BiPC";
  if (lower.includes("math") && lower.includes("phys") && lower.includes("chem")) return "MPC";
  if (lower.includes("math") && lower.includes("econ")) return "MEC";
  if (lower.includes("civics") && lower.includes("econ") && lower.includes("com")) return "CEC";
  if (lower.includes("hist") && lower.includes("econ") && lower.includes("civics")) return "HEC";
  return "";
}

export async function sendApplicationEmail(email: string, name: string, applicationNumber: string, course: string) {
  if (!email) {
    console.warn("No email provided for application.");
    return false;
  }

  const courseCode = getCourseCode(course);
  const courseDisplay = courseCode ? `${course} (${courseCode})` : course;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
      <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0047A9 0%, #081D36 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;">Achievers Junior College</h1>
          <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 16px;">Application Successfully Received</p>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px; color: #334155; line-height: 1.6;">
          <p style="font-size: 18px; margin-top: 0;">Dear <strong>${name}</strong>,</p>
          
          <p style="font-size: 16px;">Thank you for choosing Achievers Junior College! We are thrilled to inform you that your application for <strong>${courseDisplay}</strong> has been successfully saved in our system.</p>
          
          <!-- Callout Box -->
          <div style="background-color: #f1f5f9; border-left: 4px solid #0047A9; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; font-size: 14px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Your Application Number</p>
            <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: 1px;">${applicationNumber}</p>
          </div>
          
          <p style="font-size: 16px;">Please keep this application number safe, as you will need it for future reference and to track your payment status.</p>
          
          <p style="font-size: 16px; margin-bottom: 0;">If you have any questions, feel free to reply to this email or contact our admissions office.</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 24px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="margin: 0; color: #64748b; font-size: 14px; font-weight: 600;">Admissions Team</p>
          <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px;">Achievers Junior College</p>
        </div>

      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Achievers Junior College <noreply@gkeliteinfo.com>',
      to: email, 
      subject: "Thank You For Applying - Achievers Junior College",
      html: htmlContent,
    });

    if (error) {
      console.error("Resend error sending email: ", error);
      return false;
    }

    console.log("Application email sent via Resend: %s", data?.id);
    return true;
  } catch (error) {
    console.error("Unexpected error sending email: ", error);
    return false;
  }
}
