import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  try {
    const client = await pool.connect();
    
    // Create the table if it doesn't exist just in case
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.gallery_images (
        "gallery_image_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" VARCHAR(255),
        "category" VARCHAR(50) NOT NULL,
        "image_url" TEXT NOT NULL,
        "storage_path" TEXT NOT NULL,
        "file_size" BIGINT,
        "mime_type" VARCHAR(100),
        "createdBy" UUID,
        "display_order" INTEGER NOT NULL DEFAULT 0,
        "is_Active" BOOLEAN NOT NULL DEFAULT true,
        "is_deleted" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deletedAt" TIMESTAMPTZ
      );
    `);

    let query = `SELECT * FROM public.gallery_images WHERE "is_deleted" = false`;
    const params: any[] = [];
    
    if (category && category !== "All") {
      query += ` AND "category" = $1`;
      params.push(category);
    }
    
    query += ` ORDER BY "createdAt" DESC`;
    
    const result = await client.query(query, params);
    client.release();
    
    return NextResponse.json(
      { success: true, data: result.rows },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    console.error("GET Gallery error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, image_url, storage_path, file_size, mime_type, createdBy, display_order } = body;
    
    if (!category || !image_url || !storage_path) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const client = await pool.connect();
    
    // Create the table if it doesn't exist just in case
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.gallery_images (
        "gallery_image_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" VARCHAR(255),
        "category" VARCHAR(50) NOT NULL,
        "image_url" TEXT NOT NULL,
        "storage_path" TEXT NOT NULL,
        "file_size" BIGINT,
        "mime_type" VARCHAR(100),
        "createdBy" UUID,
        "display_order" INTEGER NOT NULL DEFAULT 0,
        "is_Active" BOOLEAN NOT NULL DEFAULT true,
        "is_deleted" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deletedAt" TIMESTAMPTZ
      );
    `);
    
    const galleryImageId = randomUUID();

    const query = `
      INSERT INTO public.gallery_images (
        "gallery_image_id", "title", "category", "image_url", "storage_path", "file_size", "mime_type", "createdBy", "display_order", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *;
    `;
    const params = [galleryImageId, title, category, image_url, storage_path, file_size || null, mime_type || null, createdBy || null, display_order || 0];
    
    const result = await client.query(query, params);
    client.release();
    
    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error("POST Gallery error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, message: "Missing ID parameter" }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    
    // Soft delete
    const query = `
      UPDATE public.gallery_images 
      SET "is_deleted" = true, "is_Active" = false, "deletedAt" = NOW() 
      WHERE "gallery_image_id" = $1
      RETURNING *;
    `;
    
    const result = await client.query(query, [id]);
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Image not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Image deleted" });
  } catch (error: any) {
    console.error("DELETE Gallery error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
