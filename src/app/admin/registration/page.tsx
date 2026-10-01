"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash, SpinnerGap, PencilSimple, X, CaretDown } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import {
  getCurrentAuthUserId,
  fetchCollegeData,
  createCollegeBranch,
  saveCollegeBranchesBatch,
  deleteCollegeBranch,
  CollegeEducation,
  CollegeBranch,
} from "@/lib/helpers/admin/collegeRegistrationHelper";

/**
 * Validates and formats input value:
 * 1. Accepts ONLY alphabetic characters (A-Z, a-z), spaces, and commas (,).
 * 2. Disallows any digits, numbers, or other special characters.
 * 3. Disallows leading spaces/commas and consecutive spaces.
 * 4. Automatically capitalizes the 1st letter of the field and the 1st letter after any space or comma.
 */
function formatCapitalizedLettersOnly(val: string): string {
  // 1. Remove all characters that are NOT letters, whitespace, or comma
  const allowedChars = val.replace(/[^a-zA-Z\s,]/g, "");

  // 2. Prevent leading whitespace or commas
  const noLeading = allowedChars.replace(/^[\s,]+/, "");

  // 3. Prevent multiple consecutive spaces or commas
  const singleSpaced = noLeading.replace(/\s{2,}/g, " ").replace(/,{2,}/g, ",");

  // 4. Capitalize first letter of every word (at beginning of string, after a space, or after a comma)
  return singleSpaced.replace(/(^|[\s,])([a-z])/g, (_, boundary, letter) => {
    return boundary + letter.toUpperCase();
  });
}

/**
 * Blocks keypress if key is not an alphabetic letter, space, or comma (allowing navigation/control keys).
 */
function handleKeyDownLettersOnly(e: React.KeyboardEvent<HTMLInputElement>) {
  if (
    e.key === "Backspace" ||
    e.key === "Delete" ||
    e.key === "Tab" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    e.key === "ArrowUp" ||
    e.key === "ArrowDown" ||
    e.key === "Enter" ||
    e.key === "Escape" ||
    e.ctrlKey ||
    e.metaKey
  ) {
    return;
  }

  // Reject any character that is not an alphabet letter, space, or comma
  if (!/^[a-zA-Z\s,]$/.test(e.key)) {
    e.preventDefault();
  }
}

