import { supabase } from "@/lib/supabaseClient";

export interface CollegeEducation {
  college_education_id: string;
  educationName: string;
  education_code: string;
  createdBy?: string | null;
  is_Active?: boolean;
}

export interface CollegeBranch {
  college_branch_id: string;
  branchName: string;
  branch_code: string;
  college_education_id: string;
  educationName: string;
  education_code: string;
  createdBy?: string | null;
  is_Active?: boolean;
  isPending?: boolean;
}

/**
 * Retrieves the current logged-in admin's authUserId.
 * Checks Supabase Auth session first, then falls back to localStorage admin_user.
 */
export async function getCurrentAuthUserId(): Promise<string | null> {
  try {
    // 1. Check active Supabase Auth session
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id) return user.id;

    // 2. Check localStorage admin_user or user
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin_user") || localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        const id = parsed.authUserId || parsed.id || parsed.userId;
        if (id) return String(id);
      }
    }
  } catch (err) {
    console.error("Error retrieving current authUserId:", err);
  }
  return null;
}

/**
 * Fetches all active college educations and branches.
 */
export async function fetchCollegeData(): Promise<{
  educations: CollegeEducation[];
  branches: CollegeBranch[];
}> {
  try {
    const res = await fetch("/api/admin/college-branches", {
      method: "GET",
      cache: "no-store",
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return {
        educations: data.educations || [],
        branches: data.branches || [],
      };
    }
    return { educations: [], branches: [] };
  } catch (error) {
    console.error("Error fetching college data:", error);
    return { educations: [], branches: [] };
  }
}

/**
 * Saves multiple branches in a batch to the database.
 */
export async function saveCollegeBranchesBatch(payload: {
  branches: Array<{
    college_branch_id?: string;
    educationName: string;
    education_code: string;
    branchName: string;
    branch_code: string;
  }>;
  createdBy?: string | null;
}): Promise<{ success: boolean; branches?: CollegeBranch[]; error?: string }> {
  try {
    const res = await fetch("/api/admin/college-branches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, branches: data.branches };
    }
    return { success: false, error: data.error || "Failed to save branches." };
  } catch (error: any) {
    console.error("Error saving branches batch:", error);
    return { success: false, error: error.message || "Network error." };
  }
}

/**
 * Creates or updates college education and creates a new college branch.
 * Attaches the createdBy authUserId.
 */
export async function createCollegeBranch(payload: {
  educationName: string;
  education_code: string;
  branchName: string;
  branch_code: string;
  createdBy?: string | null;
}): Promise<{ success: boolean; branch?: CollegeBranch; error?: string }> {
  try {
    const res = await fetch("/api/admin/college-branches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, branch: data.branch };
    }
    return { success: false, error: data.error || "Failed to create branch." };
  } catch (error: any) {
    console.error("Error creating college branch:", error);
    return { success: false, error: error.message || "Network error." };
  }
}

/**
 * Soft deletes a college branch.
 */
export async function deleteCollegeBranch(
  branchId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/admin/college-branches?id=${encodeURIComponent(branchId)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true };
    }
    return { success: false, error: data.error || "Failed to delete branch." };
  } catch (error: any) {
    console.error("Error deleting college branch:", error);
    return { success: false, error: error.message || "Network error." };
  }
}
