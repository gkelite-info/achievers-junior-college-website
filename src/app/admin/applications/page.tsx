"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CourseAdmissions from "./components/CourseAdmissions";
import AdmissionFee from "./components/AdmissionFee";
import AdmissionApplications from "./components/AdmissionApplications";
import { useAdminLoading } from "@/app/admin/context/AdminLoadingContext";

type AdmissionsTab = "courses" | "fees" | "applications";

function ApplicationsScreenShimmer() {
  return (
    <div className="min-h-screen space-y-6 bg-[#f8fafc] p-6">
      <div className="space-y-2">
        <div className="h-7 w-64 rounded-lg shimmer" />
        <div className="h-4 w-96 max-w-full rounded shimmer" />
      </div>
      <div className="mx-auto h-12 w-[520px] max-w-full rounded-full border border-gray-200 shimmer" />
      <div className="min-h-[500px] space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="h-9 w-60 rounded shimmer" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-36 rounded-2xl border border-gray-100 shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ApplicationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { triggerTabShimmer } = useAdminLoading();
  const tabParam = searchParams.get("tab") as AdmissionsTab | null;
  const activeTab: AdmissionsTab =
    tabParam && ["courses", "fees", "applications"].includes(tabParam)
      ? tabParam
      : "courses";

  const handleTabChange = (tab: AdmissionsTab) => {
    triggerTabShimmer(500);
    router.replace(`?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title & Subtitle */}
      <section>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Applications Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage course admissions and configure group-wise admission fees.
        </p>
      </section>

      {/* Pill Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 bg-white p-1.5 rounded-full shadow-sm border border-gray-200/80 w-max mx-auto max-w-full">
        <button
          onClick={() => handleTabChange("courses")}
          type="button"
          className={`cursor-pointer rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "courses"
              ? "bg-[#0E1528] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
          }`}
        >
          Course Admissions
        </button>
        <button
          onClick={() => handleTabChange("fees")}
          type="button"
          className={`cursor-pointer rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "fees"
              ? "bg-[#0E1528] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
          }`}
        >
          Admission Fee Structure
        </button>
        <button
          onClick={() => handleTabChange("applications")}
          type="button"
          className={`cursor-pointer rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "applications"
              ? "bg-[#0E1528] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
          }`}
        >
          Admission Applications
        </button>
      </div>

      {/* Tab Content Box */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-7 min-h-[520px]">
        {activeTab === "courses" && <CourseAdmissions />}
        {activeTab === "fees" && <AdmissionFee />}
        {activeTab === "applications" && <AdmissionApplications />}
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<ApplicationsScreenShimmer />}>
      <ApplicationsContent />
    </Suspense>
  );
}
