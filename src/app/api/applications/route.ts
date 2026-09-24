// import { NextRequest, NextResponse } from "next/server";
// import { createHash, createHmac, timingSafeEqual } from "node:crypto";
// import { createClient } from "@supabase/supabase-js";
// import type { PoolClient } from "pg";
// import { pool } from "@/lib/db";
// import type { ApplicationInputPayload, FullApplicationData } from "@/lib/helpers/applicationsAPI";
// import { validateApplication } from "@/app/apply/validation";


// function getSupabaseServer() {
//   const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
//   const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
//   if (!url || !key) throw new Error("Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server before uploading application documents.");
//   return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
// }


// function secret() {
//   const key = process.env.APPLICATION_COOKIE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
//   if (!key) throw new Error("Application server credentials are not configured.");
//   return key;
// }

// function cookieName(applicationNumber: string) {
//   return `ajc_application_${createHash("sha256").update(applicationNumber).digest("hex").slice(0, 24)}`;
// }

// function signature(applicationNumber: string, expires: string) {
//   return createHmac("sha256", secret()).update(`${applicationNumber}:${expires}`).digest("hex");
// }

// function createApplicationNumber(submissionId: string) {
//   // The retry token must not be recoverable from the public application number.
//   const suffix = createHmac("sha256", secret()).update(`submission:${submissionId}`).digest("hex").slice(0, 24).toUpperCase();
//   return `AJC-INTER-${new Date().getFullYear()}-${suffix}`;
// }

// function canAccessApplication(request: NextRequest, applicationNumber: string) {
//   const value = request.cookies.get(cookieName(applicationNumber))?.value;
//   if (!value) return false;
//   const [expires, hash] = value.split(".");
//   if (!/^\d+$/.test(expires) || Number(expires) < Date.now() || !/^[a-f0-9]{64}$/.test(hash || "")) return false;
//   return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(signature(applicationNumber, expires), "hex"));
// }

// function grantApplicationAccess(response: NextResponse, applicationNumber: string) {
//   const maxAge = 30 * 24 * 60 * 60;
//   const expires = String(Date.now() + maxAge * 1000);
//   response.cookies.set(cookieName(applicationNumber), `${expires}.${signature(applicationNumber, expires)}`, {
//     httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/api/applications", maxAge,
//   });
// }


// const APPLICATION_BUCKET = "application-documents";
// const MAX_FILE_SIZE = 5 * 1024 * 1024;

// async function validateApplicationFile(file: File, kind: "profileImage" | "classXCertificate") {
//   const photo = kind === "profileImage";
//   const mime = photo ? "image/jpeg" : "application/pdf";
//   const extension = photo ? /\.jpe?g$/i : /\.pdf$/i;
//   const label = photo ? "Profile image" : "Class X certificate";
//   if (!file.size || file.size > MAX_FILE_SIZE) throw new Error(`${label} must be between 1 byte and 5 MB.`);
//   if (!extension.test(file.name) || (file.type && file.type !== mime)) throw new Error(`${label} must be a ${photo ? "JPG/JPEG" : "PDF"} file.`);
//   const bytes = new Uint8Array(await file.slice(0, 5).arrayBuffer());
//   const signatureMatches = photo
//     ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
//     : new TextDecoder().decode(bytes) === "%PDF-";
//   if (!signatureMatches) throw new Error(`${label} contents do not match the required file type.`);
// }

// async function uploadApplicationFile(file: File, applicationNumber: string, kind: "profileImage" | "classXCertificate") {
//   await validateApplicationFile(file, kind);
//   const path = `${applicationNumber}/${kind}-${crypto.randomUUID()}.${kind === "profileImage" ? "jpg" : "pdf"}`;
//   const { error } = await getSupabaseServer().storage.from(APPLICATION_BUCKET).upload(path, file, {
//     contentType: kind === "profileImage" ? "image/jpeg" : "application/pdf", upsert: false,
//   });
//   if (error) throw new Error(`Could not upload ${kind === "profileImage" ? "profile image" : "certificate"}. Check the application-documents bucket and server Storage configuration.`);
//   return path;
// }

// async function removeApplicationFiles(paths: string[]) {
//   if (!paths.length) return;
//   const { error } = await getSupabaseServer().storage.from(APPLICATION_BUCKET).remove(paths);
//   if (error) throw new Error("Application document cleanup failed.");
// }

// async function withApplicationAttachments(application: FullApplicationData): Promise<FullApplicationData> {
//   const attachments: NonNullable<FullApplicationData["attachments"]> = {};
//   const refs = { profileImage: application.user.profileImageRef, classXCertificate: application.education?.certificateRef };
//   for (const [kind, path] of Object.entries(refs)) {
//     if (!path || !path.startsWith(`${application.user.applicationNumber}/`)) continue;
//     const { data, error } = await getSupabaseServer().storage.from(APPLICATION_BUCKET).createSignedUrl(path, 3600);
//     if (error) throw new Error("Unable to open the saved application documents. Please try again.");
//     attachments[kind as keyof typeof attachments] = data.signedUrl;
//   }
//   return { ...application, attachments };
// }


