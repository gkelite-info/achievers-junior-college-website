import { supabase } from "@/lib/supabaseClient";
import { createClient } from "@supabase/supabase-js";

// Optional CollPoll sync client if accessible
const collpollUrl = process.env.NEXT_PUBLIC_COLLPOLL_SUPABASE_URL || "https://wieinzdarxemefrzitog.supabase.co";
const collpollAnon = process.env.NEXT_PUBLIC_COLLPOLL_SUPABASE_ANON_KEY || "sb_publishable_-VUXRd-6K5HRh7HZhqWaew_VM7U2gQc";
let collpollClient: any = null;
try {
  if (collpollUrl && collpollAnon) {
    collpollClient = createClient(collpollUrl, collpollAnon);
  }
} catch {
  // Ignored if not configured
}

export type AdminBranch = {
  collegeBranchId: string;
  name: string;
  code: string;
  educationName?: string;
  educationCode?: string;
  isHidden?: boolean;
};

export type GlobalAdmissionSetting = {
  collegeAdmissionSettingsId: number;
  isAdmissionsOpen: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CourseAdmissionSetting = {
  courseAdmissionId: number;
  collegeBranchId: string;
  isAdmissionsOpen: boolean;
  admissionFee: number;
  isHidden?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Derives a clean short code (MPC, BiPC, CEC, MEC, HEC) from course/branch name
 */
export function deriveBranchCode(branchName: string): string {
  const lower = branchName.toLowerCase();
  if (lower.includes("biolog") || lower.includes("bipc")) return "BIPC";
  if (lower.includes("math") && lower.includes("phys") && lower.includes("chem")) return "MPC";
  if (lower.includes("civic") || lower.includes("cec")) return "CEC";
  if (lower.includes("econom") && lower.includes("math")) return "MEC";
  if (lower.includes("hist") || lower.includes("hec")) return "HEC";
  return branchName.slice(0, 4).toUpperCase();
}

/**
 * Fetches global admission settings
 */
export async function fetchGlobalAdmissionSettings(): Promise<GlobalAdmissionSetting | null> {
  const { data, error } = await supabase
    .from("college_admission_settings")
    .select("*")
    .is("deletedAt", null)
    .order("createdAt", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching global admission settings:", error);
    return null;
  }

  return data;
}

/**
 * Fetches the course admissions configurations
 */
export async function fetchCourseAdmissions(): Promise<CourseAdmissionSetting[]> {
  const { data, error } = await supabase
    .from("college_course_admissions")
    .select("*")
    .is("deletedAt", null);

  if (error) {
    console.error("Error fetching course admissions:", error);
    return [];
  }

  return (data || []).map((row) => ({
    ...row,
    collegeBranchId: String(row.college_branch_id),
    admissionFee: typeof row.admissionFee === "string" ? parseFloat(row.admissionFee) : Number(row.admissionFee || 0),
    isHidden: Boolean(row.isHidden),
  }));
}

/**
 * Fetches the branches (courses) for Achievers from college_branches and college_educations
 */
export async function fetchAdmissionsCourses(collegeId = 40): Promise<AdminBranch[]> {
  try {
    const { data, error } = await supabase
      .from("college_branches")
      .select(`
        college_branch_id,
        branchName,
        branch_code,
        college_educations (
          educationName,
          education_code
        )
      `)
      .eq("is_deleted", false)
      .order("createdAt", { ascending: true });

    if (error || !data || data.length === 0) {
      // Fallback via API endpoint
      const res = await fetch("/api/admin/college-branches", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.branches && json.branches.length > 0) {
        return json.branches.map((b: any) => ({
          collegeBranchId: b.college_branch_id,
          name: b.branchName,
          code: b.branch_code || deriveBranchCode(b.branchName),
          educationName: b.educationName,
          educationCode: b.education_code,
        }));
      }
      return [];
    }

    return data.map((b: any) => {
      const edu = Array.isArray(b.college_educations) ? b.college_educations[0] : b.college_educations;
      return {
        collegeBranchId: b.college_branch_id,
        name: b.branchName,
        code: b.branch_code || deriveBranchCode(b.branchName),
        educationName: edu?.educationName || "",
        educationCode: edu?.education_code || "",
      };
    });
  } catch (err) {
    console.error("fetchAdmissionsCourses error:", err);
    return [];
  }
}

/**
 * Upsert global admissions settings
 */
export async function upsertGlobalAdmissionsStatus(
  isOpen: boolean,
  adminId: string = "a12334e7-ecc8-44a3-803b-9935c10caafa"
) {
  const existing = await fetchGlobalAdmissionSettings();
  const now = new Date().toISOString();

  let result;
  if (existing) {
    const { data, error } = await supabase
      .from("college_admission_settings")
      .update({ isAdmissionsOpen: isOpen, updatedAt: now })
      .eq("collegeAdmissionSettingsId", existing.collegeAdmissionSettingsId)
      .select();

    if (error) throw error;
    result = data;
  } else {
    const { data, error } = await supabase
      .from("college_admission_settings")
      .insert({
        isAdmissionsOpen: isOpen,
        createdBy: adminId,
        createdAt: now,
        updatedAt: now,
      })
      .select();

    if (error) throw error;
    result = data;
  }

  return result;
}

/**
 * Upsert course admission status or fee
 */
export async function upsertCourseAdmissionConfig(
  collegeBranchId: string,
  updates: { isAdmissionsOpen?: boolean; admissionFee?: number; isHidden?: boolean },
  adminId: string = "a12334e7-ecc8-44a3-803b-9935c10caafa"
) {
  const { data: existing } = await supabase
    .from("college_course_admissions")
    .select("*")
    .eq("college_branch_id", collegeBranchId)
    .is("deletedAt", null)
    .maybeSingle();

  const now = new Date().toISOString();
  let result;

  if (existing) {
    const payload: any = { updatedAt: now };
    if (updates.isAdmissionsOpen !== undefined) payload.isAdmissionsOpen = updates.isAdmissionsOpen;
    if (updates.admissionFee !== undefined) payload.admissionFee = updates.admissionFee;
    if (updates.isHidden !== undefined) payload.isHidden = updates.isHidden;

    const { data, error } = await supabase
      .from("college_course_admissions")
      .update(payload)
      .eq("courseAdmissionId", existing.courseAdmissionId)
      .select();

    if (error) throw error;
    result = data;
  } else {
    const { data, error } = await supabase
      .from("college_course_admissions")
      .insert({
        college_branch_id: collegeBranchId,
        isAdmissionsOpen: updates.isAdmissionsOpen ?? false,
        admissionFee: updates.admissionFee ?? 0,
        isHidden: updates.isHidden ?? false,
        createdBy: adminId,
        createdAt: now,
        updatedAt: now,
      })
      .select();

    if (error) throw error;
    result = data;
  }

  return result;
}
