export enum GalleryCategory {
    INFRASTRUCTURE = "Infrastructure",
    STUDENT_LIFE = "Student Life",
    EXCELLENCE = "Excellence",
    OTHER = "Other"
}

export interface GalleryImageOutput {
  gallery_image_id: string;
  title: string | null;
  category: GalleryCategory;
  image_url: string;
  storage_path: string;
  file_size: number | null;
  mime_type: string | null;
  createdBy: string | null;
  display_order: number;
  is_Active: boolean;
  is_deleted: boolean;
  createdAt: string;
}

export async function fetchGalleryImages(category?: string): Promise<GalleryImageOutput[]> {
  const url = new URL("/api/gallery", typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  if (category && category !== "All") {
    url.searchParams.append("category", category);
  }
  url.searchParams.append("t", Date.now().toString());

  const response = await fetch(url.toString(), { 
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch gallery images");
  }

  const data = await response.json();
  return data.data || [];
}

export async function uploadGalleryImage(payload: {
  title?: string;
  category: string;
  image_url: string;
  storage_path: string;
  file_size?: number;
  mime_type?: string;
  createdBy?: string;
  display_order?: number;
}): Promise<GalleryImageOutput> {
  const response = await fetch("/api/gallery", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Include authorization headers here if needed
      // "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to upload gallery image");
  }

  const data = await response.json();
  return data.data;
}

export async function deleteGalleryImage(id: string): Promise<void> {
  const response = await fetch(`/api/gallery?id=${id}`, {
    method: "DELETE",
    // headers: { "Authorization": `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error("Failed to delete gallery image");
  }
}