// async function readStoredApplication(client: PoolClient, applicationNumber: string): Promise<FullApplicationData | null> {
//   const { rows } = await client.query(
//     `SELECT *, to_char("dateOfBirth", 'YYYY-MM-DD') AS "dateOfBirth" FROM public.users
//      WHERE "applicationNumber" = $1 AND is_deleted = false AND "deletedAt" IS NULL LIMIT 1`, [applicationNumber],
//   );
//   if (!rows[0]) return null;
//   const education = await client.query(
//     `SELECT * FROM public.user_education WHERE "userId" = $1 AND is_deleted = false AND "deletedAt" IS NULL LIMIT 1`, [rows[0].userId],
//   );
//   return { user: rows[0], education: education.rows[0] || null };
// }

// async function getStoredApplication(applicationNumber: string) {
//   const client = await pool.connect();
//   try {
//     const result = await readStoredApplication(client, applicationNumber);
//     return result ? await withApplicationAttachments(result) : null;
//   } finally { client.release(); }
// }

// /** Match the supplied Sequelize paranoid model: retain rows/files for recovery. */
// async function deleteStoredApplication(applicationNumber: string): Promise<boolean> {
//   const client = await pool.connect();
//   try {
//     await client.query("BEGIN");
//     await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [applicationNumber]);
//     const result = await client.query(
//       `UPDATE public.users SET is_deleted = true, "isActive" = false,
//        "deletedAt" = COALESCE("deletedAt", NOW()), "updatedAt" = NOW()
//        WHERE "applicationNumber" = $1 RETURNING "userId"`, [applicationNumber],
//     );
//     if (!result.rows[0]) {
//       await client.query("ROLLBACK");
//       return false;
//     }
//     await client.query(
//       `UPDATE public.user_education SET is_deleted = true, "isActive" = false,
//        "deletedAt" = COALESCE("deletedAt", NOW()), "updatedAt" = NOW()
//        WHERE "userId" = $1`, [result.rows[0].userId],
//     );
//     await client.query("COMMIT");
//     return true;
//   } catch (error) {
//     await client.query("ROLLBACK").catch(() => {});
//     throw error;
//   } finally { client.release(); }
// }

// // Keys and table names come exclusively from the explicit records below, never request JSON.
// async function writeRecord(client: PoolClient, table: string, primaryKey: string, record: Record<string, unknown>, existingId?: string | number) {
//   const keys = Object.keys(record);
//   const values = Object.values(record);
//   if (existingId !== undefined) {
//     return (await client.query(
//       `UPDATE public."${table}" SET ${keys.map((key, i) => `"${key}" = $${i + 1}`).join(", ")}, "updatedAt" = NOW()
//        WHERE "${primaryKey}" = $${values.length + 1} RETURNING *`, [...values, existingId],
//     )).rows[0];
//   }
//   // Supplied Sequelize models use identity integers. The older deployed tables use UUIDs.
//   const { rows } = await client.query(
//     `SELECT data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`, [table, primaryKey],
//   );
//   if (rows[0]?.data_type === "uuid") {
//     keys.unshift(primaryKey);
//     values.unshift(crypto.randomUUID());
//   }
//   return (await client.query(
//     `INSERT INTO public."${table}" (${keys.map((key) => `"${key}"`).join(", ")}, "createdAt", "updatedAt")
//      VALUES (${values.map((_, i) => `$${i + 1}`).join(", ")}, NOW(), NOW()) RETURNING *`, values,
//   )).rows[0];
// }

// async function persistApplication(payload: ApplicationInputPayload, applicationNumber: string): Promise<FullApplicationData> {
//   const client = await pool.connect();
//   const uploaded: string[] = [];
//   const replaced: string[] = [];
//   let committed = false;
//   let commitAttempted = false;
//   try {
//     await client.query("BEGIN");
//     await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [applicationNumber]);
//     const existing = await readStoredApplication(client, applicationNumber);
//     // A retry with the same unguessable submission ID returns the original result.
//     if (existing && !payload.applicationNumber) {
//       const result = await withApplicationAttachments(existing);
//       commitAttempted = true;
//       await client.query("COMMIT");
//       committed = true;
//       return result;
//     }
//     if (payload.applicationNumber && !existing) throw new Error("The application could not be found.");

//     let profileImageRef = existing?.user.profileImageRef || null;
//     let certificateRef = existing?.education?.certificateRef || null;
//     if (payload.profileImage) {
//       const path = await uploadApplicationFile(payload.profileImage, applicationNumber, "profileImage");
//       uploaded.push(path);
//       if (profileImageRef?.startsWith(`${applicationNumber}/`)) replaced.push(profileImageRef);
//       profileImageRef = path;
//     }
//     if (payload.classXCertificate) {
//       const path = await uploadApplicationFile(payload.classXCertificate, applicationNumber, "classXCertificate");
//       uploaded.push(path);
//       if (certificateRef?.startsWith(`${applicationNumber}/`)) replaced.push(certificateRef);
//       certificateRef = path;
//     }
//     if (!profileImageRef || !certificateRef) throw new Error("Upload both the profile image and Class X certificate.");

