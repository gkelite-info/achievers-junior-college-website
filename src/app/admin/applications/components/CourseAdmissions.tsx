"use client";

import { useEffect, useState } from "react";
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
import toast from "react-hot-toast";

export default function CourseAdmissions() {
  const collegeId = 40;
  const adminId = 36;
  const [courses, setCourses] = useState<AdminBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [admissionsState, setAdmissionsState] = useState<Record<number, boolean>>({});
  const [globalAdmissions, setGlobalAdmissions] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const loadData = async () => {
    try {
      const [branches, globalSettings, courseSettings] = await Promise.all([
        fetchAdmissionsCourses(collegeId),
        fetchGlobalAdmissionSettings(collegeId),
        fetchCourseAdmissions(collegeId),
      ]);

      setCourses(branches);
      if (globalSettings) {
        setGlobalAdmissions(globalSettings.isAdmissionsOpen);
      }

      const initialState: Record<number, boolean> = {};
      branches.forEach((b) => {
        initialState[b.collegeBranchId] = false;
      });

      if (courseSettings && courseSettings.length > 0) {
        courseSettings.forEach((cs) => {
          initialState[cs.collegeBranchId] = cs.isAdmissionsOpen;
        });
      }

      setAdmissionsState(initialState);
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

  const handleToggleGlobal = async () => {
    const newState = !globalAdmissions;
    setGlobalAdmissions(newState);

    // Optimistically update the UI state for all courses
    const updatedState: Record<number, boolean> = {};
    courses.forEach((c) => {
      updatedState[c.collegeBranchId] = newState;
    });
    setAdmissionsState(updatedState);

    try {
      await upsertGlobalAdmissionsStatus(collegeId, adminId, newState);
      const coursePromises = courses.map((course) =>
        upsertCourseAdmissionConfig(collegeId, adminId, course.collegeBranchId, {
          isAdmissionsOpen: newState,
        })
      );
      await Promise.all(coursePromises);
      toast.success(
        newState ? "Admissions opened for all courses!" : "Admissions closed for all courses!"
      );
    } catch (error) {
      console.error("Error saving global setting:", error);
      setGlobalAdmissions(!newState);
      toast.error("Failed to update all courses. Please try again.");
    }
  };

  const handleToggleCourse = async (id: number) => {
    const currentState = admissionsState[id] ?? false;
    const newState = !currentState;

    // Optimistic update
    setAdmissionsState((prev) => ({ ...prev, [id]: newState }));

    try {
      await upsertCourseAdmissionConfig(collegeId, adminId, id, { isAdmissionsOpen: newState });
      toast.success(newState ? "Course admissions opened." : "Course admissions closed.");
    } catch (error) {
      console.error("Error saving course setting:", error);
      setAdmissionsState((prev) => ({ ...prev, [id]: currentState }));
      toast.error("Failed to update course status.");
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
          onClick={handleToggleGlobal}
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
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <CourseCardShimmer key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedCourses.map((course) => {
            const isOpen = admissionsState[course.collegeBranchId] ?? false;

            return (
              <div
                key={course.collegeBranchId}
                className="flex flex-col justify-between p-5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all gap-4"
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">
                    {course.name}
                  </h4>
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg shrink-0">
                    {course.code}
                  </span>
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
                      onClick={() => handleToggleCourse(course.collegeBranchId)}
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
            <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-2xl">
              No courses configured for Achievers Junior College.
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && courses.length > 0 && (
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
    </div>
  );
}
