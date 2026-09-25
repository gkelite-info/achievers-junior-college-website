"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trackClientEvent } from "@/lib/helpers/analyticsClient";

export type UserRecord = {
  userId: number | string;
  applicationNumber: string;
  applicationFor: string;
  course: string;
  academicYear?: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  motherName: string;
  gender: string;
  dateOfBirth: string;
  nationality?: string;
  category: string;
  address: string;
  state: string;
  city: string;
  pinCode: string;
  mobileNumber: string;
  email: string;
  profileImageRef?: string | null;
  registrationFee?: string | number;
  applicationStatus?: string;
  admissionStatus?: "Pending" | "Verification" | "Selected" | "Regret";
  submissionTime?: string | null;
  isActive?: boolean;
  is_deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

export type UserEducationRecord = {
  educationId: number | string;
  userId: number | string;
  qualificationLevel?: string;
  schoolName: string;
  board: string;
  passingYear: string;
  gradeOrPercentage: string;
  medium: string;
  certificateRef?: string | null;
  isActive?: boolean;
  is_deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

export type FullApplicationData = {
  user: UserRecord;
  education: UserEducationRecord | null;
  paymentStatus?: "success" | "pending";
  attachments?: { profileImage?: string; classXCertificate?: string };
};

export type ApplicationInputPayload = {
  submissionId?: string;
  profileImage?: File;
  classXCertificate?: File;
  applicationFor: string;
  course: string;
  registrationFee?: string | number;
  academicYear?: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  motherName: string;
  gender: string;
  dateOfBirth: string;
  nationality?: string;
  category: string;
  address: string;
  state: string;
  city: string;
  pinCode: string;
  mobileNumber: string;
  email: string;
  profileImageRef?: string | null;
  applicationNumber?: string;
  // Class X Education fields
  classXSchool: string;
  classXBoard: string;
  classXYear: string;
  classXPercentage: string;
  classXMedium: string;
  classXCertificateRef?: string | null;
};

export const applicationQueryKeys = {
  all: ["applications"] as const,
  byNumber: (applicationNumber: string) => ["applications", "byNumber", applicationNumber] as const,
  lookup: (applicationNumber: string, mobileNumber: string, dateOfBirth: string) =>
    ["applications", "lookup", applicationNumber, mobileNumber, dateOfBirth] as const,
  education: (userId: string) => ["applications", "education", userId] as const,
};


async function readApplication(response: Response): Promise<FullApplicationData | null> {
  const result = await response.json().catch(() => null);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(result?.error || "Unable to contact the application service. Please try again.");
  if (!result?.application?.user?.applicationNumber) {
    throw new Error("The server did not confirm that the application was saved.");
  }
  return result.application;
}

/** READ: load an application previously verified in this browser. */
export async function getApplication(applicationNumber: string): Promise<FullApplicationData | null> {
  if (!applicationNumber.trim()) return null;
  return readApplication(await fetch(`/api/applications?${new URLSearchParams({ applicationNumber: applicationNumber.trim() })}`, { cache: "no-store" }));
}

export async function lookupApplication(applicationNumber: string, mobileNumber: string, dateOfBirth: string): Promise<FullApplicationData | null> {
  if (!applicationNumber.trim() || !mobileNumber.trim() || !dateOfBirth.trim()) return null;
  return readApplication(await fetch("/api/applications?action=lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ applicationNumber: applicationNumber.trim(), mobileNumber: mobileNumber.trim(), dateOfBirth: dateOfBirth.trim() }),
  }));
}

async function writeApplication(payload: ApplicationInputPayload, method: "POST" | "PUT"): Promise<FullApplicationData> {
  const { profileImage, classXCertificate, ...values } = payload;
  const body = new FormData();
  body.set("payload", JSON.stringify(values));
  if (profileImage) body.set("profileImage", profileImage);
  if (classXCertificate) body.set("classXCertificate", classXCertificate);
  const result = await readApplication(await fetch("/api/applications", { method, body }));
  if (!result) throw new Error("The server did not confirm that the application was saved.");
  return result;
}

/** CREATE: upload the photo/certificate and save personal and education details. */
export async function createApplication(payload: ApplicationInputPayload): Promise<FullApplicationData> {
  if (payload.applicationNumber) throw new Error("Use updateApplication to edit an existing application.");
  return writeApplication({ ...payload, submissionId: payload.submissionId || crypto.randomUUID() }, "POST");
}

/** UPDATE: retain existing files unless replacements are included in the payload. */
export async function updateApplication(applicationNumber: string, payload: ApplicationInputPayload): Promise<FullApplicationData> {
  if (!applicationNumber.trim()) throw new Error("Application number is required to update an application.");
  return writeApplication({ ...payload, applicationNumber: applicationNumber.trim() }, "PUT");
}

/** DELETE: soft-delete the application and its education record together. */
export async function deleteApplication(applicationNumber: string): Promise<{ deleted: true; applicationNumber: string }> {
  const number = applicationNumber.trim();
  if (!number) throw new Error("Application number is required to delete an application.");
  const response = await fetch("/api/applications", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ applicationNumber: number }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error || "Unable to delete the application. Please try again.");
  if (result?.deleted !== true || result.applicationNumber !== number) throw new Error("The server did not confirm that the application was deleted.");
  return { deleted: true, applicationNumber: number };
}

