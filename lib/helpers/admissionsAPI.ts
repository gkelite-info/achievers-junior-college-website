"use client";

import { useQuery } from "@tanstack/react-query";

export type CourseAdmissionInfo = {
  collegeBranchId: number;
  courseName: string;
  isAdmissionsOpen: boolean;
  admissionFee: number;
};

export type AdmissionsData = {
  success: boolean;
  globalAdmissionsOpen: boolean;
  courses: CourseAdmissionInfo[];
};

export function useAdmissions() {
  return useQuery<AdmissionsData>({
    queryKey: ["admissions"],
    queryFn: async () => {
      const response = await fetch("/api/admissions");
      if (!response.ok) {
        throw new Error("Failed to fetch admissions data");
      }
      return response.json();
    },
  });
}
