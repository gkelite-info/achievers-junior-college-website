"use client";

import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  CurrencyInr,
  PencilSimple,
  Check,
  SpinnerGap,
  X,
} from "@phosphor-icons/react";
import {
  fetchAdmissionsCourses,
  fetchCourseAdmissions,
  upsertCourseAdmissionConfig,
  AdminBranch,
} from "@/lib/helpers/admin/admissionsAdminAPI";
import { CourseCardShimmer } from "@/app/admin/components/Shimmers";
import { Pagination } from "@/app/admin/components/Pagination";
import { useAdminLoading } from "@/app/admin/context/AdminLoadingContext";
import toast from "react-hot-toast";

export default function AdmissionFee() {
  const adminId = "a12334e7-ecc8-44a3-803b-9935c10caafa";
  const { isPageLoading } = useAdminLoading();
  const [courses, setCourses] = useState<AdminBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [feeState, setFeeState] = useState<Record<string, number>>({});

  // Global fee state
  const [globalFee, setGlobalFee] = useState<number>(0);
  const [isEditingGlobal, setIsEditingGlobal] = useState(false);
  const [savingGlobal, setSavingGlobal] = useState(false);

  // Individual fee inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Confirmation modal states
  const [confirmFeeModal, setConfirmFeeModal] = useState<{
    course: AdminBranch;
    newAmount: number;
  } | null>(null);

  const [confirmGlobalFeeModal, setConfirmGlobalFeeModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const loadData = async () => {
    try {
      const [branches, courseSettings] = await Promise.all([
        fetchAdmissionsCourses(),
        fetchCourseAdmissions(),
      ]);

      setCourses(branches);

      const initialFee: Record<string, number> = {};
      branches.forEach((b) => {
        initialFee[b.collegeBranchId] = 0;
      });

      if (courseSettings && courseSettings.length > 0) {
        courseSettings.forEach((cs) => {
          initialFee[cs.collegeBranchId] = cs.admissionFee || 0;
        });
      }

      setFeeState(initialFee);
    } catch (error) {
      console.error("Failed to load fee data:", error);
      toast.error("Failed to load fee configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateAmount = (id: string, amount: number) => {
    setFeeState((prev) => ({ ...prev, [id]: amount }));
  };

  // Trigger modal before saving course fee
  const promptSaveCourseFee = (course: AdminBranch) => {
    const amount = feeState[course.collegeBranchId] ?? 0;
    setConfirmFeeModal({ course, newAmount: amount });
  };

  // Execute course fee save after confirmation
  const executeSaveFee = async () => {
    if (!confirmFeeModal) return;
    const { course, newAmount } = confirmFeeModal;
    const id = course.collegeBranchId;
    setIsProcessing(true);

    try {
      await upsertCourseAdmissionConfig(id, { admissionFee: newAmount }, adminId);
      setEditingId(null);
      setConfirmFeeModal(null);
      toast.success(
        `Admission fee for ${course.name} updated to ₹ ${newAmount.toLocaleString("en-IN")}.`
      );
    } catch (error) {
      console.error("Error saving fee:", error);
      toast.error("Failed to update admission fee.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger modal before applying global fee
  const promptSaveGlobalFee = () => {
    setConfirmGlobalFeeModal(true);
  };

  // Execute global fee save after confirmation
  const executeSaveGlobalFee = async () => {
    setIsProcessing(true);
    setSavingGlobal(true);
    setConfirmGlobalFeeModal(false);

    try {
      const updatedState: Record<string, number> = {};
      courses.forEach((c) => {
        updatedState[c.collegeBranchId] = globalFee;
      });
      setFeeState(updatedState);

      const coursePromises = courses.map((course) =>
        upsertCourseAdmissionConfig(course.collegeBranchId, { admissionFee: globalFee }, adminId)
      );
      await Promise.all(coursePromises);
      setIsEditingGlobal(false);
      toast.success(
        `Global admission fee of ₹ ${globalFee.toLocaleString("en-IN")} applied to all courses!`
      );
    } catch (error) {
      console.error("Error saving global fee:", error);
      toast.error("Failed to update all courses.");
    } finally {
      setIsProcessing(false);
      setSavingGlobal(false);
    }
  };

  const paginatedCourses = courses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Global Admission Fee Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50/80 p-5 rounded-2xl border border-gray-100 gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Global Admission Fee</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Apply a single fee amount to all courses instantly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditingGlobal ? (
            <>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <CurrencyInr size={18} weight="bold" />
                </span>
                <input
                  type="number"
                  value={globalFee || ""}
                  onChange={(e) => setGlobalFee(Number(e.target.value))}
                  placeholder="0"
                  min="0"
                  autoFocus
                  className="w-36 pl-8 pr-3 py-2 bg-white border-2 border-[#0E1528] rounded-xl text-base font-bold text-[#0E1528] focus:outline-none transition-colors"
                />
              </div>
              <button
                onClick={promptSaveGlobalFee}
                disabled={isProcessing || savingGlobal || globalFee < 0}
                className="flex min-w-[110px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0E1528] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1a2542] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingGlobal ? (
                  <SpinnerGap size={18} className="animate-spin" />
                ) : (
                  "Apply to All"
                )}
              </button>
            </>
          ) : (
            <>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <CurrencyInr size={18} weight="bold" />
                </span>
                <div className="w-36 pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-base font-bold text-[#0E1528]">
                  {globalFee ? globalFee.toLocaleString("en-IN") : "0"}
                </div>
              </div>
              <button
                onClick={() => setIsEditingGlobal(true)}
                className="flex items-center justify-center min-w-[90px] gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
              >
                <PencilSimple size={16} /> Edit
              </button>
            </>
          )}
        </div>
      </div>

      {/* Fee Structure by Course Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-gray-900">Fee Structure by Course</h3>
          <p className="text-xs text-gray-500">Define admission fees based on different courses.</p>
        </div>
      </div>

      {/* Course Fee Cards Grid */}
      {loading || isPageLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CourseCardShimmer key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedCourses.map((course) => {
            const amount = feeState[course.collegeBranchId] ?? 0;
            const isEditing = editingId === course.collegeBranchId;

            return (
              <div
                key={course.collegeBranchId}
                className="flex flex-col p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md bg-white gap-4 relative overflow-hidden transition-all"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0E1528]" />

                <div className="flex justify-between items-start gap-2 pl-2">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">
                    {course.name}
                  </h4>
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg shrink-0">
                    {course.code}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 mt-2 pl-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-gray-500">Fee Amount (INR)</label>
                    {isEditing ? (
                      <button
                        onClick={() => promptSaveCourseFee(course)}
                        disabled={isProcessing}
                        className="cursor-pointer rounded-lg p-1.5 bg-[#0E1528]/10 text-[#0E1528] hover:bg-[#0E1528]/20 transition-colors"
                        title="Save fee"
                      >
                        <Check size={16} weight="bold" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingId(course.collegeBranchId)}
                        className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Edit fee"
                      >
                        <PencilSimple size={16} />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <CurrencyInr size={18} weight="bold" />
                    </span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={amount || ""}
                        onChange={(e) =>
                          handleUpdateAmount(course.collegeBranchId, Number(e.target.value))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            promptSaveCourseFee(course);
                          }
                        }}
                        placeholder="0"
                        min="0"
                        autoFocus
                        className="w-full pl-8 pr-3 py-2 bg-white border-2 border-[#0E1528] rounded-xl text-lg font-bold text-[#0E1528] focus:outline-none transition-colors"
                      />
                    ) : (
                      <div className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-[#0E1528]">
                        {amount ? amount.toLocaleString("en-IN") : "0"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {paginatedCourses.length === 0 && (
            <div className="col-span-full py-16 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-2xl font-medium">
              No data available
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!(loading || isPageLoading) && courses.length > 0 && (
        <div className="mt-2">
          <Pagination
            currentPage={currentPage}
            totalItems={courses.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            roundedBottom="rounded-2xl"
            alwaysShow={true}
          />
        </div>
      )}

      {/* 1. Course Admission Fee Confirmation Modal */}
      <Transition appear show={!!confirmFeeModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[10000]"
          onClose={() => !isProcessing && setConfirmFeeModal(null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative w-full max-w-[420px] transform overflow-hidden rounded-[24px] bg-white p-6 sm:p-8 text-center shadow-2xl transition-all border border-gray-100">
                  <button
                    onClick={() => setConfirmFeeModal(null)}
                    disabled={isProcessing}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg cursor-pointer disabled:opacity-50"
                    aria-label="Close"
                  >
                    <X size={18} weight="bold" />
                  </button>

                  {/* Centered Circular Icon */}
                  <div className="w-14 h-14 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] flex items-center justify-center mx-auto mb-4">
                    <CurrencyInr size={26} weight="bold" />
                  </div>

                  <Dialog.Title
                    as="h3"
                    className="text-[20px] font-bold text-[#111827] text-center mb-2"
                  >
                    Save Course Fee?
                  </Dialog.Title>

                  <p className="text-[13.5px] text-[#64748B] text-center max-w-[310px] mx-auto leading-relaxed mb-6">
                    {confirmFeeModal && (
                      <>
                        Set admission fee for{" "}
                        <strong className="text-gray-800">
                          {confirmFeeModal.course.name} (
                          {confirmFeeModal.course.code})
                        </strong>{" "}
                        to{" "}
                        <strong className="text-[#0E1528] font-bold">
                          ₹ {confirmFeeModal.newAmount.toLocaleString("en-IN")}
                        </strong>
                        ?
                      </>
                    )}
                  </p>

                  <div className="flex items-center justify-center gap-3 mt-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-[#D0D5DD] bg-white hover:bg-gray-50 text-[14px] font-semibold text-[#344054] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      onClick={() => setConfirmFeeModal(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#0E1528] hover:bg-slate-800 text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                      onClick={executeSaveFee}
                    >
                      {isProcessing ? (
                        <SpinnerGap size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Check size={16} weight="bold" />
                          <span>Confirm & Save</span>
                        </>
                      )}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* 2. Global Admission Fee Confirmation Modal */}
      <Transition appear show={confirmGlobalFeeModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[10000]"
          onClose={() => !isProcessing && setConfirmGlobalFeeModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative w-full max-w-[420px] transform overflow-hidden rounded-[24px] bg-white p-6 sm:p-8 text-center shadow-2xl transition-all border border-gray-100">
                  <button
                    onClick={() => setConfirmGlobalFeeModal(false)}
                    disabled={isProcessing}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg cursor-pointer disabled:opacity-50"
                    aria-label="Close"
                  >
                    <X size={18} weight="bold" />
                  </button>

                  {/* Centered Circular Icon */}
                  <div className="w-14 h-14 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] flex items-center justify-center mx-auto mb-4">
                    <CurrencyInr size={26} weight="bold" />
                  </div>

                  <Dialog.Title
                    as="h3"
                    className="text-[20px] font-bold text-[#111827] text-center mb-2"
                  >
                    Apply Global Fee?
                  </Dialog.Title>

                  <p className="text-[13.5px] text-[#64748B] text-center max-w-[310px] mx-auto leading-relaxed mb-6">
                    This will set the admission fee to{" "}
                    <strong className="text-[#0E1528] font-bold">
                      ₹ {globalFee.toLocaleString("en-IN")}
                    </strong>{" "}
                    for <strong className="text-gray-800">ALL courses</strong> simultaneously.
                  </p>

                  <div className="flex items-center justify-center gap-3 mt-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-[#D0D5DD] bg-white hover:bg-gray-50 text-[14px] font-semibold text-[#344054] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      onClick={() => setConfirmGlobalFeeModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#0E1528] hover:bg-slate-800 text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                      onClick={executeSaveGlobalFee}
                    >
                      {isProcessing ? (
                        <SpinnerGap size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Check size={16} weight="bold" />
                          <span>Apply to All</span>
                        </>
                      )}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