//     const user = await writeRecord(client, "users", "userId", {
//       applicationNumber, applicationFor: payload.applicationFor, course: payload.course,
//       academicYear: payload.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
//       firstName: payload.firstName, lastName: payload.lastName, fatherName: payload.fatherName, motherName: payload.motherName,
//       gender: payload.gender, dateOfBirth: payload.dateOfBirth, nationality: payload.nationality || "Indian", category: payload.category,
//       address: payload.address, state: payload.state, city: payload.city, pinCode: payload.pinCode,
//       mobileNumber: payload.mobileNumber, email: payload.email, profileImageRef,
//       registrationFee: existing?.user.registrationFee ?? 500,
//       applicationStatus: existing?.user.applicationStatus || "Pending Payment",
//       submissionTime: existing?.user.submissionTime || null, isActive: true, is_deleted: false,
//     }, existing?.user.userId);

//     const education = await writeRecord(client, "user_education", "educationId", {
//       userId: user.userId, qualificationLevel: "Class X", schoolName: payload.classXSchool, board: payload.classXBoard,
//       passingYear: payload.classXYear, gradeOrPercentage: payload.classXPercentage, medium: payload.classXMedium,
//       certificateRef, isActive: true, is_deleted: false,
//     }, existing?.education?.educationId);
//     // Create preview URLs before committing so a failure can still roll back cleanly.
//     const result = await withApplicationAttachments({ user: { ...user, dateOfBirth: payload.dateOfBirth }, education });
//     commitAttempted = true;
//     await client.query("COMMIT");
//     committed = true;
//     await removeApplicationFiles(replaced).catch(() => console.error("Old application documents could not be removed."));
//     return result;
//   } catch (error) {
//     if (!committed) {
//       await client.query("ROLLBACK").catch(() => {});
//       // COMMIT may succeed even if its acknowledgement is lost. Keep documents
//       // in that case; the caller can safely retry using the same submission ID.
//       if (!commitAttempted) await removeApplicationFiles(uploaded).catch(() => console.error("Application upload rollback requires document cleanup."));
//     }
//     throw error;
//   } finally { client.release(); }
// }


// export const runtime = "nodejs";

// export async function GET(request: NextRequest) {
//   const applicationNumber = request.nextUrl.searchParams.get("applicationNumber")?.trim();
//   if (!applicationNumber) return NextResponse.json({ error: "Application number is required." }, { status: 400 });
//   try {
//     if (!canAccessApplication(request, applicationNumber)) return NextResponse.json({ error: "Open Payments and verify your application number, mobile number and date of birth to access this application." }, { status: 403 });
//     const application = await getStoredApplication(applicationNumber);
//     return NextResponse.json({ application }, { status: application ? 200 : 404, headers: { "Cache-Control": "no-store" } });
//   } catch {
//     return NextResponse.json({ error: "Unable to load the application. Check the server database and Storage configuration." }, { status: 503 });
//   }
// }

// export async function POST(request: NextRequest) {
//   if (request.nextUrl.searchParams.get("action") === "lookup") return lookupStoredApplication(request);
//   return writeApplication(request, false);
// }

// export async function PUT(request: NextRequest) {
//   return writeApplication(request, true);
// }

// async function writeApplication(request: NextRequest, updating: boolean) {
//   const origin = request.headers.get("origin");
//   if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
//   if (Number(request.headers.get("content-length")) > 11 * 1024 * 1024) return NextResponse.json({ error: "Upload files of 5 MB or less each." }, { status: 413 });

//   let payload: ApplicationInputPayload;
//   try {
//     const form = await request.formData();
//     const raw: unknown = JSON.parse(String(form.get("payload") || "{}"));
//     if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Invalid application data.");
//     const values: Record<string, string> = {};
//     for (const [key, value] of Object.entries(raw)) {
//       if (typeof value !== "string" || value.length > 2000) throw new Error("Application fields must contain text of 2000 characters or less.");
//       values[key] = value.trim();
//     }
//     const profile = form.get("profileImage");
//     const certificate = form.get("classXCertificate");
//     payload = {
//       ...values,
//       profileImage: profile instanceof File && profile.size ? profile : undefined,
//       classXCertificate: certificate instanceof File && certificate.size ? certificate : undefined,
//     } as ApplicationInputPayload;
//     if (updating && !payload.applicationNumber) throw new Error("Application number is required to update an application.");
//     if (!updating && payload.applicationNumber) throw new Error("Use PUT to update an existing application.");
//     if (payload.applicationNumber && !/^[A-Za-z0-9-]{1,100}$/.test(payload.applicationNumber)) throw new Error("Invalid application number.");
//     if (!payload.applicationNumber && !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(payload.submissionId || "")) throw new Error("Invalid submission ID. Reload the form and try again.");
//     // Existing attachments are checked against the database in persistApplication.
//     const existingFiles = payload.applicationNumber ? { profileImage: "existing", classXCertificate: "existing" } : undefined;
//     const errors = validateApplication({ ...values, phone: values.mobileNumber }, existingFiles, payload);
//     if (Object.keys(errors).length) return NextResponse.json({ error: Object.values(errors)[0], errors }, { status: 400 });
//     if (payload.profileImage) await validateApplicationFile(payload.profileImage, "profileImage");
//     if (payload.classXCertificate) await validateApplicationFile(payload.classXCertificate, "classXCertificate");
//   } catch (error) {
//     return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid form data." }, { status: 400 });
//   }

