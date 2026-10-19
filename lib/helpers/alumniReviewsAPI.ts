import { supabase } from "@/lib/supabaseClient";

export const ALUMNI_STORAGE_BUCKET = "alumni-reviews";

/**
 * Exact representation of PostgreSQL table public.alumni_reviews schema:
 * 
 * create table public.alumni_reviews (
 *   review_id uuid not null primary key,
 *   "visitorId" character varying(36) null,
 *   full_name character varying(100) not null,
 *   email character varying(150) null,
 *   rating integer not null default 5,
 *   review_text text not null,
 *   images jsonb not null default '[]'::jsonb,
 *   "isVisible" boolean not null default true,
 *   "visibilityUpdatedBy" uuid null references auth_users("authUserId"),
 *   "visibilityUpdatedAt" timestamp with time zone null,
 *   "deletedBy" uuid null references auth_users("authUserId"),
 *   "is_Active" boolean not null default true,
 *   is_deleted boolean not null default false,
 *   "createdAt" timestamp with time zone not null,
 *   "updatedAt" timestamp with time zone not null,
 *   "deletedAt" timestamp with time zone null
 * );
 */
export interface AlumniReviewRecord {
  review_id: string; // uuid
  visitorId?: string | null; // character varying(36)
  full_name: string; // character varying(100)
  email?: string | null; // character varying(150)
  rating: number; // integer (1 to 5, default 5)
  review_text: string; // text
  images: string[]; // jsonb array of image URLs
  isVisible: boolean; // boolean (default true)
  visibilityUpdatedBy?: string | null; // uuid
  visibilityUpdatedAt?: string | null; // timestamp with time zone
  deletedBy?: string | null; // uuid
  is_Active: boolean; // boolean (default true)
  is_deleted: boolean; // boolean (default false)
  createdAt: string; // timestamp with time zone
  updatedAt: string; // timestamp with time zone
  deletedAt?: string | null; // timestamp with time zone
}

/** Backward compatibility alias */
export type AlumniReviewData = AlumniReviewRecord;

/** Input payload for creating an alumni review */
export interface CreateAlumniReviewInput {
  review_id?: string;
  visitorId?: string | null;
  full_name: string;
  email?: string | null;
  rating?: number;
  review_text: string;
  images?: string[];
}

/** Input payload for updating an existing alumni review */
export interface UpdateAlumniReviewInput {
  review_id: string;
  full_name?: string;
  email?: string | null;
  rating?: number;
  review_text?: string;
  images?: string[];
  isVisible?: boolean;
  is_Active?: boolean;
  is_deleted?: boolean;
  authUserId?: string | null;
}

/** Supported sorting options */
export type AlumniReviewsSortOption =
  | "newest"
  | "oldest"
  | "rating_desc"
  | "rating_asc"
  | "name_asc"
  | "name_desc"
  | "name";

/** Dynamic filter and pagination parameters */
export interface FetchAlumniReviewsFilters {
  admin?: boolean;
  all?: boolean;
  search?: string;
  status?: "all" | "visible" | "hidden";
  rating?: number;
  minRating?: number;
  visitorId?: string;
  sort?: AlumniReviewsSortOption;
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
}

/** KPI metrics for reviews dashboard */
export interface AlumniReviewsStats {
  total: number;
  visible: number;
  hidden: number;
  avgRating?: number;
  fiveStar?: number;
  fourStar?: number;
  threeStar?: number;
}

/** Dynamic API response shape */
export interface AlumniReviewsResponse {
  reviews: AlumniReviewRecord[];
  stats: AlumniReviewsStats;
  total?: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
}

/** Backward compatibility aliases for admin */
export type AdminReviewsResult = AlumniReviewsResponse;
export type FetchAdminReviewsParams = FetchAlumniReviewsFilters;

/**
 * Builds dynamic URLSearchParams from any combination of filters
 */
