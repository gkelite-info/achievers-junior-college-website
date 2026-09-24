import { Resend } from "resend";


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
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Achievers Junior College <noreply@achieversjuniorcollege.in>',
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

export async function sendOTPEmail(email: string, otp: string, name: string) {
  if (!email) {
    console.warn("No email provided for OTP.");
    return false;
  }

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
      <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0047A9 0%, #081D36 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;">Achievers Junior College</h1>
          <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 16px;">Verify Your Email Address</p>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px; color: #334155; line-height: 1.6;">
          <p style="font-size: 18px; margin-top: 0;">Dear <strong>${name}</strong>,</p>
          
          <p style="font-size: 16px;">You requested to view your application at Achievers Junior College. Please use the One-Time Password (OTP) below to verify your email address and access your application details.</p>
          
          <!-- Callout Box -->
          <div style="background-color: #f1f5f9; border-left: 4px solid #0047A9; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Your OTP</p>
            <p style="margin: 8px 0 0 0; font-size: 32px; font-weight: 800; color: #0047A9; letter-spacing: 4px;">${otp}</p>
          </div>
          
          <p style="font-size: 16px;">This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
          
          <p style="font-size: 16px; margin-bottom: 0;">If you did not request this, please ignore this email.</p>
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
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Achievers Junior College <noreply@achieversjuniorcollege.in>',
      to: email,
      subject: "Your OTP for Application Access - Achievers Junior College",
      html: htmlContent,
    });

    if (error) {
      console.error("Resend error sending OTP email: ", error);
      return false;
    }

    console.log("OTP email sent via Resend: %s", data?.id);
    return true;
  } catch (error) {
    console.error("Unexpected error sending OTP email: ", error);
    return false;
  }
}

export type PaymentEmailOptions = {
  email: string;
  name: string;
  applicationNumber: string;
  amount: string | number;
  transactionId: string;
  course?: string;
  date?: string;
};

export async function sendPaymentSuccessEmail({
  email,
  name,
  applicationNumber,
  amount,
  transactionId,
  course,
  date,
}: PaymentEmailOptions) {
  if (!email) {
    console.warn("No email provided for payment confirmation.");
    return false;
  }

  const courseCode = course ? getCourseCode(course) : "";
  const courseDisplay = courseCode ? `${course} (${courseCode})` : course || "Intermediate";
  const formattedDate =
    date ||
    new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
  const formattedAmount = typeof amount === "number" ? amount.toFixed(2) : String(amount);

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
      <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0047A9 0%, #081D36 100%); padding: 32px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">Achievers Junior College</h1>
          <div style="display: inline-block; margin-top: 12px; padding: 6px 14px; background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 20px;">
            <p style="color: #6ee7b7; margin: 0; font-size: 13px; font-weight: 600; letter-spacing: 0.3px;">✓ Payment Successful</p>
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 36px 30px; color: #334155; line-height: 1.6;">
          <p style="font-size: 18px; margin-top: 0; color: #0f172a;">Dear <strong>${name}</strong>,</p>
          
          <p style="font-size: 15px; color: #475569;">
            We have successfully received your payment of <strong style="color: #0f172a;">₹${formattedAmount}</strong> for your admission application fee at Achievers Junior College.
          </p>

          <!-- Receipt Details Card -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px; margin: 26px 0;">
            <p style="margin: 0 0 16px 0; font-size: 14px; color: #0047A9; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
              Transaction Receipt
            </p>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 45%;">Application Number:</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 700; font-family: monospace;">${applicationNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Course:</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${courseDisplay}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Transaction ID:</td>
                <td style="padding: 8px 0; color: #0f172a; font-family: monospace; font-size: 13px; word-break: break-all;">${transactionId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Amount Paid:</td>
                <td style="padding: 8px 0; color: #059669; font-weight: 800; font-size: 16px;">₹${formattedAmount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Payment Status:</td>
                <td style="padding: 8px 0; color: #059669; font-weight: 700;">Paid (Confirmed)</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Date & Time:</td>
                <td style="padding: 8px 0; color: #0f172a;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Payment Method:</td>
                <td style="padding: 8px 0; color: #0f172a;">Online Payment (Stripe)</td>
              </tr>
            </table>
          </div>

          <!-- Note -->
          <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px 18px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; font-size: 14px; color: #065f46; font-weight: 500;">
              Your application is now marked as <strong>Paid</strong> and has been forwarded to our admissions committee for review.
            </p>
          </div>

          <p style="font-size: 15px; color: #475569;">
            You can view your complete application summary, payment receipt, and track your admission status anytime on our website using your application number and registered email.
          </p>

          <p style="font-size: 15px; margin-bottom: 0; color: #475569;">
            If you have any questions or require assistance, feel free to contact our admissions office.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 22px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 600;">Admissions & Finance Office</p>
          <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">Achievers Junior College</p>
        </div>

      </div>
    </div>
  `;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Achievers Junior College <noreply@achieversjuniorcollege.in>',
      to: email,
      subject: `Payment Successful - Application ${applicationNumber} | Achievers Junior College`,
      html: htmlContent,
    });

    if (error) {
      console.error("Resend error sending payment success email: ", error);
      return false;
    }

    console.log("Payment success email sent via Resend: %s", data?.id);
    return true;
  } catch (error) {
    console.error("Unexpected error sending payment success email: ", error);
    return false;
  }
}