//   try {
//     getSupabaseServer(); // Fail before any database write if Storage is unconfigured.
//     if (payload.applicationNumber && !canAccessApplication(request, payload.applicationNumber)) {
//       return NextResponse.json({ error: "Verify this application through Payments before editing it." }, { status: 403 });
//     }
//     const applicationNumber = payload.applicationNumber || createApplicationNumber(payload.submissionId!);
//     const application = await persistApplication(payload, applicationNumber);
//     const response = NextResponse.json({ application }, { headers: { "Cache-Control": "no-store" } });
//     grantApplicationAccess(response, applicationNumber);
//     return response;
//   } catch (error) {
//     console.error("Application save failed:", error);
//     const message = process.env.NODE_ENV === "development" && error instanceof Error
//       ? `Application could not be saved: ${error.message}`
//       : "Application could not be saved. Check database connectivity, run the application setup SQL, and configure the application-documents bucket and server Storage credentials. Your form is still available to retry.";
//     return NextResponse.json({ error: message }, { status: 503 });
//   }
// }

// export async function DELETE(request: NextRequest) {
//   const origin = request.headers.get("origin");
//   if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
//   const body = await request.json().catch(() => null);
//   const applicationNumber = typeof body?.applicationNumber === "string" ? body.applicationNumber.trim() : "";
//   if (!/^[A-Za-z0-9-]{1,100}$/.test(applicationNumber)) return NextResponse.json({ error: "A valid application number is required." }, { status: 400 });
//   try {
//     if (!canAccessApplication(request, applicationNumber)) {
//       return NextResponse.json({ error: "Verify this application through Payments before deleting it." }, { status: 403 });
//     }
//     const deleted = await deleteStoredApplication(applicationNumber);
//     if (!deleted) return NextResponse.json({ error: "Application not found." }, { status: 404 });
//     return NextResponse.json({ deleted: true, applicationNumber }, { headers: { "Cache-Control": "no-store" } });
//   } catch {
//     return NextResponse.json({ error: "Application could not be deleted. Please try again later." }, { status: 503 });
//   }
// }


// async function lookupStoredApplication(request: NextRequest) {
//   const body = await request.json().catch(() => null);
//   const applicationNumber = typeof body?.applicationNumber === "string" ? body.applicationNumber.trim() : "";
//   const mobileNumber = typeof body?.mobileNumber === "string" ? body.mobileNumber.trim() : "";
//   const dateOfBirth = typeof body?.dateOfBirth === "string" ? body.dateOfBirth.trim() : "";
//   if (!applicationNumber || !/^[6-9]\d{9}$/.test(mobileNumber) || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
//     return NextResponse.json({ error: "Enter your application number, 10-digit mobile number and date of birth." }, { status: 400 });
//   }
//   try {
//     const result = await pool.query(
//       `SELECT "applicationNumber" FROM public.users WHERE "applicationNumber" = $1 AND "mobileNumber" = $2
//        AND "dateOfBirth" = $3 AND is_deleted = false AND "deletedAt" IS NULL LIMIT 1`,
//       [applicationNumber, mobileNumber, dateOfBirth],
//     );
//     if (!result.rows[0]) return NextResponse.json({ application: null }, { status: 404 });
//     const application = await getStoredApplication(applicationNumber);
//     const response = NextResponse.json({ application }, { headers: { "Cache-Control": "no-store" } });
//     grantApplicationAccess(response, applicationNumber);
//     return response;
//   } catch {
//     return NextResponse.json({ error: "Unable to look up the application. Please try again later." }, { status: 503 });
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { PoolClient } from "pg";
import { pool } from "@/lib/db";
import type { ApplicationInputPayload, FullApplicationData } from "@/lib/helpers/applicationsAPI";
import { validateApplication } from "@/app/apply/validation";
import { sendApplicationEmail, sendOTPEmail } from "@/lib/helpers/emailService";

console.log("===== APPLICATIONS ROUTE FILE LOADED =====");


function logSupabaseEnvDebug() {
  console.log("===== SUPABASE ENV DEBUG =====");
  console.log("NODE_ENV:", process.env.NODE_ENV || "<not set>");
  console.log("Working directory:", process.cwd());
  console.log("SUPABASE_URL exists:", Boolean(process.env.SUPABASE_URL));
  console.log("NEXT_PUBLIC_SUPABASE_URL exists:", Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL));
  console.log("SUPABASE_SERVICE_ROLE_KEY exists:", Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY));
  console.log("==============================");
}

function getSupabaseServer() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Supabase server configuration is missing:", {
      SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    });

    throw new Error(
      "Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server before uploading application documents."
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}


function secret() {
  const key = process.env.APPLICATION_COOKIE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Application server credentials are not configured.");
  return key;
}

function cookieName(applicationNumber: string) {
  return `ajc_application_${createHash("sha256").update(applicationNumber).digest("hex").slice(0, 24)}`;
}

function signature(applicationNumber: string, expires: string) {
  return createHmac("sha256", secret()).update(`${applicationNumber}:${expires}`).digest("hex");
}

const recentSubmissions = new Map<string, { applicationNumber: string; expiresAt: number }>();

function createApplicationNumber(seqOrSubmissionId?: string | number, year = new Date().getFullYear()) {
  if (typeof seqOrSubmissionId === "number") {
    return `AJC-${year}-${String(seqOrSubmissionId).padStart(4, "0")}`;
  }
  if (!seqOrSubmissionId) {
    return `AJC-${year}-0001`;
  }
  // Deterministic 4-digit number based on submissionId / token (for testing or fallback)
  const hash = createHmac("sha256", secret()).update(`submission:${seqOrSubmissionId}`).digest("hex");
  const num = (parseInt(hash.slice(0, 8), 16) % 9999) + 1;
  return `AJC-${year}-${String(num).padStart(4, "0")}`;
}

