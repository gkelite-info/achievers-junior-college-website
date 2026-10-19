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
      const trimmed = candidateVisitorId.trim().substring(0, 36);
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
    return candidateVisitorId ? candidateVisitorId.substring(0, 36) : null;
  }
}

/**
 * GET: Dynamic query handler supporting filtering, search, sorting, and pagination
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("review_id")?.trim();
    const isAdmin = searchParams.get("admin") === "true" || searchParams.get("all") === "true";
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "all";
    const sort = searchParams.get("sort")?.trim() || "newest";
    const ratingParam = searchParams.get("rating");
    const minRatingParam = searchParams.get("minRating");
    const visitorId = searchParams.get("visitorId")?.trim();

    const limitParam = searchParams.get("limit") || searchParams.get("pageSize");
    const offsetParam = searchParams.get("offset");
    const pageParam = searchParams.get("page");

    const client = await pool.connect();

    // 1. Single review by ID lookup
    if (reviewId) {
      const singleRes = await client.query(
        `SELECT 
          review_id,
          "visitorId",
          full_name,
          email,
          rating,
          review_text,
          images,
          "isVisible",
          "visibilityUpdatedBy",
          "visibilityUpdatedAt",
          "deletedBy",
          "is_Active",
          is_deleted,
          "createdAt",
          "updatedAt",
          "deletedAt"
        FROM public.alumni_reviews
        WHERE review_id = $1 AND is_deleted = false
        LIMIT 1`,
        [reviewId]
      );
      client.release();

      if (singleRes.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Review not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        review: singleRes.rows[0],
      });
    }

    // 2. Fetch KPI metrics from DB for admin
    let stats = {
      total: 0,
      visible: 0,
      hidden: 0,
      avgRating: 5,
      fiveStar: 0,
      fourStar: 0,
      threeStar: 0,
    };

    if (isAdmin) {
      const statsQuery = `
        SELECT 
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE "isVisible" = true)::int AS visible,
          COUNT(*) FILTER (WHERE "isVisible" = false)::int AS hidden,
          COALESCE(ROUND(AVG(rating)::numeric, 1)::float, 5.0) AS "avgRating",
          COUNT(*) FILTER (WHERE rating = 5)::int AS "fiveStar",
          COUNT(*) FILTER (WHERE rating = 4)::int AS "fourStar",
          COUNT(*) FILTER (WHERE rating = 3)::int AS "threeStar"
        FROM public.alumni_reviews
        WHERE is_deleted = false
      `;
      const statsRes = await client.query(statsQuery);
      if (statsRes.rows.length > 0) {
        const row = statsRes.rows[0];
        stats = {
          total: Number(row.total || 0),
          visible: Number(row.visible || 0),
          hidden: Number(row.hidden || 0),
          avgRating: Number(row.avgRating || 5),
          fiveStar: Number(row.fiveStar || 0),
          fourStar: Number(row.fourStar || 0),
          threeStar: Number(row.threeStar || 0),
        };
      }
    }

    // 3. Build dynamic query conditions
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

    // Exact Rating filter
    if (ratingParam !== null && !isNaN(Number(ratingParam))) {
      params.push(Number(ratingParam));
      conditions.push(`rating = $${params.length}`);
    }

    // Min Rating filter
    if (minRatingParam !== null && !isNaN(Number(minRatingParam))) {
      params.push(Number(minRatingParam));
      conditions.push(`rating >= $${params.length}`);
    }

    // Visitor ID filter
    if (visitorId) {
      params.push(visitorId);
      conditions.push(`"visitorId" = $${params.length}`);
    }

    // Search query across full_name, email, and review_text
    if (search) {
      params.push(`%${search}%`);
      const searchParamIdx = params.length;
      conditions.push(`(full_name ILIKE $${searchParamIdx} OR email ILIKE $${searchParamIdx} OR review_text ILIKE $${searchParamIdx})`);
    }

    // Total count query for pagination
    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM public.alumni_reviews
      WHERE ${conditions.join(" AND ")}
    `;
    const countRes = await client.query(countQuery, params);
    const totalCount = countRes.rows[0]?.total || 0;

    // Sorting
    let orderByClause = `ORDER BY "createdAt" DESC`;
    if (sort === "oldest") {
      orderByClause = `ORDER BY "createdAt" ASC`;
    } else if (sort === "rating_desc") {
      orderByClause = `ORDER BY rating DESC, "createdAt" DESC`;
    } else if (sort === "rating_asc") {
      orderByClause = `ORDER BY rating ASC, "createdAt" DESC`;
    } else if (sort === "name_asc" || sort === "name") {
      orderByClause = `ORDER BY full_name ASC`;
    } else if (sort === "name_desc") {
      orderByClause = `ORDER BY full_name DESC`;
    } else {
      orderByClause = `ORDER BY "createdAt" DESC`;
    }

    // Pagination clauses
    let paginationClause = "";
    let limitNum: number | null = null;
    let offsetNum: number | null = null;

    if (limitParam !== null && !isNaN(Number(limitParam))) {
      limitNum = Math.max(1, Number(limitParam));
      if (pageParam !== null && !isNaN(Number(pageParam))) {
        const pageNum = Math.max(1, Number(pageParam));
        offsetNum = (pageNum - 1) * limitNum;
      } else if (offsetParam !== null && !isNaN(Number(offsetParam))) {
        offsetNum = Math.max(0, Number(offsetParam));
      }

      params.push(limitNum);
      paginationClause += ` LIMIT $${params.length}`;

      if (offsetNum !== null) {
        params.push(offsetNum);
        paginationClause += ` OFFSET $${params.length}`;
      }
    }

    const query = `
      SELECT 
        review_id,
        "visitorId",
        full_name,
        email,
        rating,
        review_text,
        images,
        "isVisible",
        "visibilityUpdatedBy",
        "visibilityUpdatedAt",
        "deletedBy",
        "is_Active",
        is_deleted,
        "createdAt",
        "updatedAt",
        "deletedAt"
      FROM public.alumni_reviews 
      WHERE ${conditions.join(" AND ")}
      ${orderByClause}
      ${paginationClause}
    `;

    const result = await client.query(query, params);
    client.release();

    return NextResponse.json(
      {
        success: true,
        reviews: result.rows,
        total: totalCount,
        stats,
        page: pageParam ? Number(pageParam) : 1,
        pageSize: limitNum || result.rows.length,
        hasMore: offsetNum !== null && limitNum !== null ? offsetNum + result.rows.length < totalCount : false,
      },
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

/**
 * POST: Create a new alumni review record
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      review_id,
      full_name,
      review_text,
      email,
      rating = 5,
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

    const numericRating = Math.min(5, Math.max(1, Number(rating) || 5));
    const targetReviewId = review_id || randomUUID();

    // Extract IP address from request headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : (request.headers.get("x-real-ip") || null);

    // Process any uploaded base64 photos and upload to Supabase Storage
    const processedImages: string[] = [];
    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const url = await uploadBase64Image(images[i], targetReviewId, i);
        if (url && typeof url === "string") {
          processedImages.push(url);
        }
      }
    }

    const client = await pool.connect();

    // Resolve visitorId from public.application_analytics_logs
    const resolvedVisitorId = await resolveVisitorId(client, visitorId, ipAddress);

    const query = `
      INSERT INTO public.alumni_reviews (
        review_id,
        "visitorId",
        full_name,
        email,
        rating,
        review_text,
        images,
        "isVisible",
        "visibilityUpdatedBy",
        "visibilityUpdatedAt",
        "deletedBy",
        "is_Active",
        is_deleted,
        "createdAt",
        "updatedAt",
        "deletedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7::jsonb, true, null, null, null, true, false, NOW(), NOW(), null
      ) RETURNING *;
    `;

    const params = [
      targetReviewId,
      resolvedVisitorId ? resolvedVisitorId.substring(0, 36) : null,
      full_name.trim().substring(0, 100),
      email ? email.trim().toLowerCase().substring(0, 150) : null,
      numericRating,
      review_text.trim(),
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
 * PATCH: Dynamic update for visibility, soft delete, rating, or review content
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      review_id,
      isVisible,
      is_deleted,
      is_Active,
      rating,
      full_name,
      email,
      review_text,
      images,
      authUserId,
    } = body;

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

    const updateClauses: string[] = ['"updatedAt" = NOW()'];
    const updateParams: any[] = [];

    // Soft delete handling
    if (typeof is_deleted === "boolean" && is_deleted) {
      updateClauses.push("is_deleted = true");
      updateClauses.push('"is_Active" = false');
      updateParams.push(validAuthUserId);
      updateClauses.push(`"deletedBy" = $${updateParams.length}`);
      updateClauses.push('"deletedAt" = NOW()');
    } else if (typeof is_deleted === "boolean" && !is_deleted) {
      updateClauses.push("is_deleted = false");
      updateClauses.push('"deletedAt" = null');
    }

    // Visibility toggle handling
    if (typeof isVisible === "boolean") {
      updateParams.push(isVisible);
      updateClauses.push(`"isVisible" = $${updateParams.length}`);
      updateParams.push(validAuthUserId);
      updateClauses.push(`"visibilityUpdatedBy" = $${updateParams.length}`);
      updateClauses.push('"visibilityUpdatedAt" = NOW()');
    }

    // Active toggle
    if (typeof is_Active === "boolean") {
      updateParams.push(is_Active);
      updateClauses.push(`"is_Active" = $${updateParams.length}`);
    }

    // Rating update
    if (rating !== undefined && rating !== null) {
      const numRating = Math.min(5, Math.max(1, Number(rating) || 5));
      updateParams.push(numRating);
      updateClauses.push(`rating = $${updateParams.length}`);
    }

    // Full name update
    if (typeof full_name === "string" && full_name.trim()) {
      updateParams.push(full_name.trim().substring(0, 100));
      updateClauses.push(`full_name = $${updateParams.length}`);
    }

    // Email update
    if (typeof email === "string") {
      updateParams.push(email.trim().toLowerCase().substring(0, 150));
      updateClauses.push(`email = $${updateParams.length}`);
    }

    // Review text update
    if (typeof review_text === "string" && review_text.trim()) {
      updateParams.push(review_text.trim());
      updateClauses.push(`review_text = $${updateParams.length}`);
    }

    // Images update
    if (Array.isArray(images)) {
      updateParams.push(JSON.stringify(images));
      updateClauses.push(`images = $${updateParams.length}::jsonb`);
    }

    if (updateClauses.length === 1) {
      client.release();
      return NextResponse.json(
        { success: false, message: "No fields provided to update" },
        { status: 400 }
      );
    }

    updateParams.push(review_id);
    const targetIdx = updateParams.length;

    const query = `
      UPDATE public.alumni_reviews
      SET ${updateClauses.join(", ")}
      WHERE review_id = $${targetIdx}
      RETURNING *;
    `;

    const result = await client.query(query, updateParams);
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
