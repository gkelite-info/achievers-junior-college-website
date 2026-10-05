import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

interface CourseRow {
  collegeBranchId: string;
  courseName: string;
  courseCode: string;
  educationName: string;
  isAdmissionsOpen: boolean;
  admissionFee: number;
  isHidden: boolean;
}

export async function GET() {
  // 1. Fetch dynamically from Supabase REST Client
  try {
    const [settingsRes, branchesRes, admissionsRes] = await Promise.all([
      supabase
        .from("college_admission_settings")
        .select("isAdmissionsOpen")
        .is("deletedAt", null)
        .order("createdAt", { ascending: false })
        .limit(1),
      supabase
        .from("college_branches")
        .select(`
          college_branch_id,
          branchName,
          branch_code,
          is_Active,
          college_educations (
            educationName,
            education_code
          )
        `)
        .eq("is_deleted", false)
        .order("createdAt", { ascending: true }),
      supabase
        .from("college_course_admissions")
        .select("college_branch_id, isAdmissionsOpen, admissionFee, isHidden")
        .is("deletedAt", null),
    ]);

    const globalAdmissionsOpen =
      settingsRes.data && settingsRes.data.length > 0
        ? Boolean(settingsRes.data[0].isAdmissionsOpen)
        : true;

    if (branchesRes.data && branchesRes.data.length > 0) {
      const admMap = new Map<string, { isAdmissionsOpen: boolean; admissionFee: number; isHidden: boolean }>();
      (admissionsRes.data || []).forEach((adm: any) => {
        const key = adm.college_branch_id;
        if (key) {
          admMap.set(String(key), {
            isAdmissionsOpen: adm.isAdmissionsOpen ?? false,
            admissionFee: adm.admissionFee ? parseFloat(String(adm.admissionFee)) : 0,
            isHidden: Boolean(adm.isHidden),
          });
        }
      });

      const courses: CourseRow[] = branchesRes.data.map((branch: any) => {
        const adm = admMap.get(String(branch.college_branch_id));
        const edu = Array.isArray(branch.college_educations)
          ? branch.college_educations[0]
          : branch.college_educations;

        return {
          collegeBranchId: String(branch.college_branch_id),
          courseName: branch.branchName,
          courseCode: branch.branch_code,
          educationName: edu?.educationName || "Intermediate Education",
          isAdmissionsOpen: adm ? adm.isAdmissionsOpen : true,
          admissionFee: adm ? adm.admissionFee : 0,
          isHidden: adm ? adm.isHidden : false,
        };
      });

      return NextResponse.json({
        success: true,
        globalAdmissionsOpen,
        courses,
      });
    }
  } catch (supabaseErr) {
    console.warn("Supabase REST dynamic admissions fetch error, attempting direct pg.Pool:", supabaseErr);
  }

  // 2. Direct pg.Pool query fallback
  if (process.env.DBHOSTNAME && process.env.DBPASSWORD) {
    const client = await pool.connect();
    try {
      const settingsResult = await client.query(
        `SELECT "isAdmissionsOpen" FROM "college_admission_settings" 
         WHERE "deletedAt" IS NULL
         ORDER BY "createdAt" DESC
         LIMIT 1`
      );

      const globalAdmissionsOpen =
        settingsResult.rows.length > 0 ? settingsResult.rows[0].isAdmissionsOpen : true;

      const coursesResult = await client.query(
        `SELECT 
           b.college_branch_id as "collegeBranchId",
           b."branchName" as "courseName",
           b.branch_code as "courseCode",
           e."educationName",
           cca."isAdmissionsOpen",
           cca."admissionFee",
           cca."isHidden"
         FROM public.college_branches b
         JOIN public.college_educations e ON b.college_education_id = e.college_education_id
         LEFT JOIN public.college_course_admissions cca 
           ON cca.college_branch_id = b.college_branch_id AND cca."deletedAt" IS NULL
         WHERE b.is_deleted = false AND e.is_deleted = false
         ORDER BY b."createdAt" ASC`
      );

      const courses: CourseRow[] = coursesResult.rows.map((row: any) => ({
        collegeBranchId: String(row.collegeBranchId),
        courseName: row.courseName,
        courseCode: row.courseCode,
        educationName: row.educationName,
        isAdmissionsOpen: row.isAdmissionsOpen ?? true,
        admissionFee: row.admissionFee ? parseFloat(String(row.admissionFee)) : 0,
        isHidden: Boolean(row.isHidden),
      }));

      return NextResponse.json({
        success: true,
        globalAdmissionsOpen,
        courses,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Error dynamically fetching admissions from DB:", msg);
      return NextResponse.json({ success: false, error: msg }, { status: 500 });
    } finally {
      client.release();
    }
  }

  return NextResponse.json({
    success: false,
    error: "Admissions data could not be fetched from database.",
  }, { status: 500 });
}