export default function RegistrationPage() {
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [savedEducations, setSavedEducations] = useState<CollegeEducation[]>([]);
  const [educationName, setEducationName] = useState("");
  const [educationCode, setEducationCode] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");

  const [isEduDropdownOpen, setIsEduDropdownOpen] = useState(false);
  const eduDropdownRef = useRef<HTMLDivElement>(null);
  const educationCodeInputRef = useRef<HTMLInputElement>(null);

  const [branchesList, setBranchesList] = useState<CollegeBranch[]>([]);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<CollegeBranch | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (eduDropdownRef.current && !eduDropdownRef.current.contains(e.target as Node)) {
        setIsEduDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load current authUserId and existing college data
  useEffect(() => {
    async function initData() {
      setIsLoading(true);
      try {
        const uid = await getCurrentAuthUserId();
        setAuthUserId(uid);

        const data = await fetchCollegeData();
        setSavedEducations(data.educations);
        setBranchesList(data.branches);

        if (data.educations.length > 0) {
          setEducationName(data.educations[0].educationName);
          setEducationCode(data.educations[0].education_code);
        }
      } catch (err) {
        console.error("Failed to initialize registration page:", err);
      } finally {
        setIsLoading(false);
      }
    }

    initData();
  }, []);

  // Handle typing in Education Name input
  const handleEducationNameInput = (val: string) => {
    const formatted = formatCapitalizedLettersOnly(val);
    setEducationName(formatted);

    // Auto-fill education code if matching an existing saved education
    const found = savedEducations.find(
      (e) => e.educationName.toLowerCase() === formatted.trim().toLowerCase()
    );
    if (found) {
      setEducationCode(found.education_code);
    }
  };

  // Handle selecting an education from dropdown
  const handleSelectEducation = (edu: CollegeEducation) => {
    setEducationName(edu.educationName);
    setEducationCode(edu.education_code);
    setIsEduDropdownOpen(false);
  };

  // Handle keyboard events on Education Name input
  const handleEducationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setIsEduDropdownOpen(false);
      educationCodeInputRef.current?.focus();
      return;
    }
    handleKeyDownLettersOnly(e);
  };

  // Add / Update branch handler (Local update/addition only, not saving to DB yet)
  const handleAdd = () => {
    const trimmedEduName = educationName.trim();
    if (!trimmedEduName) {
      toast.error("Please enter or select an Education Name.");
      return;
    }
    if (!educationCode.trim()) {
      toast.error("Please enter an Education Code.");
      return;
    }
    if (!branchName.trim()) {
      toast.error("Please enter a Branch Name.");
      return;
    }
    if (!branchCode.trim()) {
      toast.error("Please enter a Branch Code.");
      return;
    }

    // If editing existing branch
    if (editingBranchId) {
      const isDuplicate = branchesList.some(
        (b) =>
          b.college_branch_id !== editingBranchId &&
          b.educationName.toLowerCase() === trimmedEduName.toLowerCase() &&
          (b.branchName.toLowerCase() === branchName.trim().toLowerCase() ||
            b.branch_code.toLowerCase() === branchCode.trim().toLowerCase())
      );
      if (isDuplicate) {
        toast.error("Another branch with this name or code already exists in the table.");
        return;
      }

      setBranchesList((prev) =>
        prev.map((b) =>
          b.college_branch_id === editingBranchId
            ? {
                ...b,
                educationName: trimmedEduName,
                education_code: educationCode.trim(),
                branchName: branchName.trim(),
                branch_code: branchCode.trim(),
                isPending: true,
              }
            : b
        )
      );

      // Add education to saved options if not already present
      if (
        !savedEducations.some(
          (e) => e.educationName.toLowerCase() === trimmedEduName.toLowerCase()
        )
      ) {
        const newEdu: CollegeEducation = {
          college_education_id: `temp-edu-${Date.now()}`,
          educationName: trimmedEduName,
          education_code: educationCode.trim(),
          createdBy: authUserId,
        };
        setSavedEducations((prev) => [...prev, newEdu]);
      }

      setEditingBranchId(null);
      toast.success("Branch updated");

      setBranchName("");
      setBranchCode("");
      return;
    }

    // Check duplicate in current table
    const isDuplicate = branchesList.some(
      (b) =>
        b.educationName.toLowerCase() === trimmedEduName.toLowerCase() &&
        (b.branchName.toLowerCase() === branchName.trim().toLowerCase() ||
          b.branch_code.toLowerCase() === branchCode.trim().toLowerCase())
    );
    if (isDuplicate) {
      toast.error("This branch has already been added to the table.");
      return;
    }

    const tempBranch: CollegeBranch = {
      college_branch_id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      college_education_id: "",
      educationName: trimmedEduName,
      education_code: educationCode.trim(),
      branchName: branchName.trim(),
      branch_code: branchCode.trim(),
      isPending: true,
    };

    setBranchesList((prev) => [...prev, tempBranch]);

    // Add education to saved options if not already present
    if (
      !savedEducations.some(
        (e) => e.educationName.toLowerCase() === trimmedEduName.toLowerCase()
      )
    ) {
      const newEdu: CollegeEducation = {
        college_education_id: `temp-edu-${Date.now()}`,
        educationName: trimmedEduName,
        education_code: educationCode.trim(),
        createdBy: authUserId,
      };
      setSavedEducations((prev) => [...prev, newEdu]);
    }

    toast.success("Branch added");

    // Reset branch inputs for subsequent entries
    setBranchName("");
    setBranchCode("");
  };

  // Populate branch fields into form for editing
  const handleEditBranch = (branch: CollegeBranch) => {
    setEditingBranchId(branch.college_branch_id);
    setEducationName(branch.educationName);
    setEducationCode(branch.education_code);
    setBranchName(branch.branchName);
    setBranchCode(branch.branch_code);
    setIsEduDropdownOpen(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingBranchId(null);
    setBranchName("");
    setBranchCode("");
    setIsEduDropdownOpen(false);
    if (savedEducations.length > 0) {
      setEducationName(savedEducations[0].educationName);
      setEducationCode(savedEducations[0].education_code);
    } else {
      setEducationName("");
      setEducationCode("");
    }
  };

  // Opens delete confirmation modal
  const handleRemoveBranch = (branch: CollegeBranch) => {
    setBranchToDelete(branch);
  };

  // Confirms and executes branch deletion
  const confirmDelete = async () => {
    if (!branchToDelete) return;
    setIsDeleting(true);

    if (editingBranchId === branchToDelete.college_branch_id) {
      handleCancelEdit();
    }

    // If it was only added locally (pending), remove locally without DB call
    if (branchToDelete.isPending) {
      setBranchesList((prev) =>
        prev.filter((b) => b.college_branch_id !== branchToDelete.college_branch_id)
      );
      toast.success("Branch removed from table.");
      setIsDeleting(false);
      setBranchToDelete(null);
      return;
    }

    // If already persisted in DB, delete from DB
    try {
      const result = await deleteCollegeBranch(branchToDelete.college_branch_id);
      if (result.success) {
        setBranchesList((prev) =>
          prev.filter((b) => b.college_branch_id !== branchToDelete.college_branch_id)
        );
        toast.success("Branch deleted from database.");
      } else {
        toast.error(result.error || "Failed to delete branch.");
      }
    } catch {
      toast.error("Error deleting branch.");
    } finally {
      setIsDeleting(false);
      setBranchToDelete(null);
    }
  };

  // Cancel action
  const handleCancel = () => {
    setEditingBranchId(null);
    setBranchName("");
    setBranchCode("");
    setIsEduDropdownOpen(false);
    // Remove any unsaved pending branches
    const hadPending = branchesList.some((b) => b.isPending);
    if (hadPending) {
      setBranchesList((prev) => prev.filter((b) => !b.isPending));
      toast("Unsaved additions cleared.");
    }
    if (savedEducations.length > 0) {
      setEducationName(savedEducations[0].educationName);
      setEducationCode(savedEducations[0].education_code);
    } else {
      setEducationName("");
      setEducationCode("");
    }
  };

  // Save action (persists all pending branches to DB)
  const handleSave = async () => {
    let pendingBranches = branchesList.filter((b) => b.isPending);

    // If user filled inputs and directly clicked Save, include that branch too
    if (pendingBranches.length === 0) {
      if (educationName.trim() && educationCode.trim() && branchName.trim() && branchCode.trim()) {
        pendingBranches = [
          {
            college_branch_id: `temp-${Date.now()}`,
            college_education_id: "",
            educationName: educationName.trim(),
            education_code: educationCode.trim(),
            branchName: branchName.trim(),
            branch_code: branchCode.trim(),
            isPending: true,
          },
        ];
      } else {
        toast.error("No new branches to save. Enter branch details and click Add first.");
        return;
      }
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Saving branches to database...");

    try {
      const result = await saveCollegeBranchesBatch({
        branches: pendingBranches.map((b) => ({
          college_branch_id: b.college_branch_id,
          educationName: b.educationName,
          education_code: b.education_code,
          branchName: b.branchName,
          branch_code: b.branch_code,
        })),
        createdBy: authUserId,
      });

      if (result.success) {
        // Refresh with latest saved data from DB
        const data = await fetchCollegeData();
        setSavedEducations(data.educations);
        setBranchesList(data.branches);
        setBranchName("");
        setBranchCode("");
        setEditingBranchId(null);
        toast.success(`Successfully saved ${pendingBranches.length} branch(es) to database!`, {
          id: toastId,
        });
      } else {
        toast.error(result.error || "Failed to save branches to database.", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Branches
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Add a new branch to the network by providing verified details below.
        </p>
      </div>

      {/* Form Container */}
      <div className="max-w-4xl space-y-8 pt-4">
        {/* Grid for Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Education Name (Combobox with integrated dropdown) */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-900">
              Education Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative" ref={eduDropdownRef}>
              <input
                type="text"
                placeholder="Enter or select Education Name"
                value={educationName}
                onKeyDown={handleEducationKeyDown}
                onChange={(e) => handleEducationNameInput(e.target.value)}
                onFocus={() => {
                  if (savedEducations.length > 0) setIsEduDropdownOpen(true);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:border-[#0E1528] focus:ring-1 focus:ring-[#0E1528] placeholder:text-gray-400 placeholder:font-normal pr-10"
              />
              {savedEducations.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsEduDropdownOpen((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                  tabIndex={-1}
                  title="Toggle education list"
                >
                  <CaretDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isEduDropdownOpen ? "rotate-180 text-gray-700" : ""
                    }`}
                  />
                </button>
              )}

              {/* Autocomplete / Selection Dropdown list */}
              {isEduDropdownOpen && savedEducations.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  {savedEducations.map((edu) => (
                    <button
                      key={edu.college_education_id || edu.educationName}
                      type="button"
                      onClick={() => handleSelectEducation(edu)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between cursor-pointer transition-colors ${
                        educationName.toLowerCase() === edu.educationName.toLowerCase()
                          ? "bg-gray-50/80 font-semibold text-[#0E1528]"
                          : "text-gray-700 font-medium"
                      }`}
                    >
                      <span>{edu.educationName}</span>
                      <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {edu.education_code}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Education Code */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-900">
              Education Code <span className="text-rose-500">*</span>
            </label>
            <input
              ref={educationCodeInputRef}
              type="text"
              placeholder="Enter Education Code"
              value={educationCode}
              onKeyDown={handleKeyDownLettersOnly}
              onChange={(e) => setEducationCode(formatCapitalizedLettersOnly(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:border-[#0E1528] focus:ring-1 focus:ring-[#0E1528] placeholder:text-gray-400 placeholder:font-normal"
            />
          </div>

          {/* Branch Name */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-900">
              Branch Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Branch Name"
              value={branchName}
              onKeyDown={handleKeyDownLettersOnly}
              onChange={(e) => setBranchName(formatCapitalizedLettersOnly(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:border-[#0E1528] focus:ring-1 focus:ring-[#0E1528] placeholder:text-gray-400 placeholder:font-normal"
            />
          </div>

          {/* Branch Code */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-900">
              Branch Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Branch Code"
              value={branchCode}
              onKeyDown={handleKeyDownLettersOnly}
              onChange={(e) => setBranchCode(formatCapitalizedLettersOnly(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:border-[#0E1528] focus:ring-1 focus:ring-[#0E1528] placeholder:text-gray-400 placeholder:font-normal"
            />
          </div>
        </div>

        {/* Add / Update Button */}
        <div className="flex justify-end items-center gap-3 pt-2">
          {editingBranchId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-5 py-3 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <X size={16} />
              Cancel Edit
            </button>
          )}
          <button
            type="button"
            onClick={handleAdd}
            disabled={isSubmitting}
            className="w-full md:w-auto px-8 py-3 bg-[#0E1528] text-white text-sm font-bold rounded-xl hover:bg-[#1a2542] hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0E1528] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <SpinnerGap size={16} className="animate-spin" />
            ) : editingBranchId ? (
              <>
                <PencilSimple size={16} weight="bold" />
                Update
              </>
            ) : (
              <>
                <Plus size={16} weight="bold" />
                Add
              </>
            )}
          </button>
        </div>

        {/* Added Branches Table */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span>Added Branches ({branchesList.length})</span>
            </h3>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Education Name</th>
                  <th className="py-3 px-4">Education Code</th>
                  <th className="py-3 px-4">Branch Name</th>
                  <th className="py-3 px-4">Branch Code</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                {branchesList.map((branch, index) => (
                  <tr key={branch.college_branch_id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 text-gray-400">{index + 1}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{branch.educationName}</td>
                    <td className="py-3 px-4 text-gray-700">{branch.education_code}</td>
                    <td className="py-3 px-4 text-gray-700">{branch.branchName}</td>
                    <td className="py-3 px-4 text-gray-700">{branch.branch_code}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditBranch(branch)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                          title="Edit branch"
                        >
                          <PencilSimple size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveBranch(branch)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete branch"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {branchesList.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No branches added yet. Enter details above and click Add.
                    </td>
                  </tr>
                )}
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <SpinnerGap size={18} className="animate-spin text-gray-500" />
                        <span>Loading branches...</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons (Cancel & Save) */}
        <div className="pt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-12 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 focus:outline-none transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-12 py-3 bg-[#0E1528] text-white text-sm font-bold rounded-xl hover:bg-[#1a2542] hover:shadow-lg hover:shadow-[#0E1528]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0E1528] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <SpinnerGap size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {branchToDelete && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !isDeleting && setBranchToDelete(null)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close icon */}
            <button
              type="button"
              onClick={() => setBranchToDelete(null)}
              disabled={isDeleting}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>

            {/* Icon & Details */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100">
                <Trash size={28} weight="bold" />
              </div>

              <h3 className="text-lg font-bold text-gray-900">Delete Branch</h3>

              <p className="text-sm text-gray-600 mt-2">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  {branchToDelete.branchName} ({branchToDelete.branch_code})
                </span>
                ?
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {branchToDelete.isPending
                  ? "This will remove the branch from the table."
                  : "This will remove the branch from the database."}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setBranchToDelete(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <SpinnerGap size={16} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