async function generateNextApplicationNumber(client: PoolClient | typeof pool, year = new Date().getFullYear()): Promise<string> {
  const prefix = `AJC-${year}-`;
  try {
    const result = await client.query(
      `SELECT "applicationNumber"
       FROM public.users
       WHERE "applicationNumber" ~ ('^AJC-' || $1 || '-[0-9]+$')
       ORDER BY NULLIF(regexp_replace("applicationNumber", '^AJC-[0-9]+-', ''), '')::bigint DESC
       LIMIT 1`,
      [year]
    );
    let nextSeq = 1;
    if (result?.rows?.length && result.rows[0]?.applicationNumber) {
      const lastNumStr = result.rows[0].applicationNumber.slice(prefix.length);
      const lastNum = parseInt(lastNumStr, 10);
      if (!isNaN(lastNum)) {
        nextSeq = lastNum + 1;
      }
    }
    return `${prefix}${String(nextSeq).padStart(4, "0")}`;
  } catch (error) {
    console.warn("Could not query sequential application number, falling back:", error);
    return `AJC-${year}-0001`;
  }
}

function canAccessApplication(request: NextRequest, applicationNumber: string) {
  const value = request.cookies.get(cookieName(applicationNumber))?.value;
  if (!value) return false;
  const [expires, hash] = value.split(".");
  if (!/^\d+$/.test(expires) || Number(expires) < Date.now() || !/^[a-f0-9]{64}$/.test(hash || "")) return false;
  return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(signature(applicationNumber, expires), "hex"));
}

