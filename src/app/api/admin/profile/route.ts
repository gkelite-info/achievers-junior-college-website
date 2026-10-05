import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authUserId = searchParams.get("authUserId");

  if (!authUserId) {
    return NextResponse.json({ success: false, message: "authUserId is required" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM public.auth_users WHERE "authUserId" = $1 LIMIT 1;`,
      [authUserId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("GET Admin Profile Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { authUserId, firstName, lastName, email, mobile, gender } = body;

    if (!authUserId) {
      return NextResponse.json({ success: false, message: "authUserId is required" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const query = `
        UPDATE public.auth_users
        SET 
          "firstName" = COALESCE($1, "firstName"),
          "lastName" = COALESCE($2, "lastName"),
          "email" = COALESCE($3, "email"),
          "mobile" = COALESCE($4, "mobile"),
          "gender" = COALESCE($5, "gender"),
          "updatedAt" = NOW()
        WHERE "authUserId" = $6
        RETURNING *;
      `;
      const values = [
        firstName?.trim() ?? null,
        lastName?.trim() ?? null,
        email?.trim() ?? null,
        mobile?.trim() ?? null,
        gender?.trim() ?? null,
        authUserId,
      ];

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: "Profile updated successfully",
        data: result.rows[0],
      });
    } catch (dbError: any) {
      if (dbError.code === "23505") {
        return NextResponse.json(
          { success: false, message: "Email or mobile number is already in use by another account." },
          { status: 409 }
        );
      }
      throw dbError;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("PATCH Admin Profile Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to update profile" }, { status: 500 });
  }
}