export function buildAlumniReviewsQueryParams(
  filters?: FetchAlumniReviewsFilters
): URLSearchParams {
  const params = new URLSearchParams();
  if (!filters) return params;

  if (filters.admin || filters.all) params.set("admin", "true");
  if (filters.search && filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (typeof filters.rating === "number") params.set("rating", String(filters.rating));
  if (typeof filters.minRating === "number") params.set("minRating", String(filters.minRating));
  if (filters.visitorId && filters.visitorId.trim()) params.set("visitorId", filters.visitorId.trim());
  if (filters.sort) params.set("sort", filters.sort);
  if (typeof filters.limit === "number") params.set("limit", String(filters.limit));
  if (typeof filters.offset === "number") params.set("offset", String(filters.offset));
  if (typeof filters.page === "number") params.set("page", String(filters.page));
  if (typeof filters.pageSize === "number") params.set("pageSize", String(filters.pageSize));

  return params;
}

/**
 * Normalizes images field ensuring it's always string[] (handles jsonb strings or arrays)
 */
export function normalizeReviewImages(images: any): string[] {
  if (Array.isArray(images)) return images.filter((img) => typeof img === "string" && img.trim().length > 0);
  if (typeof images === "string" && images.trim().length > 0) {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed.filter((img) => typeof img === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Upload a single image file to the Supabase storage bucket 'alumni-reviews'
 * Returns the public URL of the uploaded image.
 */
export async function uploadAlumniReviewPhoto(file: File, folderId = "uploads"): Promise<string> {
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${folderId}/${Date.now()}_${sanitizedName}`;

  // Try direct upload via Supabase client
  const { data, error } = await supabase.storage
    .from(ALUMNI_STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || "image/jpeg",
    });

  if (error) {
    // If client RLS prevents direct upload, fallback to server upload endpoint
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folderId);

    const res = await fetch("/api/alumni/reviews/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || error.message || "Failed to upload image");
    }

    const resData = await res.json();
    return resData.url;
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(ALUMNI_STORAGE_BUCKET)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Upload multiple image files concurrently
 */
export async function uploadMultipleAlumniPhotos(
  files: File[],
  folderId = "uploads"
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadAlumniReviewPhoto(file, folderId));
  return Promise.all(uploadPromises);
}

/**
 * Dynamic public fetch for published alumni reviews from database
 * Supports dynamic filtering by rating, minRating, search, sorting, and pagination
 */
export async function fetchAlumniReviews(
  filters?: FetchAlumniReviewsFilters
): Promise<AlumniReviewRecord[]> {
  const params = buildAlumniReviewsQueryParams(filters);
  const queryString = params.toString();
  const url = queryString ? `/api/alumni/reviews?${queryString}` : "/api/alumni/reviews";

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch alumni reviews");
  }

  const data = await response.json();
  const rawReviews = data.reviews || [];

  return rawReviews.map((r: any) => ({
    ...r,
    rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
    images: normalizeReviewImages(r.images),
    isVisible: r.isVisible !== false,
    is_Active: r.is_Active !== false,
    is_deleted: r.is_deleted === true,
  }));
}

/**
 * Dynamic admin fetch for all reviews with DB-side search, status filters, rating filters, and KPI stats
 */
export async function fetchAdminAlumniReviews(
  filters?: FetchAlumniReviewsFilters
): Promise<AlumniReviewsResponse> {
  const adminFilters: FetchAlumniReviewsFilters = {
    ...filters,
    admin: true,
  };

  const params = buildAlumniReviewsQueryParams(adminFilters);
  const response = await fetch(`/api/alumni/reviews?${params.toString()}`, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch admin alumni reviews");
  }

  const data = await response.json();
  const rawReviews = data.reviews || [];

  const reviews: AlumniReviewRecord[] = rawReviews.map((r: any) => ({
    ...r,
    rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
    images: normalizeReviewImages(r.images),
    isVisible: r.isVisible !== false,
    is_Active: r.is_Active !== false,
    is_deleted: r.is_deleted === true,
  }));

  return {
    reviews,
    total: typeof data.total === "number" ? data.total : reviews.length,
    stats: data.stats || {
      total: reviews.length,
      visible: reviews.filter((r) => r.isVisible).length,
      hidden: reviews.filter((r) => !r.isVisible).length,
    },
    page: data.page,
    pageSize: data.pageSize,
    hasMore: data.hasMore,
  };
}

/**
 * Fetch a single review by its UUID
 */
export async function fetchAlumniReviewById(
  review_id: string
): Promise<AlumniReviewRecord | null> {
  if (!review_id) return null;

  const response = await fetch(`/api/alumni/reviews?review_id=${encodeURIComponent(review_id)}`, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error("Failed to fetch alumni review");
  }

  const data = await response.json();
  const raw = data.review || (data.reviews && data.reviews[0]);
  if (!raw) return null;

  return {
    ...raw,
    rating: Math.min(5, Math.max(1, Number(raw.rating) || 5)),
    images: normalizeReviewImages(raw.images),
    isVisible: raw.isVisible !== false,
    is_Active: raw.is_Active !== false,
    is_deleted: raw.is_deleted === true,
  };
}

/**
 * Submit a new alumni review with image URLs and visitorId to the database
 */
export async function submitAlumniReview(
  payload: CreateAlumniReviewInput
): Promise<AlumniReviewRecord> {
  const cleanName = payload.full_name?.trim();
  const cleanReview = payload.review_text?.trim();

  if (!cleanName) {
    throw new Error("Full name is required");
  }
  if (!cleanReview) {
    throw new Error("Review text is required");
  }

  const numericRating = Math.min(5, Math.max(1, Number(payload.rating) || 5));

  const response = await fetch("/api/alumni/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      review_id: payload.review_id,
      visitorId: payload.visitorId ? payload.visitorId.trim().substring(0, 36) : null,
      full_name: cleanName.substring(0, 100),
      email: payload.email ? payload.email.trim().toLowerCase().substring(0, 150) : null,
      rating: numericRating,
      review_text: cleanReview,
      images: payload.images || [],
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to save review");
  }

  const raw = result.review;
  return {
    ...raw,
    rating: Math.min(5, Math.max(1, Number(raw.rating) || 5)),
    images: normalizeReviewImages(raw.images),
    isVisible: raw.isVisible !== false,
    is_Active: raw.is_Active !== false,
    is_deleted: raw.is_deleted === true,
  };
}

/**
 * Dynamic update function for alumni review records
 */
export async function updateAlumniReview(
  payload: UpdateAlumniReviewInput
): Promise<AlumniReviewRecord> {
  if (!payload.review_id) {
    throw new Error("review_id is required");
  }

  const response = await fetch("/api/alumni/reviews", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to update review");
  }

  const raw = result.review;
  return {
    ...raw,
    rating: Math.min(5, Math.max(1, Number(raw.rating) || 5)),
    images: normalizeReviewImages(raw.images),
    isVisible: raw.isVisible !== false,
    is_Active: raw.is_Active !== false,
    is_deleted: raw.is_deleted === true,
  };
}

/**
 * Admin action: Update review visibility with authUserId from auth_users table
 */
export async function updateAlumniReviewVisibility(
  review_id: string,
  isVisible: boolean,
  authUserId?: string | null
): Promise<AlumniReviewRecord> {
  return updateAlumniReview({
    review_id,
    isVisible,
    authUserId,
  });
}

/**
 * Admin action: Soft-delete review with authUserId (deletedBy) from auth_users table
 */
export async function deleteAlumniReview(
  review_id: string,
  authUserId?: string | null
): Promise<AlumniReviewRecord> {
  return updateAlumniReview({
    review_id,
    is_deleted: true,
    authUserId,
  });
}