function grantApplicationAccess(response: NextResponse, applicationNumber: string) {
  const maxAge = 30 * 24 * 60 * 60;
  const expires = String(Date.now() + maxAge * 1000);
  response.cookies.set(cookieName(applicationNumber), `${expires}.${signature(applicationNumber, expires)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/api/applications", maxAge,
  });
}


const APPLICATION_BUCKET = "application-documents";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

async function validateApplicationFile(file: File, kind: "profileImage" | "classXCertificate") {
  const photo = kind === "profileImage";
  const mime = photo ? "image/jpeg" : "application/pdf";
  const extension = photo ? /\.jpe?g$/i : /\.pdf$/i;
  const label = photo ? "Profile image" : "Class X certificate";
  if (!file.size || file.size > MAX_FILE_SIZE) throw new Error(`${label} must be between 1 byte and 5 MB.`);
  if (!extension.test(file.name) || (file.type && file.type !== mime)) throw new Error(`${label} must be a ${photo ? "JPG/JPEG" : "PDF"} file.`);
  const bytes = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  const signatureMatches = photo
    ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : new TextDecoder().decode(bytes) === "%PDF-";
  if (!signatureMatches) throw new Error(`${label} contents do not match the required file type.`);
}

async function uploadApplicationFile(file: File, applicationNumber: string, kind: "profileImage" | "classXCertificate") {
  await validateApplicationFile(file, kind);
  const path = `${applicationNumber}/${kind}-${crypto.randomUUID()}.${kind === "profileImage" ? "jpg" : "pdf"}`;
  const { error } = await getSupabaseServer().storage.from(APPLICATION_BUCKET).upload(path, file, {
    contentType: kind === "profileImage" ? "image/jpeg" : "application/pdf", upsert: false,
  });
  if (error) throw new Error(`Could not upload ${kind === "profileImage" ? "profile image" : "certificate"}. Check the application-documents bucket and server Storage configuration.`);
  return path;
}

async function removeApplicationFiles(paths: string[]) {
  if (!paths.length) return;
  const { error } = await getSupabaseServer().storage.from(APPLICATION_BUCKET).remove(paths);
  if (error) throw new Error("Application document cleanup failed.");
}

async function withApplicationAttachments(application: FullApplicationData): Promise<FullApplicationData> {
  const attachments: NonNullable<FullApplicationData["attachments"]> = {};
  const refs = { profileImage: application.user.profileImageRef, classXCertificate: application.education?.certificateRef };
  for (const [kind, path] of Object.entries(refs)) {
    if (!path || !path.startsWith(`${application.user.applicationNumber}/`)) continue;
    const { data, error } = await getSupabaseServer().storage.from(APPLICATION_BUCKET).createSignedUrl(path, 3600);
    if (error) throw new Error("Unable to open the saved application documents. Please try again.");
    attachments[kind as keyof typeof attachments] = data.signedUrl;
  }
  return { ...application, attachments };
}


async function readStoredApplication(client: PoolClient, applicationNumber: string): Promise<FullApplicationData | null> {
  const { rows } = await client.query(
    `SELECT *, to_char("dateOfBirth", 'YYYY-MM-DD') AS "dateOfBirth" FROM public.users
     WHERE "applicationNumber" = $1 AND is_deleted = false AND "deletedAt" IS NULL LIMIT 1`, [applicationNumber],
  );
  if (!rows[0]) return null;
  const education = await client.query(
    `SELECT * FROM public.user_education WHERE "userId" = $1 AND is_deleted = false AND "deletedAt" IS NULL LIMIT 1`, [rows[0].userId],
  );
  return { user: rows[0], education: education.rows[0] || null };
}

async function getStoredApplication(applicationNumber: string) {
  const client = await pool.connect();
  try {
    const result = await readStoredApplication(client, applicationNumber);
    return result ? await withApplicationAttachments(result) : null;
  } finally { client.release(); }
}

/** Match the supplied Sequelize paranoid model: retain rows/files for recovery. */
async function deleteStoredApplication(applicationNumber: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [applicationNumber]);
    const result = await client.query(
      `UPDATE public.users SET is_deleted = true, "isActive" = false,
       "deletedAt" = COALESCE("deletedAt", NOW()), "updatedAt" = NOW()
       WHERE "applicationNumber" = $1 RETURNING "userId"`, [applicationNumber],
    );
    if (!result.rows[0]) {
      await client.query("ROLLBACK");
      return false;
    }
    await client.query(
      `UPDATE public.user_education SET is_deleted = true, "isActive" = false,
       "deletedAt" = COALESCE("deletedAt", NOW()), "updatedAt" = NOW()
       WHERE "userId" = $1`, [result.rows[0].userId],
    );
    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => { });
    throw error;
  } finally { client.release(); }
}

// Keys and table names come exclusively from the explicit records below, never request JSON.
async function writeRecord(client: PoolClient, table: string, primaryKey: string, record: Record<string, unknown>, existingId?: string | number) {
  const keys = Object.keys(record);
  const values = Object.values(record);
  if (existingId !== undefined) {
    return (await client.query(
      `UPDATE public."${table}" SET ${keys.map((key, i) => `"${key}" = $${i + 1}`).join(", ")}, "updatedAt" = NOW()
       WHERE "${primaryKey}" = $${values.length + 1} RETURNING *`, [...values, existingId],
    )).rows[0];
  }
  // Supplied Sequelize models use identity integers. The older deployed tables use UUIDs.
  const { rows } = await client.query(
    `SELECT data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`, [table, primaryKey],
  );
  if (rows[0]?.data_type === "uuid") {
    keys.unshift(primaryKey);
    values.unshift(crypto.randomUUID());
  }
  return (await client.query(
    `INSERT INTO public."${table}" (${keys.map((key) => `"${key}"`).join(", ")}, "createdAt", "updatedAt")
     VALUES (${values.map((_, i) => `$${i + 1}`).join(", ")}, NOW(), NOW()) RETURNING *`, values,
  )).rows[0];
}

async function persistApplication(payload: ApplicationInputPayload, requestedApplicationNumber?: string): Promise<FullApplicationData> {
  const client = await pool.connect();
  const uploaded: string[] = [];
  const replaced: string[] = [];
  let committed = false;
  let commitAttempted = false;
  try {
    await client.query("BEGIN");
    const year = new Date().getFullYear();
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`ajc_app_seq_${year}`]);

    let applicationNumber = requestedApplicationNumber || payload.applicationNumber;
    if (!applicationNumber) {
      if (payload.submissionId && recentSubmissions.has(payload.submissionId)) {
        applicationNumber = recentSubmissions.get(payload.submissionId)!.applicationNumber;
      } else {
        applicationNumber = await generateNextApplicationNumber(client, year);
      }
    }

    const existing = await readStoredApplication(client, applicationNumber);
    // A retry with the same unguessable submission ID returns the original result.
    if (existing && !payload.applicationNumber) {
      const result = await withApplicationAttachments(existing);
      commitAttempted = true;
      await client.query("COMMIT");
      committed = true;
      return result;
    }
    if (payload.applicationNumber && !existing) throw new Error("The application could not be found.");

    let profileImageRef = existing?.user.profileImageRef || null;
    let certificateRef = existing?.education?.certificateRef || null;
    if (payload.profileImage) {
      const path = await uploadApplicationFile(payload.profileImage, applicationNumber, "profileImage");
      uploaded.push(path);
      if (profileImageRef?.startsWith(`${applicationNumber}/`)) replaced.push(profileImageRef);
      profileImageRef = path;
    }
    if (payload.classXCertificate) {
      const path = await uploadApplicationFile(payload.classXCertificate, applicationNumber, "classXCertificate");
      uploaded.push(path);
      if (certificateRef?.startsWith(`${applicationNumber}/`)) replaced.push(certificateRef);
      certificateRef = path;
    }
    if (!profileImageRef || !certificateRef) throw new Error("Upload both the profile image and Class X certificate.");

    const user = await writeRecord(client, "users", "userId", {
      applicationNumber, applicationFor: payload.applicationFor, course: payload.course,
      academicYear: payload.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      firstName: payload.firstName, lastName: payload.lastName, fatherName: payload.fatherName, motherName: payload.motherName,
      gender: payload.gender, dateOfBirth: payload.dateOfBirth, nationality: payload.nationality || "Indian", category: payload.category,
      address: payload.address, state: payload.state, city: payload.city, pinCode: payload.pinCode,
      mobileNumber: payload.mobileNumber, email: payload.email, profileImageRef,
      registrationFee: payload.registrationFee ? Number(payload.registrationFee) : (existing?.user.registrationFee ?? 500),
      applicationStatus: existing?.user.applicationStatus || "Pending Payment",
      submissionTime: existing?.user.submissionTime || null, isActive: true, is_deleted: false,
    }, existing?.user.userId);

    const education = await writeRecord(client, "user_education", "educationId", {
      userId: user.userId, qualificationLevel: "Class X", schoolName: payload.classXSchool, board: payload.classXBoard,
      passingYear: payload.classXYear, gradeOrPercentage: payload.classXPercentage, medium: payload.classXMedium,
      certificateRef, isActive: true, is_deleted: false,
    }, existing?.education?.educationId);
    // Create preview URLs before committing so a failure can still roll back cleanly.
    const result = await withApplicationAttachments({ user: { ...user, dateOfBirth: payload.dateOfBirth }, education });
    commitAttempted = true;
    await client.query("COMMIT");
    committed = true;
    if (payload.submissionId) {
      recentSubmissions.set(payload.submissionId, { applicationNumber, expiresAt: Date.now() + 15 * 60 * 1000 });
    }
    await removeApplicationFiles(replaced).catch(() => console.error("Old application documents could not be removed."));
    return result;
  } catch (error) {
    if (!committed) {
      await client.query("ROLLBACK").catch(() => { });
      // COMMIT may succeed even if its acknowledgement is lost. Keep documents
      // in that case; the caller can safely retry using the same submission ID.
      if (!commitAttempted) await removeApplicationFiles(uploaded).catch(() => console.error("Application upload rollback requires document cleanup."));
    }
    throw error;
  } finally { client.release(); }
}


export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const applicationNumber = request.nextUrl.searchParams.get("applicationNumber")?.trim();
  if (!applicationNumber) return NextResponse.json({ error: "Application number is required." }, { status: 400 });
  try {
    if (!canAccessApplication(request, applicationNumber)) return NextResponse.json({ error: "Open Payments and verify your application number, mobile number and date of birth to access this application." }, { status: 403 });
    const application = await getStoredApplication(applicationNumber);
    return NextResponse.json({ application }, { status: application ? 200 : 404, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to load the application. Check the server database and Storage configuration." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") || request.nextUrl.searchParams.get("action");

  console.log("===== APPLICATIONS POST ROUTE HIT =====");
  console.log("Request URL:", request.url);
  console.log("Parsed Action:", action);

  if (action === "lookup") {
    return lookupStoredApplication(request);
  }

  if (action === "request_otp") {
    return requestApplicationOtp(request);
  }

  if (action === "verify_otp") {
    return verifyApplicationOtp(request);
  }

  return writeApplication(request, false);
}

export async function PUT(request: NextRequest) {
  return writeApplication(request, true);
}

async function writeApplication(request: NextRequest, updating: boolean) {
  logSupabaseEnvDebug();

  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (Number(request.headers.get("content-length")) > 11 * 1024 * 1024) return NextResponse.json({ error: "Upload files of 5 MB or less each." }, { status: 413 });

  let payload: ApplicationInputPayload;
  try {
    const form = await request.formData();
    const raw: unknown = JSON.parse(String(form.get("payload") || "{}"));
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Invalid application data.");
    const values: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (typeof value !== "string" || value.length > 2000) throw new Error("Application fields must contain text of 2000 characters or less.");
      values[key] = value.trim();
    }
    const profile = form.get("profileImage");
    const certificate = form.get("classXCertificate");
    payload = {
      ...values,
      profileImage: profile instanceof File && profile.size ? profile : undefined,
      classXCertificate: certificate instanceof File && certificate.size ? certificate : undefined,
    } as ApplicationInputPayload;
    if (updating && !payload.applicationNumber) throw new Error("Application number is required to update an application.");
    if (!updating && payload.applicationNumber) throw new Error("Use PUT to update an existing application.");
    if (payload.applicationNumber && !/^[A-Za-z0-9-]{1,100}$/.test(payload.applicationNumber)) throw new Error("Invalid application number.");
    if (!payload.applicationNumber && !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(payload.submissionId || "")) throw new Error("Invalid submission ID. Reload the form and try again.");
    // Existing attachments are checked against the database in persistApplication.
    const existingFiles = payload.applicationNumber ? { profileImage: "existing", classXCertificate: "existing" } : undefined;
    const errors = validateApplication({ ...values, phone: values.mobileNumber }, existingFiles, payload);
    if (Object.keys(errors).length) return NextResponse.json({ error: Object.values(errors)[0], errors }, { status: 400 });
    if (payload.profileImage) await validateApplicationFile(payload.profileImage, "profileImage");
    if (payload.classXCertificate) await validateApplicationFile(payload.classXCertificate, "classXCertificate");
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid form data." }, { status: 400 });
  }

  try {
    getSupabaseServer(); // Fail before any database write if Storage is unconfigured.
    if (payload.applicationNumber && !canAccessApplication(request, payload.applicationNumber)) {
      return NextResponse.json({ error: "Verify this application through Payments before editing it." }, { status: 403 });
    }
    const application = await persistApplication(payload, payload.applicationNumber);
    const applicationNumber = application.user.applicationNumber;

    if (!updating && payload.email) {

      sendApplicationEmail(
        payload.email,
        `${payload.firstName} ${payload.lastName}`,
        applicationNumber,
        payload.course
      ).catch(console.error);
    }

    const response = NextResponse.json({ application }, { headers: { "Cache-Control": "no-store" } });
    grantApplicationAccess(response, applicationNumber);
    return response;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Application save failed:", errorMsg, error);
    return NextResponse.json({ error: `Application could not be saved: ${errorMsg}. Check database connectivity and Storage credentials.`, details: errorMsg }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const applicationNumber = typeof body?.applicationNumber === "string" ? body.applicationNumber.trim() : "";
  if (!/^[A-Za-z0-9-]{1,100}$/.test(applicationNumber)) return NextResponse.json({ error: "A valid application number is required." }, { status: 400 });
  try {
    if (!canAccessApplication(request, applicationNumber)) {
      return NextResponse.json({ error: "Verify this application through Payments before deleting it." }, { status: 403 });
    }
    const deleted = await deleteStoredApplication(applicationNumber);
    if (!deleted) return NextResponse.json({ error: "Application not found." }, { status: 404 });
    return NextResponse.json({ deleted: true, applicationNumber }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Application could not be deleted. Please try again later." }, { status: 503 });
  }
}


async function lookupStoredApplication(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const applicationNumber = typeof body?.applicationNumber === "string" ? body.applicationNumber.trim() : "";
  const mobileNumber = typeof body?.mobileNumber === "string" ? body.mobileNumber.trim() : "";
  const dateOfBirth = typeof body?.dateOfBirth === "string" ? body.dateOfBirth.trim() : "";
  if (!applicationNumber || !/^[6-9]\d{9}$/.test(mobileNumber) || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    return NextResponse.json({ error: "Enter your application number, 10-digit mobile number and date of birth." }, { status: 400 });
  }
  try {
    const result = await pool.query(
      `SELECT "applicationNumber" FROM public.users WHERE "applicationNumber" = $1 AND "mobileNumber" = $2
       AND "dateOfBirth" = $3 AND is_deleted = false AND "deletedAt" IS NULL LIMIT 1`,
      [applicationNumber, mobileNumber, dateOfBirth],
    );
    if (!result.rows[0]) return NextResponse.json({ application: null }, { status: 404 });
    const application = await getStoredApplication(applicationNumber);
    const response = NextResponse.json({ application }, { headers: { "Cache-Control": "no-store" } });
    grantApplicationAccess(response, applicationNumber);
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to look up the application. Please try again later." }, { status: 503 });
  }
}

async function requestApplicationOtp(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const applicationNumber = typeof body?.applicationNumber === "string" ? body.applicationNumber.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  
  if (!applicationNumber || !email) {
    return NextResponse.json({ error: "Enter your application number and registered email address." }, { status: 400 });
  }
  
  try {
    // Check if the application exists and matches the email
    const result = await pool.query(
      `SELECT "applicationNumber", "firstName", "lastName" FROM public.users 
       WHERE "applicationNumber" = $1 AND "email" = $2 AND is_deleted = false AND "deletedAt" IS NULL LIMIT 1`,
      [applicationNumber, email],
    );
    
    if (!result.rows[0]) {
      return NextResponse.json({ error: "No application matches these details. Check your application number and email." }, { status: 404 });
    }
    
    const user = result.rows[0];
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    // UPSERT OTP in the database
    await pool.query(
      `INSERT INTO public.application_otps ("applicationNumber", email, otp, "expiresAt", "createdAt") 
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT ("applicationNumber") 
       DO UPDATE SET otp = EXCLUDED.otp, "expiresAt" = EXCLUDED."expiresAt", "createdAt" = NOW()`,
      [applicationNumber, email, otp, expiresAt]
    );
    
    // Send email
    await sendOTPEmail(email, otp, `${user.firstName} ${user.lastName}`);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error generating OTP:", err);
    return NextResponse.json({ error: "Unable to generate OTP. Please try again later." }, { status: 503 });
  }
}

async function verifyApplicationOtp(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const applicationNumber = typeof body?.applicationNumber === "string" ? body.applicationNumber.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const otp = typeof body?.otp === "string" ? body.otp.trim() : "";
  
  if (!applicationNumber || !email || !otp) {
    return NextResponse.json({ error: "Application number, email, and OTP are required." }, { status: 400 });
  }
  
  try {
    // Check if OTP matches and hasn't expired
    const result = await pool.query(
      `SELECT * FROM public.application_otps 
       WHERE "applicationNumber" = $1 AND "email" = $2 AND "otp" = $3 AND "expiresAt" > NOW() LIMIT 1`,
      [applicationNumber, email, otp],
    );
    
    if (!result.rows[0]) {
      return NextResponse.json({ error: "Invalid or expired OTP. Please request a new one." }, { status: 401 });
    }
    
    // Delete the OTP after successful verification
    await pool.query(`DELETE FROM public.application_otps WHERE "applicationNumber" = $1`, [applicationNumber]);
    
    // Grant access and return application
    const application = await getStoredApplication(applicationNumber);
    if (!application) {
      return NextResponse.json({ error: "Application could not be found." }, { status: 404 });
    }
    
    const response = NextResponse.json({ application }, { headers: { "Cache-Control": "no-store" } });
    grantApplicationAccess(response, applicationNumber);
    return response;
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return NextResponse.json({ error: "Unable to verify OTP. Please try again later." }, { status: 503 });
  }
}
