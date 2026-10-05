"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X, WarningCircle } from "@phosphor-icons/react";
import { useAdmissions } from "@/lib/helpers/admissionsAPI";
import { trackClientEvent } from "@/lib/helpers/analyticsClient";

export default function ApplyModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const showModal = searchParams.get("apply") === "true";
  const { data, isLoading, isError } = useAdmissions();
  
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (showModal) {
      setIsOpen(true);
      document.body.style.overflow = "hidden";
      
    } else {
      setIsOpen(false);
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal, pathname]);

  if (!isOpen) return null;

  const handleClose = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("apply");
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const handleCourseClick = (courseName: string, isAdmissionsOpen: boolean, fee: number) => {
    if (!isAdmissionsOpen) return;
    handleClose();
    router.push(`/apply?course=${encodeURIComponent(courseName)}&fee=${fee}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#081D36]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-[#e1e9f2] shrink-0">
          <h2 className="text-[20px] font-bold text-[#081D36]">Select Course for Admission</h2>
          <button 
            onClick={handleClose}
            className="text-[#8ea3be] hover:text-[#081D36] transition-colors p-1"
          >
            <X size={24} weight="bold" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl border border-gray-100 gap-3 min-h-[170px] shimmer"
                >
                  <div className="h-6 w-3/4 rounded-lg bg-gray-200/70" />
                  <div className="h-5 w-28 rounded-full bg-gray-200/70" />
                  <div className="h-4 w-20 rounded bg-gray-200/70" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3">
              <WarningCircle size={20} className="mt-0.5 shrink-0" weight="fill" />
              <p className="text-[14px]">Could not load courses. Please try again later.</p>
            </div>
          )}

          {!isLoading && data && (
            <div className="space-y-4">
              {(() => {
                const visibleCourses = data.courses.filter((course) => !course.isHidden);

                if (visibleCourses.length === 0) {
                  return (
                    <div className="py-16 text-center text-gray-500 font-medium">
                      No data available
                    </div>
                  );
                }

                const allClosed = visibleCourses.every((c) => !c.isAdmissionsOpen);

                return (
                  <>
                    {allClosed && (
                      <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 mb-6">
                        <WarningCircle size={20} className="mt-0.5 shrink-0" weight="fill" />
                        <p className="text-[14px] font-medium">Admissions are currently closed for all courses.</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {visibleCourses.map((course) => {
                        const isOpen = course.isAdmissionsOpen;

                      return (
                        <button
                          key={course.collegeBranchId}
                          onClick={() => handleCourseClick(course.courseName, isOpen, course.admissionFee)}
                          disabled={!isOpen}
                          className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-200 text-center ${
                            isOpen
                              ? "border-[#dbeafe] bg-white hover:border-[#0047A9] hover:shadow-md cursor-pointer group"
                              : "border-gray-100 bg-gray-50/80 cursor-not-allowed opacity-80"
                          }`}
                        >
                          <span
                            className={`text-[20px] font-bold leading-snug mb-2 ${
                              isOpen
                                ? "text-[#081D36] group-hover:text-[#0047A9] transition-colors"
                                : "text-[#94a3b8]"
                            }`}
                          >
                            {course.courseName}
                          </span>

                          <span
                            className={`px-3.5 py-1 text-[12px] font-bold rounded-full ${
                              isOpen
                                ? "bg-[#dcfce7] text-[#15803d]"
                                : "bg-[#fee2e2] text-[#ef4444]"
                            }`}
                          >
                            {isOpen ? "Admissions Open" : "Admissions Closed"}
                          </span>

                          {isOpen && course.admissionFee > 0 && (
                            <span className="mt-3 text-[14px] text-[#475569] font-medium">
                              Fee: ₹{course.admissionFee}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
