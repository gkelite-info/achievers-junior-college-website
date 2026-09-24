import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const collegeId = 40; // Achievers Junior College

  try {
    // Fetch global admission setting for the college
    const settingsResult = await pool.query(
      `SELECT "isAdmissionsOpen" FROM "college_admission_settings" 
       WHERE "collegeId" = $1 AND "deletedAt" IS NULL`,
      [collegeId]
    );

    const globalAdmissionsOpen = settingsResult.rows.length > 0 ? settingsResult.rows[0].isAdmissionsOpen : false;

    // Fetch course-level admission settings
    // Assuming college_branch exists and has branchName.
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

    const courses = coursesResult.rows.map((row: any) => ({
      collegeBranchId: row.collegeBranchId,
      courseName: row.courseName,
      isAdmissionsOpen: row.isAdmissionsOpen ?? false,
      admissionFee: row.admissionFee ? parseFloat(row.admissionFee) : 0,
    }));

    return NextResponse.json({
      success: true,
      globalAdmissionsOpen,
      courses,
    });
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
  }
}