// Compatibility names used by the existing form and query hooks.
export const fetchApplicationByNumber = getApplication;

export function saveApplication(payload: ApplicationInputPayload): Promise<FullApplicationData> {
  return payload.applicationNumber
    ? updateApplication(payload.applicationNumber, payload)
    : createApplication(payload);
}

export function useApplication(applicationNumber: string | null | undefined) {
  return useQuery<FullApplicationData | null>({
    queryKey: applicationQueryKeys.byNumber(applicationNumber || ""),
    queryFn: async () => {
      if (!applicationNumber) return null;
      return fetchApplicationByNumber(applicationNumber);
    },
    enabled: !!applicationNumber,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useApplicationLookup(
  applicationNumber: string,
  mobileNumber: string,
  dateOfBirth: string,
  enabled: boolean = true
) {
  return useQuery<FullApplicationData | null>({
    queryKey: applicationQueryKeys.lookup(applicationNumber, mobileNumber, dateOfBirth),
    queryFn: async () => {
      if (!applicationNumber || !mobileNumber || !dateOfBirth) return null;
      return lookupApplication(applicationNumber, mobileNumber, dateOfBirth);
    },
    enabled: enabled && !!applicationNumber && !!mobileNumber && !!dateOfBirth,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSubmitApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    retry: false,
    mutationFn: async (payload: ApplicationInputPayload) => {
      return saveApplication(payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all });
      if (data?.user?.applicationNumber) {
        queryClient.setQueryData(
          applicationQueryKeys.byNumber(data.user.applicationNumber),
          data
        );
        // Track the form submission event in analytics logs
        trackClientEvent("form_submit", {
          applicationId: typeof data.user.userId === "number" ? data.user.userId : undefined,
          formType: data.user.course || "Standard Application",
          metadata: {
            applicationNumber: data.user.applicationNumber,
            name: `${data.user.firstName} ${data.user.lastName}`,
            email: data.user.email,
          },
        });
      }
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteApplication,
    retry: false,
    onSuccess: async () => {
      // Stop in-flight reads so they cannot restore a deleted record to cache.
      await queryClient.cancelQueries({ queryKey: applicationQueryKeys.all });
      queryClient.removeQueries({ queryKey: applicationQueryKeys.all });
    },
  });
}


export function applicationToDetails(application: FullApplicationData): Record<string, string> {
  const { user, education, attachments } = application;
  const details: Record<string, string> = {};
  for (const [key, value] of Object.entries(user)) {
    if (value !== null && value !== undefined) details[key] = String(value);
  }
  details.paymentStatus = application.paymentStatus || "pending";
  return {
    ...details,
    applicationId: user.applicationNumber,
    phone: user.mobileNumber,
    dateOfBirth: user.dateOfBirth.slice(0, 10),
    registrationFee: String(user.registrationFee ?? 500),
    profileImage: user.profileImageRef || "",
    profilePreview: attachments?.profileImage || "",
    classXSchool: education?.schoolName || "",
    classXBoard: education?.board || "",
    classXYear: education?.passingYear || "",
    classXPercentage: education?.gradeOrPercentage || "",
    classXMedium: education?.medium || "",
    classXCertificate: education?.certificateRef || "",
    certificatePreview: attachments?.classXCertificate || "",
  };
}
