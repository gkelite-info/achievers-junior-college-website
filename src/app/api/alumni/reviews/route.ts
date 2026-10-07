import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mzbctopjpftwnkqpuqhf.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, serviceRoleKey);
}

// Upload a base64 image string to Supabase Storage in 'alumni-reviews' bucket
async function uploadBase64Image(dataUrl: string, reviewId: string, index: number): Promise<string> {
  if (!dataUrl.startsWith("data:")) {
    return dataUrl;
  }

  try {
    const supabase = getSupabaseAdmin();
    const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const extension = mimeType.split("/")[1] || "jpeg";
    const base64Data = dataUrl.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const filePath = `${reviewId}/${Date.now()}_${index}.${extension}`;
    
    const { error: uploadError } = await supabase.storage
      .from("alumni-reviews")
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);
      return dataUrl;
    }

    const { data: urlData } = supabase.storage
      .from("alumni-reviews")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (err) {
    console.error("Error processing base64 image:", err);
    return dataUrl;
  }
}

/**
 * Fetch or verify visitorId against public.application_analytics_logs
 */
async function resolveVisitorId(client: any, candidateVisitorId?: string | null, ipAddress?: string | null): Promise<string | null> {
  try {
    // 1. If candidate visitorId provided, check if it exists in application_analytics_logs
    if (candidateVisitorId && candidateVisitorId.trim()) {
      const trimmed = candidateVisitorId.trim();
      const existing = await client.query(
        `SELECT "visitorId" FROM public.application_analytics_logs WHERE "visitorId" = $1 LIMIT 1`,
        [trimmed]
      );
      if (existing.rows.length > 0) {
        return existing.rows[0].visitorId;
      }
      
      // If it doesn't exist yet, insert a trace log into application_analytics_logs
      await client.query(
        `INSERT INTO public.application_analytics_logs (
          "visitorId", "eventType", "formType", path, "ipAddress", "createdAt", "updatedAt"
        ) VALUES ($1, 'alumni_review_visit', 'alumni_review', '/alumni', $2, NOW(), NOW())`,
        [trimmed, ipAddress || null]
      );
      return trimmed;
    }

    // 2. If no visitorId sent, try to fetch the most recent visitorId by IP from application_analytics_logs
    if (ipAddress && ipAddress !== "unknown") {
      const byIp = await client.query(
        `SELECT "visitorId" FROM public.application_analytics_logs 
         WHERE "ipAddress" = $1 
         ORDER BY "createdAt" DESC 
         LIMIT 1`,
        [ipAddress]
      );
      if (byIp.rows.length > 0) {
        return byIp.rows[0].visitorId;
      }
    }

    // 3. Fallback: generate a fresh visitorId and log it
    const newVisitorId = randomUUID();
    await client.query(
      `INSERT INTO public.application_analytics_logs (
        "visitorId", "eventType", "formType", path, "ipAddress", "createdAt", "updatedAt"
      ) VALUES ($1, 'alumni_review_visit', 'alumni_review', '/alumni', $2, NOW(), NOW())`,
      [newVisitorId, ipAddress || null]
    );
    return newVisitorId;
  } catch (err) {
    console.warn("Could not resolve visitorId against application_analytics_logs:", err);
    return candidateVisitorId || null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true" || searchParams.get("all") === "true";
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "all";
    const sort = searchParams.get("sort")?.trim() || "newest";

    const client = await pool.connect();

    // 1. Fetch KPI metrics from DB for admin
    let stats = { total: 0, visible: 0, hidden: 0 };
    if (isAdmin) {
      const statsQuery = `
        SELECT 
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE "isVisible" = true)::int AS visible,
          COUNT(*) FILTER (WHERE "isVisible" = false)::int AS hidden
        FROM public.alumni_reviews
        WHERE is_deleted = false
      `;
      const statsRes = await client.query(statsQuery);
      if (statsRes.rows.length > 0) {
        stats = {
          total: Number(statsRes.rows[0].total || 0),
          visible: Number(statsRes.rows[0].visible || 0),
          hidden: Number(statsRes.rows[0].hidden || 0),
        };
      }
    }

    // 2. Build filtered query from DB
    const conditions: string[] = ["is_deleted = false"];
    const params: any[] = [];

    if (!isAdmin) {
      conditions.push(`"is_Active" = true AND "isVisible" = true`);
    } else {
      if (status === "visible") {
        conditions.push(`"isVisible" = true`);
      } else if (status === "hidden") {
        conditions.push(`"isVisible" = false`);
      }
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(full_name ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }

    let orderByClause = `ORDER BY "createdAt" DESC`;
    if (sort === "oldest") {
      orderByClause = `ORDER BY "createdAt" ASC`;
    } else if (sort === "name") {
      orderByClause = `ORDER BY full_name ASC`;
    } else {
      orderByClause = `ORDER BY "createdAt" DESC`;
    }

    const query = `
      SELECT 
        review_id,
        full_name,
        review_text,
        email,
        "is_Active",
        is_deleted,
        "createdAt",
        "updatedAt",
        "deletedAt",
        "visitorId",
        images,
        "isVisible",
        "visibilityUpdatedBy",
        "visibilityUpdatedAt",
        "deletedBy"
      FROM public.alumni_reviews 
      WHERE ${conditions.join(" AND ")}
      ${orderByClause}
    `;

    const result = await client.query(query, params);
    client.release();

    return NextResponse.json(
      { success: true, reviews: result.rows, stats },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    console.error("GET /api/alumni/reviews error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      full_name,
      review_text,
      email,
      images = [],
      visitorId,
    } = body;

    if (!full_name || !full_name.trim()) {
      return NextResponse.json(
        { success: false, message: "Full name is required" },
        { status: 400 }
      );
    }

    if (!review_text || !review_text.trim()) {
      return NextResponse.json(
        { success: false, message: "Review text is required" },
        { status: 400 }
      );
    }

    // Extract IP address from request headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : (request.headers.get("x-real-ip") || null);

    const reviewId = randomUUID();

    // Process any uploaded base64 photos and upload to Supabase Storage
    const processedImages: string[] = [];
    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const url = await uploadBase64Image(images[i], reviewId, i);
        processedImages.push(url);
      }
    }

    const client = await pool.connect();

    // Resolve visitorId from public.application_analytics_logs
    const resolvedVisitorId = await resolveVisitorId(client, visitorId, ipAddress);

    const query = `
      INSERT INTO public.alumni_reviews (
        review_id,
        full_name,
        review_text,
        email,
        "is_Active",
        is_deleted,
        "createdAt",
        "updatedAt",
        "visitorId",
        images,
        "isVisible",
        "visibilityUpdatedBy",
        "visibilityUpdatedAt",
        "deletedBy"
      ) VALUES ($1, $2, $3, $4, true, false, NOW(), NOW(), $5, $6::jsonb, true, null, null, null)
      RETURNING *;
    `;

    const params = [
      reviewId,
      full_name.trim(),
      review_text.trim(),
      email ? email.trim() : null,
      resolvedVisitorId,
      JSON.stringify(processedImages),
    ];

    const result = await client.query(query, params);
    client.release();

    return NextResponse.json(
      {
        success: true,
        review: result.rows[0],
        message: "Review uploaded successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/alumni/reviews error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create review" },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Admin update for visibility (isVisible, visibilityUpdatedBy) or soft delete (deletedBy)
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { review_id, isVisible, is_deleted, authUserId } = body;

    if (!review_id) {
      return NextResponse.json(
        { success: false, message: "review_id is required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    // Verify authUserId exists in public.auth_users if provided
    let validAuthUserId: string | null = null;
    if (authUserId) {
      const userRes = await client.query(
        `SELECT "authUserId" FROM public.auth_users WHERE "authUserId" = $1 LIMIT 1`,
        [authUserId]
      );
      if (userRes.rows.length > 0) {
        validAuthUserId = userRes.rows[0].authUserId;
      }
    }

    let result;
    if (typeof is_deleted === "boolean" && is_deleted) {
      // Soft-delete review
      result = await client.query(
        `UPDATE public.alumni_reviews
         SET is_deleted = true,
             "is_Active" = false,
             "deletedBy" = $1,
             "deletedAt" = NOW(),
             "updatedAt" = NOW()
         WHERE review_id = $2
         RETURNING *`,
        [validAuthUserId, review_id]
      );
    } else if (typeof isVisible === "boolean") {
      // Update visibility
      result = await client.query(
        `UPDATE public.alumni_reviews
         SET "isVisible" = $1,
             "visibilityUpdatedBy" = $2,
             "visibilityUpdatedAt" = NOW(),
             "updatedAt" = NOW()
         WHERE review_id = $3
         RETURNING *`,
        [isVisible, validAuthUserId, review_id]
      );
    } else {
      client.release();
      return NextResponse.json(
        { success: false, message: "No valid update field provided (isVisible or is_deleted)" },
        { status: 400 }
      );
    }

    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      review: result.rows[0],
      message: "Review updated successfully",
    });
  } catch (error: any) {
    console.error("PATCH /api/alumni/reviews error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update review" },
      { status: 500 }
    );
  }
}
