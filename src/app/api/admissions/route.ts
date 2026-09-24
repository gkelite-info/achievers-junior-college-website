import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

interface BranchRow {
  collegeBranchId: number;
  branchName: string;
}

interface CourseAdmissionRow {
  collegeBranchId: number;
  isAdmissionsOpen: boolean;
  admissionFee: string | number;
}

interface PgCourseRow {
  collegeBranchId: number;
  courseName: string;
  isAdmissionsOpen: boolean | null;
  admissionFee: string | number | null;
}

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  const collegeId = 40; // Achievers Junior College

  // 1. Fetch dynamically from Supabase REST Client over HTTPS (works in Vercel, serverless, and all networks)
  try {
    const supabase = getSupabase();
    if (supabase) {
      const [settingsRes, branchesRes, admissionsRes] = await Promise.all([
        supabase
          .from("college_admission_settings")
          .select("isAdmissionsOpen")
          .eq("collegeId", collegeId)
          .is("deletedAt", null)
          .order("createdAt", { ascending: false })
          .limit(1),
        supabase
          .from("college_branch")
          .select("collegeBranchId, branchName")
          .eq("collegeId", collegeId)
          .is("deletedAt", null),
        supabase
          .from("college_course_admissions")
          .select("collegeBranchId, isAdmissionsOpen, admissionFee")
          .eq("collegeId", collegeId)
          .is("deletedAt", null),
      ]);

      const globalAdmissionsOpen = settingsRes.data && settingsRes.data.length > 0
        ? Boolean(settingsRes.data[0].isAdmissionsOpen)
        : false;

      const admMap = new Map<number, { isAdmissionsOpen: boolean; admissionFee: number }>();
      ((admissionsRes.data || []) as CourseAdmissionRow[]).forEach((adm) => {
        admMap.set(adm.collegeBranchId, {
          isAdmissionsOpen: adm.isAdmissionsOpen ?? false,
          admissionFee: adm.admissionFee ? parseFloat(String(adm.admissionFee)) : 0,
        });
      });

      if (branchesRes.data && branchesRes.data.length > 0) {
        const courses = ((branchesRes.data || []) as BranchRow[]).map((branch) => {
          const adm = admMap.get(branch.collegeBranchId);
          return {
            collegeBranchId: branch.collegeBranchId,
            courseName: branch.branchName,
            isAdmissionsOpen: adm ? adm.isAdmissionsOpen : false,
            admissionFee: adm ? adm.admissionFee : 0,
          };
        });

        return NextResponse.json({
          success: true,
          globalAdmissionsOpen,
          courses,
        });
      }
    }
  } catch (supabaseErr) {
    console.warn("Supabase REST dynamic admissions fetch error, attempting direct pg.Pool:", supabaseErr);
  }

  // 2. Direct pg.Pool fallback
  try {
    const settingsResult = await pool.query(
      `SELECT "isAdmissionsOpen" FROM "college_admission_settings" 
       WHERE "collegeId" = $1 AND "deletedAt" IS NULL`,
      [collegeId]
    );

    const globalAdmissionsOpen = settingsResult.rows.length > 0 ? settingsResult.rows[0].isAdmissionsOpen : false;

    const coursesResult = await pool.query(
      `SELECT 
         cb."collegeBranchId",
         cb."branchName" as "courseName",
         cca."isAdmissionsOpen",
         cca."admissionFee"
       FROM "college_branch" cb
       LEFT JOIN "college_course_admissions" cca 
         ON cb."collegeBranchId" = cca."collegeBranchId" AND cca."deletedAt" IS NULL
       WHERE cb."collegeId" = $1 AND cb."deletedAt" IS NULL`,
      [collegeId]
    );

    const courses = (coursesResult.rows as PgCourseRow[]).map((row) => ({
      collegeBranchId: row.collegeBranchId,
      courseName: row.courseName,
      isAdmissionsOpen: row.isAdmissionsOpen ?? false,
      admissionFee: row.admissionFee ? parseFloat(String(row.admissionFee)) : 0,
    }));

    return NextResponse.json({
      success: true,
      globalAdmissionsOpen,
      courses,
    });
<<<<<<< Updated upstream
  } catch (error: any) {
    // Provide a graceful fallback for local development if the database is not configured
    if (process.env.NODE_ENV !== 'production') {
      console.warn("DB not connected. Returning mock admissions data for local dev.");
      return NextResponse.json({
        success: true,
        globalAdmissionsOpen: true,
        courses: [
          { collegeBranchId: 1, courseName: "MPC", isAdmissionsOpen: true, admissionFee: 15000 },
          { collegeBranchId: 2, courseName: "BiPC", isAdmissionsOpen: true, admissionFee: 15000 },
          { collegeBranchId: 3, courseName: "MEC", isAdmissionsOpen: true, admissionFee: 12000 }
        ],
        _mocked: true
      });
    }

    console.error("Error fetching admissions:", error);
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 });
=======
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Error dynamically fetching admissions from DB:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
>>>>>>> Stashed changes
  }
}
