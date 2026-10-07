import { supabase } from "@/lib/supabaseClient";

export const ALUMNI_STORAGE_BUCKET = "alumni-reviews";

export interface AlumniReviewData {
  review_id?: string;
  full_name: string;
  review_text: string;
  email?: string | null;
  is_Active?: boolean;
  is_deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  visitorId?: string | null;
  images: string[];
  isVisible?: boolean;
  visibilityUpdatedBy?: string | null;
  visibilityUpdatedAt?: string | null;
  deletedBy?: string | null;
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
export async function uploadMultipleAlumniPhotos(files: File[], folderId = "uploads"): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadAlumniReviewPhoto(file, folderId));
  return Promise.all(uploadPromises);
}

/**
 * Fetch all published alumni reviews from the database
 */
export async function fetchAlumniReviews(): Promise<AlumniReviewData[]> {
  const response = await fetch("/api/alumni/reviews", {
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
  return data.reviews || [];
}

export interface FetchAdminReviewsParams {
  search?: string;
  status?: "all" | "visible" | "hidden";
  sort?: "newest" | "oldest" | "name";
}

export interface AdminReviewsResult {
  reviews: AlumniReviewData[];
  stats: {
    total: number;
    visible: number;
    hidden: number;
  };
}

/**
 * Fetch all alumni reviews (including hidden) with DB search & filtering for the Admin Dashboard
 */
export async function fetchAdminAlumniReviews(
  params?: FetchAdminReviewsParams
): Promise<AdminReviewsResult> {
  const query = new URLSearchParams({ admin: "true" });
  if (params?.search && params.search.trim()) {
    query.set("search", params.search.trim());
  }
  if (params?.status && params.status !== "all") {
    query.set("status", params.status);
  }
  if (params?.sort) {
    query.set("sort", params.sort);
  }

  const response = await fetch(`/api/alumni/reviews?${query.toString()}`, {
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
  return {
    reviews: data.reviews || [],
    stats: data.stats || {
      total: 0,
      visible: 0,
      hidden: 0,
    },
  };
}

/**
 * Submit a new alumni review with image URLs and visitorId to the database
 */
export async function submitAlumniReview(payload: {
  full_name: string;
  review_text: string;
  email?: string | null;
  images?: string[];
  visitorId?: string | null;
}): Promise<AlumniReviewData> {
  const response = await fetch("/api/alumni/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to save review");
  }

  return result.review;
}

/**
 * Admin action: Update review visibility with authUserId from auth_users table
 */
export async function updateAlumniReviewVisibility(
  review_id: string,
  isVisible: boolean,
  authUserId?: string | null
): Promise<AlumniReviewData> {
  const response = await fetch("/api/alumni/reviews", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ review_id, isVisible, authUserId }),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to update review visibility");
  }

  return result.review;
}

/**
 * Admin action: Soft-delete review with authUserId (deletedBy) from auth_users table
 */
export async function deleteAlumniReview(
  review_id: string,
  authUserId?: string | null
): Promise<AlumniReviewData> {
  const response = await fetch("/api/alumni/reviews", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ review_id, is_deleted: true, authUserId }),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to delete review");
  }

  return result.review;
}
