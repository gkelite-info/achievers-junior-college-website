import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { recordSessionPayment } from "@/lib/helpers/processStripePayment";
import { pool } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";
import { createHash, createHmac } from "crypto";
import type { FullApplicationData } from "@/lib/helpers/applicationsAPI";

function secret() {
  const key = process.env.APPLICATION_COOKIE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  return key || "ajc_secure_application_fallback_key";
}

function cookieName(applicationNumber: string) {
  return `ajc_application_${createHash("sha256").update(applicationNumber).digest("hex").slice(0, 24)}`;
}

function signature(applicationNumber: string, expires: string) {
  return createHmac("sha256", secret()).update(`${applicationNumber}:${expires}`).digest("hex");
}

function grantApplicationAccess(response: NextResponse, applicationNumber: string) {
  const maxAge = 30 * 24 * 60 * 60;
  const expires = String(Date.now() + maxAge * 1000);
  response.cookies.set(cookieName(applicationNumber), `${expires}.${signature(applicationNumber, expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/applications",
    maxAge,
  });
}

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found in Stripe" }, { status: 404 });
    }

    const isPaid = session.payment_status === "paid" || session.status === "complete";
    if (isPaid) {
      await recordSessionPayment(session);
    }

    const applicationNumber = session.metadata?.applicationNumber;
    if (!applicationNumber) {
      return NextResponse.json({
        verified: isPaid,
        status: session.payment_status,
      });
    }

    const client = await pool.connect();
    let fullApplication: FullApplicationData | null = null;
    try {
      const userRes = await client.query(
        `SELECT *, to_char("dateOfBirth", 'YYYY-MM-DD') AS "dateOfBirth" FROM public.users
         WHERE "applicationNumber" = $1 AND is_deleted = false AND "deletedAt" IS NULL LIMIT 1`,
        [applicationNumber]
      );
      if (userRes.rows[0]) {
        const user = userRes.rows[0];
        const eduRes = await client.query(
          `SELECT * FROM public.user_education WHERE "userId" = $1 AND is_deleted = false AND "deletedAt" IS NULL LIMIT 1`,
          [user.userId]
        );
        fullApplication = {
          user,
          education: eduRes.rows[0] || null,
        };
      }
    } finally {
      client.release();
    }

    if (fullApplication) {
      const attachments: { profileImage?: string; classXCertificate?: string } = {};
      const supabase = getSupabaseServer();
      if (supabase) {
        for (const [kind, path] of [
          ["profileImage", fullApplication.user.profileImageRef],
          ["classXCertificate", fullApplication.education?.certificateRef],
        ] as const) {
          if (!path) continue;
          try {
            const { data } = await supabase.storage.from("application-documents").createSignedUrl(path, 3600);
            if (data?.signedUrl) {
              attachments[kind as keyof typeof attachments] = data.signedUrl;
            }
          } catch (e) {
            console.error("Could not sign URL for attachment:", e);
          }
        }
      }
      fullApplication.attachments = attachments;
    }

    const response = NextResponse.json({
      verified: isPaid,
      status: session.payment_status,
      applicationNumber,
      application: fullApplication,
    });

    if (applicationNumber) {
      grantApplicationAccess(response, applicationNumber);
    }

    return response;
  } catch (error: any) {
    console.error("Error in verify-session API:", error);
    return NextResponse.json({ error: error.message || "Failed to verify session" }, { status: 500 });
  }
}
