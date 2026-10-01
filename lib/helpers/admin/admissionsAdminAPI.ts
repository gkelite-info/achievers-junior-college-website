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
  collegeBranchId: number;
  name: string;
  code: string;
};

export type GlobalAdmissionSetting = {
  collegeAdmissionSettingsId: number;
  collegeId: number;
  isAdmissionsOpen: boolean;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CourseAdmissionSetting = {
  courseAdmissionId: number;
  collegeId: number;
  collegeBranchId: number;
  isAdmissionsOpen: boolean;
  admissionFee: number;
  createdBy?: number;
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
 * Fetches global admission settings for a college
 */
export async function fetchGlobalAdmissionSettings(collegeId = 40): Promise<GlobalAdmissionSetting | null> {
  const { data, error } = await supabase
    .from("college_admission_settings")
    .select("*")
    .eq("collegeId", collegeId)
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
export async function fetchCourseAdmissions(collegeId = 40): Promise<CourseAdmissionSetting[]> {
  const { data, error } = await supabase
    .from("college_course_admissions")
    .select("*")
    .eq("collegeId", collegeId)
    .is("deletedAt", null);

  if (error) {
    console.error("Error fetching course admissions:", error);
    return [];
  }

  return (data || []).map((row) => ({
    ...row,
    admissionFee: typeof row.admissionFee === "string" ? parseFloat(row.admissionFee) : Number(row.admissionFee || 0),
  }));
}

/**
 * Fetches the branches (courses) for Achievers
 */
export async function fetchAdmissionsCourses(collegeId = 40): Promise<AdminBranch[]> {
  const { data, error } = await supabase
    .from("college_branch")
    .select("collegeBranchId, branchName, deletedAt")
    .eq("collegeId", collegeId)
    .is("deletedAt", null)
    .order("collegeBranchId", { ascending: true });

  if (error) {
    console.error("Error fetching admissions courses from college_branch:", error);
    return [];
  }

  return (data || []).map((b) => ({
    collegeBranchId: b.collegeBranchId,
    name: b.branchName,
    code: deriveBranchCode(b.branchName),
  }));
}

/**
 * Upsert global admissions settings
 */
export async function upsertGlobalAdmissionsStatus(
  collegeId = 40,
  adminId = 36,
  isOpen: boolean
) {
  const existing = await fetchGlobalAdmissionSettings(collegeId);
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
        collegeId,
        isAdmissionsOpen: isOpen,
        createdBy: adminId,
        createdAt: now,
        updatedAt: now,
      })
      .select();

    if (error) throw error;
    result = data;
  }

  // Also sync to CollPoll database if client is available
  if (collpollClient) {
    try {
      const { data: cpExisting } = await collpollClient
        .from("college_admission_settings")
        .select("collegeAdmissionSettingsId")
        .eq("collegeId", collegeId)
        .is("deletedAt", null)
        .maybeSingle();

      if (cpExisting) {
        await collpollClient
          .from("college_admission_settings")
          .update({ isAdmissionsOpen: isOpen, updatedAt: now })
          .eq("collegeAdmissionSettingsId", cpExisting.collegeAdmissionSettingsId);
      } else {
        await collpollClient
          .from("college_admission_settings")
          .insert({
            collegeId,
            isAdmissionsOpen: isOpen,
            createdBy: adminId,
            createdAt: now,
            updatedAt: now,
          });
      }
    } catch (err) {
      console.warn("CollPoll sync skipped for global status:", err);
    }
  }

  return result;
}

/**
 * Upsert course admission status or fee
 */
export async function upsertCourseAdmissionConfig(
  collegeId = 40,
  adminId = 36,
  collegeBranchId: number,
  updates: { isAdmissionsOpen?: boolean; admissionFee?: number }
) {
  const { data: existing } = await supabase
    .from("college_course_admissions")
    .select("*")
    .eq("collegeId", collegeId)
    .eq("collegeBranchId", collegeBranchId)
    .is("deletedAt", null)
    .maybeSingle();

  const now = new Date().toISOString();
  let result;

  if (existing) {
    const payload: any = { updatedAt: now };
    if (updates.isAdmissionsOpen !== undefined) payload.isAdmissionsOpen = updates.isAdmissionsOpen;
    if (updates.admissionFee !== undefined) payload.admissionFee = updates.admissionFee;

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
        collegeId,
        collegeBranchId,
        isAdmissionsOpen: updates.isAdmissionsOpen ?? false,
        admissionFee: updates.admissionFee ?? 0,
        createdBy: adminId,
        createdAt: now,
        updatedAt: now,
      })
      .select();

    if (error) throw error;
    result = data;
  }

  // Also sync to CollPoll database if available
  if (collpollClient) {
    try {
      const payload: any = { updatedAt: now };
      if (updates.isAdmissionsOpen !== undefined) payload.isAdmissionsOpen = updates.isAdmissionsOpen;
      if (updates.admissionFee !== undefined) payload.admissionFee = updates.admissionFee;

      const { data: cpExisting } = await collpollClient
        .from("college_course_admissions")
        .select("courseAdmissionId")
        .eq("collegeId", collegeId)
        .eq("collegeBranchId", collegeBranchId)
        .is("deletedAt", null)
        .maybeSingle();

      if (cpExisting) {
        await collpollClient
          .from("college_course_admissions")
          .update(payload)
          .eq("courseAdmissionId", cpExisting.courseAdmissionId);
      } else {
        await collpollClient
          .from("college_course_admissions")
          .insert({
            collegeId,
            collegeBranchId,
            isAdmissionsOpen: updates.isAdmissionsOpen ?? false,
            admissionFee: updates.admissionFee ?? 0,
            createdBy: adminId,
            createdAt: now,
            updatedAt: now,
          });
      }
    } catch (err) {
      console.warn("CollPoll sync skipped for course admission config:", err);
    }
  }

  return result;
}
