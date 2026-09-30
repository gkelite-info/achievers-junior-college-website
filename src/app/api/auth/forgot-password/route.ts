import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { sendPasswordResetOTPEmail } from "@/lib/helpers/emailService";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const body = await request.json().catch(() => null);

  // ACTION 1: REQUEST OTP (10 minutes expiry, exactly as in payments tab)
  if (action === "request_otp") {
    const rawEmail = typeof body?.email === "string" ? body.email.trim() : "";
    if (!rawEmail) {
      return NextResponse.json({ error: "Please enter your registered email address." }, { status: 400 });
    }
    const email = rawEmail.toLowerCase();

    try {
      // 1. Check if user exists in public.auth_users or auth.users
      const userRes = await pool.query(
        `SELECT "authUserId", "firstName", "lastName", email FROM public.auth_users 
         WHERE LOWER(email) = $1 AND "isActive" = true LIMIT 1`,
        [email]
      );

      let name = "Admin";
      if (userRes.rows[0]) {
        name = `${userRes.rows[0].firstName} ${userRes.rows[0].lastName}`.trim();
      } else {
        const authUserRes = await pool.query(
          `SELECT id, email FROM auth.users WHERE LOWER(email) = $1 LIMIT 1`,
          [email]
        );
        if (!authUserRes.rows[0]) {
          return NextResponse.json(
            { error: "No account found with this email address. Please check and try again." },
            { status: 404 }
          );
        }
      }

      // 2. Generate 6-digit OTP and 10 minutes expiry
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // 3. Store OTP in public.application_otps and track previous codes
      const appKey = `AUTH_RESET_${email}`;
      await pool.query(
        `INSERT INTO public.application_otps ("applicationNumber", email, otp, "expiresAt", "createdAt", "previousOtps") 
         VALUES ($1, $2, $3, $4, NOW(), '{}')
         ON CONFLICT ("applicationNumber")
         DO UPDATE SET 
           "previousOtps" = array_append(COALESCE(public.application_otps."previousOtps", '{}'), public.application_otps.otp),
           otp = EXCLUDED.otp, 
           "expiresAt" = EXCLUDED."expiresAt", 
           "createdAt" = NOW()`,
        [appKey, email, otp, expiresAt]
      );

      // 4. Send email via Resend
      const sent = await sendPasswordResetOTPEmail(email, otp, name);
      if (!sent) {
        return NextResponse.json(
          { error: "Unable to deliver OTP email. Please try again in a few moments." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: "OTP sent successfully" });
    } catch (err: unknown) {
      console.error("Error generating password reset OTP:", err);
      return NextResponse.json({ error: "Failed to generate OTP. Please try again." }, { status: 500 });
    }
  }

  // ACTION 2: VERIFY OTP
  if (action === "verify_otp") {
    const rawEmail = typeof body?.email === "string" ? body.email.trim() : "";
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";

    if (!rawEmail || !otp) {
      return NextResponse.json({ error: "Email and OTP are required." }, { status: 400 });
    }
    const email = rawEmail.toLowerCase();
    const appKey = `AUTH_RESET_${email}`;

    try {
      const result = await pool.query(
        `SELECT otp, ("expiresAt" <= NOW()) AS "isExpired", "previousOtps"
         FROM public.application_otps
         WHERE "applicationNumber" = $1
         LIMIT 1`,
        [appKey]
      );

      if (!result.rows[0]) {
        return NextResponse.json({ error: "No OTP requested. Please request a new OTP to continue." }, { status: 400 });
      }

      if (result.rows[0].otp === otp) {
        if (result.rows[0].isExpired) {
          return NextResponse.json({ error: "OTP has expired. It was valid for 10 minutes. Please request a new OTP." }, { status: 400 });
        }
        return NextResponse.json({ success: true, message: "OTP verified successfully." });
      }

      // Check if user entered an earlier OTP that was superseded when requesting a new one
      const prevOtps: string[] = result.rows[0].previousOtps || [];
      if (prevOtps.includes(otp)) {
        return NextResponse.json({
          error: "This OTP has expired because a new code was requested. Please enter the latest OTP sent to your email."
        }, { status: 400 });
      }

      if (result.rows[0].isExpired) {
        return NextResponse.json({ error: "OTP has expired. It was valid for 10 minutes. Please request a new OTP." }, { status: 400 });
      }

      return NextResponse.json({ error: "Invalid OTP. Please check the code sent to your email." }, { status: 400 });
    } catch (err: unknown) {
      console.error("Error verifying password reset OTP:", err);
      return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
    }
  }

  // ACTION 3: RESET PASSWORD
  if (action === "reset_password") {
    const rawEmail = typeof body?.email === "string" ? body.email.trim() : "";
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!rawEmail || !otp || !newPassword) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    const email = rawEmail.toLowerCase();
    const appKey = `AUTH_RESET_${email}`;

    try {
      // Re-verify OTP validity
      const result = await pool.query(
        `SELECT otp, ("expiresAt" <= NOW()) AS "isExpired"
         FROM public.application_otps
         WHERE "applicationNumber" = $1
         LIMIT 1`,
        [appKey]
      );

      if (!result.rows[0] || result.rows[0].isExpired || result.rows[0].otp !== otp) {
        return NextResponse.json({ error: "Your session has expired. Please request a new OTP." }, { status: 400 });
      }

      // Find user id in auth.users
      const authUserRes = await pool.query(
        `SELECT id FROM auth.users WHERE LOWER(email) = $1 LIMIT 1`,
        [email]
      );

      if (!authUserRes.rows[0]) {
        return NextResponse.json({ error: "User not found in authentication system." }, { status: 404 });
      }
      const userId = authUserRes.rows[0].id;

      // Update password via Supabase Admin (Service Role)
      const supabaseAdmin = createClient(
        process.env.SUPABASE_URL || "https://mzbctopjpftwnkqpuqhf.supabase.co",
        process.env.SUPABASE_SERVICE_ROLE_KEY || "",
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      // Delete the used OTP
      await pool.query(`DELETE FROM public.application_otps WHERE "applicationNumber" = $1`, [appKey]);

      return NextResponse.json({ success: true, message: "Password updated successfully!" });
    } catch (err: unknown) {
      console.error("Error resetting password:", err);
      return NextResponse.json({ error: "Failed to reset password. Please try again." }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}
