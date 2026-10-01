import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET() {
  const client = await pool.connect();
  try {
    const educationsQuery = `
      SELECT 
        college_education_id,
        "educationName",
        education_code,
        "createdBy",
        "is_Active",
        "createdAt",
        "updatedAt"
      FROM public.college_educations
      WHERE is_deleted = false
      ORDER BY "createdAt" ASC
    `;
    const educationsRes = await client.query(educationsQuery);

    const branchesQuery = `
      SELECT 
        b.college_branch_id,
        b."branchName",
        b.branch_code,
        b.college_education_id,
        b."createdBy",
        b."is_Active",
        b."createdAt",
        b."updatedAt",
        e."educationName",
        e.education_code
      FROM public.college_branches b
      JOIN public.college_educations e ON b.college_education_id = e.college_education_id
      WHERE b.is_deleted = false AND e.is_deleted = false
      ORDER BY b."createdAt" ASC
    `;
    const branchesRes = await client.query(branchesQuery);

    return NextResponse.json({
      success: true,
      educations: educationsRes.rows,
      branches: branchesRes.rows,
    });
  } catch (error: any) {
    console.error("Error fetching college educations and branches:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch data" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { createdBy, branches } = body;

    // Normalise to an array of branches
    const branchItems: Array<{
      college_branch_id?: string;
      educationName: string;
      education_code: string;
      branchName: string;
      branch_code: string;
    }> = Array.isArray(branches) && branches.length > 0
      ? branches
      : body.educationName
      ? [{
          college_branch_id: body.college_branch_id,
          educationName: body.educationName,
          education_code: body.education_code,
          branchName: body.branchName,
          branch_code: body.branch_code,
        }]
      : [];

    if (branchItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one branch with Education Name, Education Code, Branch Name, and Branch Code is required." },
        { status: 400 }
      );
    }

    // Verify if createdBy exists in auth_users, otherwise null to satisfy FK constraint
    let validCreatedBy: string | null = null;
    if (createdBy) {
      const checkUserRes = await client.query(
        `SELECT "authUserId" FROM public.auth_users WHERE "authUserId" = $1 LIMIT 1`,
        [createdBy]
      );
      if (checkUserRes.rows.length > 0) {
        validCreatedBy = checkUserRes.rows[0].authUserId;
      }
    }

    await client.query("BEGIN");

    const insertedBranches = [];

    for (const item of branchItems) {
      const { college_branch_id, educationName, education_code, branchName, branch_code } = item;
      if (!educationName || !education_code || !branchName || !branch_code) {
        continue;
      }

      // 1. Check or insert into public.college_educations
      const findEduQuery = `
        SELECT college_education_id, "educationName", education_code
        FROM public.college_educations
        WHERE LOWER("educationName") = LOWER($1) AND is_deleted = false
        LIMIT 1
      `;
      const findEduRes = await client.query(findEduQuery, [educationName.trim()]);

      let collegeEducationId: string;

      if (findEduRes.rows.length > 0) {
        collegeEducationId = findEduRes.rows[0].college_education_id;
        // Update education_code if changed
        if (findEduRes.rows[0].education_code !== education_code.trim()) {
          await client.query(
            `UPDATE public.college_educations SET education_code = $1, "updatedAt" = NOW() WHERE college_education_id = $2`,
            [education_code.trim(), collegeEducationId]
          );
        }
      } else {
        collegeEducationId = randomUUID();
        const insertEduQuery = `
          INSERT INTO public.college_educations (
            college_education_id,
            "educationName",
            education_code,
            "createdBy",
            "is_Active",
            is_deleted,
            "createdAt",
            "updatedAt"
          ) VALUES ($1, $2, $3, $4, true, false, NOW(), NOW())
          RETURNING college_education_id
        `;
        await client.query(insertEduQuery, [
          collegeEducationId,
          educationName.trim(),
          education_code.trim(),
          validCreatedBy,
        ]);
      }

      // 2. If existing branch ID provided and not a temp id, update it
      if (college_branch_id && !college_branch_id.startsWith("temp-")) {
        const checkBranch = await client.query(
          `SELECT college_branch_id FROM public.college_branches WHERE college_branch_id = $1 AND is_deleted = false LIMIT 1`,
          [college_branch_id]
        );
        if (checkBranch.rows.length > 0) {
          const updateBranchQuery = `
            UPDATE public.college_branches
            SET "branchName" = $1, branch_code = $2, college_education_id = $3, "updatedAt" = NOW()
            WHERE college_branch_id = $4
            RETURNING *
          `;
          const updateBranchRes = await client.query(updateBranchQuery, [
            branchName.trim(),
            branch_code.trim(),
            collegeEducationId,
            college_branch_id,
          ]);

          insertedBranches.push({
            ...updateBranchRes.rows[0],
            educationName: educationName.trim(),
            education_code: education_code.trim(),
          });
          continue;
        }
      }

      // 3. Otherwise insert into public.college_branches
      const newCollegeBranchId = randomUUID();
      const insertBranchQuery = `
        INSERT INTO public.college_branches (
          college_branch_id,
          "branchName",
          branch_code,
          college_education_id,
          "createdBy",
          "is_Active",
          is_deleted,
          "createdAt",
          "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, true, false, NOW(), NOW())
        RETURNING *
      `;
      const insertBranchRes = await client.query(insertBranchQuery, [
        newCollegeBranchId,
        branchName.trim(),
        branch_code.trim(),
        collegeEducationId,
        validCreatedBy,
      ]);

      insertedBranches.push({
        ...insertBranchRes.rows[0],
        educationName: educationName.trim(),
        education_code: education_code.trim(),
      });
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      branches: insertedBranches,
      branch: insertedBranches[0],
    });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Error creating college branches:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create branches" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(request: NextRequest) {
  const client = await pool.connect();
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("id");

    if (!branchId) {
      return NextResponse.json({ success: false, error: "Branch ID is required" }, { status: 400 });
    }

    const deleteQuery = `
      UPDATE public.college_branches
      SET is_deleted = true, "deletedAt" = NOW(), "updatedAt" = NOW()
      WHERE college_branch_id = $1
    `;
    await client.query(deleteQuery, [branchId]);

    return NextResponse.json({ success: true, message: "Branch deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting college branch:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete branch" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
