"use client";

import React, { useState, useMemo, Fragment } from "react";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import {
  MagnifyingGlass,
  CaretDown,
  Eye,
  EyeSlash,
  Star,
  Trash,
  CalendarBlank,
  Image as ImageIcon,
  X,
  Quotes,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";

import { ReviewItem, INITIAL_REVIEWS } from "@/data/reviewsData";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("achievers_admin_reviews");
        if (stored) return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return INITIAL_REVIEWS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "visible" | "hidden">("all");
  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "name">("newest");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newText, setNewText] = useState("");
  const [newPhotos, setNewPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<ReviewItem | null>(null);
  const [reviewToToggle, setReviewToToggle] = useState<ReviewItem | null>(null);

  // Synchronize reviews to localStorage on changes
  const saveReviews = (updated: ReviewItem[]) => {
    setReviews(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("achievers_admin_reviews", JSON.stringify(updated));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddReview = () => {
    if (!newName.trim() || !newText.trim()) {
      toast.error("Name and review text are required");
      return;
    }

    const today = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = `${monthNames[today.getMonth()]} ${String(today.getDate()).padStart(2, "0")}, ${today.getFullYear()}`;

    const newReview: ReviewItem = {
      id: Date.now(),
      initials: newName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase(),
      name: newName,
      date: formattedDate,
      text: newText,
      isVisible: true,
      photos: newPhotos,
    };

    saveReviews([newReview, ...reviews]);
    toast.success("Review added successfully!");
    setIsAddModalOpen(false);
    setNewName("");
    setNewText("");
    setNewPhotos([]);
  };

  // Toggle visible / hidden confirmation
  const handleConfirmToggle = () => {
    if (!reviewToToggle) return;
    const targetId = reviewToToggle.id;
    const isCurrentlyVisible = reviewToToggle.isVisible;
    const updated = reviews.map((r) => {
      if (r.id === targetId) {
        return { ...r, isVisible: !isCurrentlyVisible };
      }
      return r;
    });
    saveReviews(updated);
    toast.success(
      isCurrentlyVisible
        ? `Review by ${reviewToToggle.name} has been archived & hidden`
        : `Review by ${reviewToToggle.name} is now live & visible`
    );
    setReviewToToggle(null);
  };

  // Delete review confirmation
  const handleConfirmDelete = () => {
    if (!reviewToDelete) return;
    const updated = reviews.filter((r) => r.id !== reviewToDelete.id);
    saveReviews(updated);
    toast.success(`Deleted review by ${reviewToDelete.name}`);
    setReviewToDelete(null);
  };

  // Compute stats
  const totalReviews = reviews.length;
  const visibleCount = reviews.filter((r) => r.isVisible).length;
  const hiddenCount = reviews.filter((r) => !r.isVisible).length;

  // Filter & Sort reviews
  const filteredReviews = useMemo(() => {
    return reviews
      .filter((r) => {
        // Status filter
        if (statusFilter === "visible" && !r.isVisible) return false;
        if (statusFilter === "hidden" && r.isVisible) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = r.name.toLowerCase().includes(q);
          const matchText = r.text.toLowerCase().includes(q);
          const matchDate = r.date.toLowerCase().includes(q);
          return matchName || matchText || matchDate;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOption === "name") {
          return a.name.localeCompare(b.name);
        }
        if (sortOption === "oldest") {
          return a.id - b.id;
        }
        // newest first by default
        return b.id - a.id;
      });
  }, [reviews, searchQuery, statusFilter, sortOption]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#111827] tracking-tight leading-tight">
            Reviews
          </h1>
          <p className="text-[14px] text-[#64748B] mt-1">
            Manage student and alumni testimonials shown on the website.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-colors text-sm shrink-0"
        >
          + Add Review
        </button>
      </div>

      {/* 2. Controls Toolbar: Search, Filters & Counter Pill */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
            <MagnifyingGlass size={18} weight="bold" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews by name or keyword..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[13.5px] text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-md"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Toolbar (Status, Sort, Count Pill) */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Status Dropdown */}
          <div className="relative min-w-[130px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "visible" | "hidden")}
              className="w-full appearance-none px-3.5 pr-8 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[13px] font-medium text-[#334155] focus:outline-none focus:border-[#2563EB] transition-colors shadow-xs cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="visible">Visible Only</option>
              <option value="hidden">Hidden Only</option>
            </select>
            <CaretDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative min-w-[140px]">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as "newest" | "oldest" | "name")}
              className="w-full appearance-none px-3.5 pr-8 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[13px] font-medium text-[#334155] focus:outline-none focus:border-[#2563EB] transition-colors shadow-xs cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Author (A-Z)</option>
            </select>
            <CaretDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
            />
          </div>

          {/* Total Counter Badge Pill */}
          <div className="px-3.5 py-2.5 rounded-xl bg-[#F1F5F9] text-[#475569] text-[13px] font-semibold border border-[#E2E8F0] whitespace-nowrap shadow-xs">
            {filteredReviews.length} reviews
          </div>
        </div>
      </div>

      {/* 3. Metrics / KPI Stats Cards (3 cards matching exact design) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: ARCHIVED / HIDDEN */}
        <div className="bg-[#0F172A] rounded-2xl p-5 sm:p-6 text-white border border-[#1E293B] flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10.5px] font-bold tracking-widest text-[#94A3B8] uppercase">
              ARCHIVED / HIDDEN
            </p>
            <p className="text-[32px] sm:text-[36px] font-extrabold text-white mt-1 leading-none tracking-tight">
              {String(hiddenCount).padStart(2, "0")}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/25 flex items-center justify-center text-[#F87171] shrink-0">
            <EyeSlash size={22} weight="bold" />
          </div>
        </div>

        {/* Card 2: LIVE & VISIBLE */}
        <div className="bg-[#0F172A] rounded-2xl p-5 sm:p-6 text-white border border-[#1E293B] flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10.5px] font-bold tracking-widest text-[#94A3B8] uppercase">
              LIVE & VISIBLE
            </p>
            <p className="text-[32px] sm:text-[36px] font-extrabold text-white mt-1 leading-none tracking-tight">
              {String(visibleCount).padStart(2, "0")}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/15 border border-[#10B981]/25 flex items-center justify-center text-[#34D399] shrink-0">
            <Eye size={22} weight="bold" />
          </div>
        </div>

        {/* Card 3: TOTAL TESTIMONIALS */}
        <div className="bg-[#0F172A] rounded-2xl p-5 sm:p-6 text-white border border-[#1E293B] flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10.5px] font-bold tracking-widest text-[#94A3B8] uppercase">
              TOTAL TESTIMONIALS
            </p>
            <p className="text-[32px] sm:text-[36px] font-extrabold text-white mt-1 leading-none tracking-tight">
              {String(totalReviews).padStart(2, "0")}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#6366F1]/15 border border-[#6366F1]/25 flex items-center justify-center text-[#818CF8] shrink-0">
            <Star size={22} weight="regular" />
          </div>
        </div>
      </div>

      {/* 4. Reviews Grid (3 columns) */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 mx-auto flex items-center justify-center mb-3">
            <MagnifyingGlass size={26} />
          </div>
          <h3 className="text-base font-bold text-gray-800">No reviews found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or status filter to see testimonials.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#0E1528] text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReviews.map((review) => {
            return (
              <div
                key={review.id}
                className="bg-white rounded-2xl p-5 border border-[#E2E8F0]/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-all duration-200"
              >
                <div>
                  {/* Top Avatar Row & Status Badge */}
                  <div className="flex items-center justify-between">
                    {/* Initials Circle & Gold Quotes */}
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-[#1E293B] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {review.initials}
                      </div>

                      {/* Golden Double / Triple Quote Marks */}
                      <div className="flex items-center text-[#FFA401] opacity-90 pl-0.5">
                        <span className="text-xs font-serif tracking-tighter select-none font-bold">“““</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {review.isVisible ? (
                      <span className="text-[11px] font-semibold text-[#10B981] bg-[#ECFDF5] border border-[#A7F3D0]/70 px-2.5 py-0.5 rounded-full">
                        Visible
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-[#EF4444] bg-[#FEF2F2] border border-[#FECACA]/70 px-2.5 py-0.5 rounded-full">
                        Hidden
                      </span>
                    )}
                  </div>

                  {/* Review Text */}
                  <p className="text-[#475569] text-[13px] italic leading-relaxed mt-3.5 mb-3.5 line-clamp-2">
                    {review.text}
                  </p>

                  {/* Author Name and Date */}
                  <div className="mt-3.5">
                    <h4 className="text-[14px] font-bold text-[#0F172A] leading-snug">
                      {review.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11.5px] text-[#94A3B8] font-normal mt-0.5">
                      <CalendarBlank size={13} weight="bold" />
                      <span>{review.date}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons: Hide / Delete */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-[#F1F5F9]">
                  <button
                    onClick={() => setReviewToToggle(review)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[12px] font-semibold text-[#475569] transition-colors cursor-pointer"
                  >
                    {review.isVisible ? (
                      <>
                        <EyeSlash size={15} />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye size={15} />
                        <span>Unhide</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setReviewToDelete(review)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[12px] font-semibold text-[#EF4444] border border-[#FECACA]/70 transition-colors cursor-pointer"
                  >
                    <Trash size={15} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Photo Lightbox Modal */}
      <Transition appear show={!!selectedPhoto} as={Fragment}>
        <Dialog as="div" className="relative z-[10000]" onClose={() => setSelectedPhoto(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-700">
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-colors"
                  >
                    <X size={18} weight="bold" />
                  </button>

                  {selectedPhoto && (
                    <div className="relative w-full h-[450px] rounded-xl overflow-hidden bg-slate-900">
                      <Image
                        src={selectedPhoto}
                        alt="Testimonial Photo"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 700px"
                      />
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* 6. Delete Confirmation Modal (Matching Reference Mockup) */}
      <Transition appear show={!!reviewToDelete} as={Fragment}>
        <Dialog as="div" className="relative z-[10000]" onClose={() => setReviewToDelete(null)}>
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
                  {/* Top-Right Close Button */}
                  <button
                    onClick={() => setReviewToDelete(null)}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg cursor-pointer"
                    aria-label="Close"
                  >
                    <X size={18} weight="bold" />
                  </button>

                  {/* Centered Circular Trash Icon */}
                  <div className="w-14 h-14 rounded-full bg-[#FEF2F2] flex items-center justify-center mx-auto mb-4 border border-[#FEE2E2]">
                    <Trash size={26} weight="regular" className="text-[#EF4444]" />
                  </div>

                  {/* Heading */}
                  <Dialog.Title as="h3" className="text-[20px] font-bold text-[#111827] text-center mb-2">
                    Delete this review?
                  </Dialog.Title>

                  {/* Description */}
                  <p className="text-[13.5px] text-[#64748B] text-center max-w-[300px] mx-auto leading-relaxed mb-6">
                    This review will be permanently removed and will no longer appear on the website.
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-3 mt-2">
                    <button
                      type="button"
                      className="flex-1 py-2.5 px-4 rounded-xl border border-[#D0D5DD] bg-white hover:bg-gray-50 text-[14px] font-semibold text-[#344054] transition-colors cursor-pointer shadow-xs"
                      onClick={() => setReviewToDelete(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                      onClick={handleConfirmDelete}
                    >
                      <Trash size={16} weight="bold" />
                      <span>Delete Review</span>
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* 7. Hide / Unhide Confirmation Modal */}
      <Transition appear show={!!reviewToToggle} as={Fragment}>
        <Dialog as="div" className="relative z-[10000]" onClose={() => setReviewToToggle(null)}>
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
                  {/* Top-Right Close Button */}
                  <button
                    onClick={() => setReviewToToggle(null)}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg cursor-pointer"
                    aria-label="Close"
                  >
                    <X size={18} weight="bold" />
                  </button>

                  {/* Centered Circular Icon */}
                  {reviewToToggle?.isVisible ? (
                    <div className="w-14 h-14 rounded-full bg-[#FFFBEB] flex items-center justify-center mx-auto mb-4 border border-[#FEF3C7]">
                      <EyeSlash size={26} weight="regular" className="text-[#D97706]" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#ECFDF5] flex items-center justify-center mx-auto mb-4 border border-[#D1FAE5]">
                      <Eye size={26} weight="regular" className="text-[#059669]" />
                    </div>
                  )}

                  {/* Heading */}
                  <Dialog.Title as="h3" className="text-[20px] font-bold text-[#111827] text-center mb-2">
                    {reviewToToggle?.isVisible ? "Hide this review?" : "Make review visible?"}
                  </Dialog.Title>

                  {/* Description */}
                  <p className="text-[13.5px] text-[#64748B] text-center max-w-[300px] mx-auto leading-relaxed mb-6">
                    {reviewToToggle?.isVisible
                      ? "This review will be archived and will no longer appear on the website."
                      : "This review will be published and will appear live on the website."}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-3 mt-2">
                    <button
                      type="button"
                      className="flex-1 py-2.5 px-4 rounded-xl border border-[#D0D5DD] bg-white hover:bg-gray-50 text-[14px] font-semibold text-[#344054] transition-colors cursor-pointer shadow-xs"
                      onClick={() => setReviewToToggle(null)}
                    >
                      Cancel
                    </button>
                    {reviewToToggle?.isVisible ? (
                      <button
                        type="button"
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#0E1528] hover:bg-slate-800 text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                        onClick={handleConfirmToggle}
                      >
                        <EyeSlash size={16} weight="bold" />
                        <span>Hide Review</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                        onClick={handleConfirmToggle}
                      >
                        <Eye size={16} weight="bold" />
                        <span>Show Review</span>
                      </button>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {/* 6. Add Review Modal */}
      <Transition appear show={isAddModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[10000]"
          onClose={() => setIsAddModalOpen(false)}
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
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative w-full max-w-lg transform overflow-hidden rounded-[24px] bg-white p-6 sm:p-8 text-left shadow-2xl transition-all border border-gray-100">
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg cursor-pointer"
                  >
                    <X size={18} weight="bold" />
                  </button>

                  <Dialog.Title as="h3" className="text-xl font-bold text-[#111827] mb-6">
                    Add New Review
                  </Dialog.Title>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Author Name</label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Review Text</label>
                      <textarea
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="What did they say?"
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Photos (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {newPhotos.length > 0 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                          {newPhotos.map((photo, i) => (
                            <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                              <Image src={photo} alt="Upload preview" fill className="object-cover" />
                              <button
                                onClick={() => setNewPhotos(newPhotos.filter((_, idx) => idx !== i))}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-8">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddReview}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors text-sm"
                    >
                      Save Review
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
