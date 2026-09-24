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
      trackClientEvent("admission_open", {
        path: `${pathname}?apply=true`,
        formType: "modal_select_course"
      });
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
    // Remove the ?apply=true from URL without refreshing
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
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0047A9]"></div>
            </div>
          )}
          
          {isError && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3">
              <WarningCircle size={20} className="mt-0.5 shrink-0" weight="fill" />
              <p className="text-[14px]">Could not load courses. Please try again later.</p>
            </div>
          )}

          {data && (
            <div className="space-y-4">
              {!data.globalAdmissionsOpen && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 mb-6">
                  <WarningCircle size={20} className="mt-0.5 shrink-0" weight="fill" />
                  <p className="text-[14px] font-medium">Admissions are currently closed for all courses.</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.courses.map((course) => {
                  const isOpen = data.globalAdmissionsOpen && course.isAdmissionsOpen;
                  return (
                    <button
                      key={course.collegeBranchId}
                      onClick={() => handleCourseClick(course.courseName, isOpen, course.admissionFee)}
                      disabled={!isOpen}
                      className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 ${
                        isOpen 
                          ? "border-[#e1e9f2] bg-white hover:border-[#0047A9] hover:shadow-md cursor-pointer group"
                          : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <span className={`text-[20px] font-bold mb-2 ${isOpen ? "text-[#081D36] group-hover:text-[#0047A9]" : "text-gray-400"}`}>
                        {course.courseName}
                      </span>
                      
                      <span className={`px-3 py-1 text-[12px] font-bold rounded-full ${
                        isOpen
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {isOpen ? "Admissions Open" : "Admissions Closed"}
                      </span>

                      {isOpen && course.admissionFee > 0 && (
                        <span className="mt-3 text-[13px] text-[#424654] font-medium">
                          Fee: ₹{course.admissionFee}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
