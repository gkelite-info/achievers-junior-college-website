"use client";

import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  Eye,
  EyeSlash,
  X,
  Globe,
  Power,
  CheckCircle,
  Lock,
  SpinnerGap,
} from "@phosphor-icons/react";
import {
  fetchAdmissionsCourses,
  fetchGlobalAdmissionSettings,
  fetchCourseAdmissions,
  upsertGlobalAdmissionsStatus,
  upsertCourseAdmissionConfig,
  AdminBranch,
} from "@/lib/helpers/admin/admissionsAdminAPI";
import { CourseCardShimmer } from "@/app/admin/components/Shimmers";
import { Pagination } from "@/app/admin/components/Pagination";
import { useAdminLoading } from "@/app/admin/context/AdminLoadingContext";
import toast from "react-hot-toast";

export default function CourseAdmissions() {
  const adminId = "a12334e7-ecc8-44a3-803b-9935c10caafa";
  const { isPageLoading } = useAdminLoading();
  const [courses, setCourses] = useState<AdminBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [admissionsState, setAdmissionsState] = useState<Record<string, boolean>>({});
  const [hiddenState, setHiddenState] = useState<Record<string, boolean>>({});
  const [globalAdmissions, setGlobalAdmissions] = useState(false);

  // Confirmation Modal States
  const [confirmGlobalModal, setConfirmGlobalModal] = useState<{
    isOpen: boolean;
    targetState: boolean;
  } | null>(null);

  const [confirmAdmissionModal, setConfirmAdmissionModal] = useState<{
    course: AdminBranch;
    targetOpen: boolean;
  } | null>(null);

  const [confirmHideModal, setConfirmHideModal] = useState<{
    course: AdminBranch;
    targetHidden: boolean;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const loadData = async () => {
    try {
      const [branches, globalSettings, courseSettings] = await Promise.all([
        fetchAdmissionsCourses(),
        fetchGlobalAdmissionSettings(),
        fetchCourseAdmissions(),
      ]);

      setCourses(branches);
      if (globalSettings) {
        setGlobalAdmissions(globalSettings.isAdmissionsOpen);
      }

      const initialAdmission: Record<string, boolean> = {};
      const initialHidden: Record<string, boolean> = {};
      branches.forEach((b) => {
        initialAdmission[b.collegeBranchId] = false;
        initialHidden[b.collegeBranchId] = false;
      });

      if (courseSettings && courseSettings.length > 0) {
        courseSettings.forEach((cs) => {
          initialAdmission[cs.collegeBranchId] = cs.isAdmissionsOpen;
          initialHidden[cs.collegeBranchId] = Boolean(cs.isHidden);
        });
      }

      setAdmissionsState(initialAdmission);
      setHiddenState(initialHidden);
    } catch (error) {
      console.error("Failed to load admissions data:", error);
      toast.error("Failed to load courses data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Confirm & Execute Global ON/OFF
  const executeToggleGlobal = async () => {
    if (!confirmGlobalModal) return;
    const newState = confirmGlobalModal.targetState;
    setIsProcessing(true);

    // Optimistically update
    setGlobalAdmissions(newState);
    const updatedState: Record<string, boolean> = {};
    courses.forEach((c) => {
      updatedState[c.collegeBranchId] = newState;
    });
    setAdmissionsState(updatedState);
    setConfirmGlobalModal(null);

    try {
      await upsertGlobalAdmissionsStatus(newState, adminId);
      const coursePromises = courses.map((course) =>
        upsertCourseAdmissionConfig(course.collegeBranchId, { isAdmissionsOpen: newState }, adminId)
      );
      await Promise.all(coursePromises);
      toast.success(
        newState ? "Admissions opened for all courses!" : "Admissions closed for all courses!"
      );
    } catch (error) {
      console.error("Error saving global setting:", error);
      setGlobalAdmissions(!newState);
      toast.error("Failed to update all courses. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Confirm & Execute Single Course ON/OFF
  const executeToggleCourse = async () => {
    if (!confirmAdmissionModal) return;
    const { course, targetOpen } = confirmAdmissionModal;
    const id = course.collegeBranchId;
    const currentState = admissionsState[id] ?? false;
    setIsProcessing(true);

    // Optimistic update
    setAdmissionsState((prev) => ({ ...prev, [id]: targetOpen }));
    setConfirmAdmissionModal(null);

    try {
      await upsertCourseAdmissionConfig(id, { isAdmissionsOpen: targetOpen }, adminId);
      toast.success(
        targetOpen
          ? `Admissions opened for ${course.name}.`
          : `Admissions closed for ${course.name}.`
      );
    } catch (error) {
      console.error("Error saving course setting:", error);
      setAdmissionsState((prev) => ({ ...prev, [id]: currentState }));
      toast.error("Failed to update course status.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Confirm & Execute Single Course Hide / Unhide
  const executeToggleHide = async () => {
    if (!confirmHideModal) return;
    const { course, targetHidden } = confirmHideModal;
    const id = course.collegeBranchId;
    const isCurrentlyHidden = hiddenState[id] ?? false;
    setIsProcessing(true);

    // Optimistic update
    setHiddenState((prev) => ({ ...prev, [id]: targetHidden }));
    setConfirmHideModal(null);

    try {
      await upsertCourseAdmissionConfig(id, { isHidden: targetHidden }, adminId);
      toast.success(
        targetHidden
          ? `${course.name} is now hidden from the application form.`
          : `${course.name} is now visible on the application form.`
      );
    } catch (error) {
      console.error("Error toggling hide status:", error);
      setHiddenState((prev) => ({ ...prev, [id]: isCurrentlyHidden }));
      toast.error("Failed to update course visibility.");
    } finally {
      setIsProcessing(false);
    }
  };

  const paginatedCourses = courses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Global Admissions Status Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50/80 p-5 rounded-2xl border border-gray-100 gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Global Admissions Status</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Turn admissions ON/OFF for all courses at once.
          </p>
        </div>
        <button
          onClick={() =>
            setConfirmGlobalModal({
              isOpen: true,
              targetState: !globalAdmissions,
            })
          }
          type="button"
          aria-label="Toggle Global Admissions"
          className={`relative inline-flex h-7 w-12 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
            globalAdmissions ? "bg-[#0E1528]" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
              globalAdmissions ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Offered Courses Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-gray-900">Offered Courses</h3>
          <p className="text-xs text-gray-500">Configure admission status per course stream</p>
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading || isPageLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CourseCardShimmer key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedCourses.map((course) => {
            const isOpen = admissionsState[course.collegeBranchId] ?? false;
            const isHidden = hiddenState[course.collegeBranchId] ?? false;

            return (
              <div
                key={course.collegeBranchId}
                className={`flex flex-col justify-between p-5 rounded-2xl border transition-all gap-4 bg-white shadow-sm hover:shadow-md ${
                  isHidden ? "border-amber-200/80 bg-amber-50/10" : "border-gray-100"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col pr-1">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">
                      {course.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                      {course.code}
                    </span>
                    <button
                      onClick={() =>
                        setConfirmHideModal({
                          course,
                          targetHidden: !isHidden,
                        })
                      }
                      type="button"
                      aria-label={isHidden ? `Unhide ${course.name}` : `Hide ${course.name}`}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isHidden
                          ? "bg-amber-100/70 text-amber-800 border-amber-300 hover:bg-amber-100"
                          : "bg-white text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                      title={
                        isHidden
                          ? "Course is hidden in Select Course modal. Click to unhide."
                          : "Click to hide course from Select Course modal."
                      }
                    >
                      {isHidden ? (
                        <EyeSlash size={14} weight="bold" className="text-amber-700" />
                      ) : (
                        <Eye size={14} weight="bold" />
                      )}
                      <span>{isHidden ? "Hidden" : "Hide"}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">Admissions</span>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold tracking-wider ${
                        isOpen ? "text-[#0E1528]" : "text-gray-400"
                      }`}
                    >
                      {isOpen ? "OPEN" : "CLOSED"}
                    </span>
                    <button
                      onClick={() =>
                        setConfirmAdmissionModal({
                          course,
                          targetOpen: !isOpen,
                        })
                      }
                      type="button"
                      aria-label={`Toggle admissions for ${course.name}`}
                      className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
                        isOpen ? "bg-[#0E1528]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          isOpen ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
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

      {/* 1. Global Admissions Status Confirmation Modal */}
      <Transition appear show={!!confirmGlobalModal?.isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[10000]"
          onClose={() => !isProcessing && setConfirmGlobalModal(null)}
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
                    onClick={() => setConfirmGlobalModal(null)}
                    disabled={isProcessing}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg cursor-pointer disabled:opacity-50"
                    aria-label="Close"
                  >
                    <X size={18} weight="bold" />
                  </button>

                  {/* Centered Circular Icon */}
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border ${
                      confirmGlobalModal?.targetState
                        ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]"
                        : "bg-[#FEF2F2] border-[#FEE2E2] text-[#DC2626]"
                    }`}
                  >
                    {confirmGlobalModal?.targetState ? (
                      <Globe size={26} weight="bold" />
                    ) : (
                      <Power size={26} weight="bold" />
                    )}
                  </div>

                  <Dialog.Title
                    as="h3"
                    className="text-[20px] font-bold text-[#111827] text-center mb-2"
                  >
                    {confirmGlobalModal?.targetState
                      ? "Open Admissions Globally?"
                      : "Close Admissions Globally?"}
                  </Dialog.Title>

                  <p className="text-[13.5px] text-[#64748B] text-center max-w-[310px] mx-auto leading-relaxed mb-6">
                    {confirmGlobalModal?.targetState
                      ? "This will open admissions for all course streams simultaneously. Students will be able to apply online."
                      : "This will close admissions for all course streams simultaneously. New student applications will be paused."}
                  </p>

                  <div className="flex items-center justify-center gap-3 mt-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-[#D0D5DD] bg-white hover:bg-gray-50 text-[14px] font-semibold text-[#344054] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      onClick={() => setConfirmGlobalModal(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-50 ${
                        confirmGlobalModal?.targetState
                          ? "bg-[#0E1528] hover:bg-slate-800"
                          : "bg-[#DC2626] hover:bg-[#B91C1C]"
                      }`}
                      onClick={executeToggleGlobal}
                    >
                      {isProcessing ? (
                        <SpinnerGap size={16} className="animate-spin" />
                      ) : confirmGlobalModal?.targetState ? (
                        <>
                          <Globe size={16} weight="bold" />
                          <span>Open All</span>
                        </>
                      ) : (
                        <>
                          <Power size={16} weight="bold" />
                          <span>Close All</span>
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

      {/* 2. Course Admission ON/OFF Confirmation Modal */}
      <Transition appear show={!!confirmAdmissionModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[10000]"
          onClose={() => !isProcessing && setConfirmAdmissionModal(null)}
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
                    onClick={() => setConfirmAdmissionModal(null)}
                    disabled={isProcessing}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg cursor-pointer disabled:opacity-50"
                    aria-label="Close"
                  >
                    <X size={18} weight="bold" />
                  </button>

                  {/* Centered Circular Icon */}
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border ${
                      confirmAdmissionModal?.targetOpen
                        ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]"
                        : "bg-[#FEF2F2] border-[#FEE2E2] text-[#DC2626]"
                    }`}
                  >
                    {confirmAdmissionModal?.targetOpen ? (
                      <CheckCircle size={26} weight="bold" />
                    ) : (
                      <Lock size={26} weight="bold" />
                    )}
                  </div>

                  <Dialog.Title
                    as="h3"
                    className="text-[20px] font-bold text-[#111827] text-center mb-2"
                  >
                    {confirmAdmissionModal?.targetOpen
                      ? "Open Admissions?"
                      : "Close Admissions?"}
                  </Dialog.Title>

                  <p className="text-[13.5px] text-[#64748B] text-center max-w-[310px] mx-auto leading-relaxed mb-6">
                    {confirmAdmissionModal?.targetOpen ? (
                      <>
                        Admissions for{" "}
                        <strong className="text-gray-800">
                          {confirmAdmissionModal.course.name} (
                          {confirmAdmissionModal.course.code})
                        </strong>{" "}
                        will be opened for new applications.
                      </>
                    ) : (
                      <>
                        Admissions for{" "}
                        <strong className="text-gray-800">
                          {confirmAdmissionModal?.course.name} (
                          {confirmAdmissionModal?.course.code})
                        </strong>{" "}
                        will be closed. Students will not be able to select this course.
                      </>
                    )}
                  </p>

                  <div className="flex items-center justify-center gap-3 mt-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-[#D0D5DD] bg-white hover:bg-gray-50 text-[14px] font-semibold text-[#344054] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      onClick={() => setConfirmAdmissionModal(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-50 ${
                        confirmAdmissionModal?.targetOpen
                          ? "bg-[#0E1528] hover:bg-slate-800"
                          : "bg-[#DC2626] hover:bg-[#B91C1C]"
                      }`}
                      onClick={executeToggleCourse}
                    >
                      {isProcessing ? (
                        <SpinnerGap size={16} className="animate-spin" />
                      ) : confirmAdmissionModal?.targetOpen ? (
                        <>
                          <CheckCircle size={16} weight="bold" />
                          <span>Open</span>
                        </>
                      ) : (
                        <>
                          <Lock size={16} weight="bold" />
                          <span>Close</span>
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

      {/* 3. Course Hide / Unhide Confirmation Modal */}
      <Transition appear show={!!confirmHideModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[10000]"
          onClose={() => !isProcessing && setConfirmHideModal(null)}
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
                    onClick={() => setConfirmHideModal(null)}
                    disabled={isProcessing}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg cursor-pointer disabled:opacity-50"
                    aria-label="Close"
                  >
                    <X size={18} weight="bold" />
                  </button>

                  {/* Centered Circular Icon */}
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border ${
                      confirmHideModal?.targetHidden
                        ? "bg-[#FFFBEB] border-[#FEF3C7] text-[#D97706]"
                        : "bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]"
                    }`}
                  >
                    {confirmHideModal?.targetHidden ? (
                      <EyeSlash size={26} weight="bold" />
                    ) : (
                      <Eye size={26} weight="bold" />
                    )}
                  </div>

                  <Dialog.Title
                    as="h3"
                    className="text-[20px] font-bold text-[#111827] text-center mb-2"
                  >
                    {confirmHideModal?.targetHidden
                      ? "Hide This Course?"
                      : "Make Course Visible?"}
                  </Dialog.Title>

                  <p className="text-[13.5px] text-[#64748B] text-center max-w-[310px] mx-auto leading-relaxed mb-6">
                    {confirmHideModal?.targetHidden ? (
                      <>
                        <strong className="text-gray-800">
                          {confirmHideModal.course.name} (
                          {confirmHideModal.course.code})
                        </strong>{" "}
                        will be hidden from the student course selection form.
                      </>
                    ) : (
                      <>
                        <strong className="text-gray-800">
                          {confirmHideModal?.course.name} (
                          {confirmHideModal?.course.code})
                        </strong>{" "}
                        will become visible again on the student course selection form.
                      </>
                    )}
                  </p>

                  <div className="flex items-center justify-center gap-3 mt-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-[#D0D5DD] bg-white hover:bg-gray-50 text-[14px] font-semibold text-[#344054] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      onClick={() => setConfirmHideModal(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-50 ${
                        confirmHideModal?.targetHidden
                          ? "bg-[#D97706] hover:bg-[#B45309]"
                          : "bg-[#059669] hover:bg-[#047857]"
                      }`}
                      onClick={executeToggleHide}
                    >
                      {isProcessing ? (
                        <SpinnerGap size={16} className="animate-spin" />
                      ) : confirmHideModal?.targetHidden ? (
                        <>
                          <EyeSlash size={16} weight="bold" />
                          <span>Hide Course</span>
                        </>
                      ) : (
                        <>
                          <Eye size={16} weight="bold" />
                          <span>Show Course</span>
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
