"use client";

import React, { useState, useEffect, useMemo, Fragment } from "react";
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

import { ReviewItem } from "@/data/reviewsData";
import { Pagination } from "@/app/admin/components/Pagination";
import { supabase } from "@/lib/supabaseClient";
import {
  fetchAdminAlumniReviews,
  updateAlumniReviewVisibility,
  deleteAlumniReview,
} from "@/lib/helpers/alumniReviewsAPI";

function cleanReviewText(text: string): string {
  if (!text) return "";
  let trimmed = text.trim();
  while (trimmed.startsWith('"') || trimmed.startsWith('“') || trimmed.startsWith('”')) {
    trimmed = trimmed.substring(1).trim();
  }
  while (trimmed.endsWith('"') || trimmed.endsWith('“') || trimmed.endsWith('”')) {
    trimmed = trimmed.substring(0, trimmed.length - 1).trim();
  }
  return trimmed;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "visible" | "hidden">("all");
  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "name">("newest");
  const [stats, setStats] = useState({ total: 0, visible: 0, hidden: 0 });

  // Debounce search input by 300ms so we filter from DB without over-querying on each keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<ReviewItem | null>(null);
  const [reviewToToggle, setReviewToToggle] = useState<ReviewItem | null>(null);

  // Fetch reviews directly from DB with DB-side search, status filter, and sort
  useEffect(() => {
    let isMounted = true;

    async function loadReviews(isInitial = false) {
      try {
        if (isInitial) setIsLoading(true);
        const result = await fetchAdminAlumniReviews({
          search: debouncedSearch,
          status: statusFilter,
          sort: sortOption,
        });

        if (isMounted) {
          const mapped: ReviewItem[] = result.reviews.map((r, index) => {
            const imagesList: string[] = Array.isArray(r.images)
              ? r.images
              : typeof r.images === "string"
              ? (() => {
                  try {
                    const parsed = JSON.parse(r.images);
                    return Array.isArray(parsed) ? parsed : [];
                  } catch {
                    return [];
                  }
                })()
              : [];

            return {
              id: r.review_id || index + 1,
              review_id: r.review_id,
              name: r.full_name,
              email: r.email || null,
              initials: r.full_name
                .trim()
                .split(/\s+/)
                .map((part) => part[0])
                .join("")
                .substring(0, 2)
                .toUpperCase(),
              date: r.createdAt
                ? new Date(r.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })
                : "Recent",
              text: r.review_text,
              isVisible: r.isVisible !== false,
              photos: imagesList,
            };
          });
          setReviews(mapped);
          setStats(result.stats);
        }
      } catch (err: any) {
        console.error("Failed to load admin reviews:", err);
        if (isMounted && isInitial) {
          toast.error("Failed to load reviews from database");
        }
      } finally {
        if (isMounted && isInitial) setIsLoading(false);
      }
    }

    // Trigger initial shimmer load or query directly from DB
    loadReviews(isLoading && reviews.length === 0);

    // 1. Supabase Realtime WebSocket Subscription
    const channelId = `admin_reviews_rt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alumni_reviews",
        },
        (payload) => {
          console.log("[Admin Realtime] alumni_reviews change event:", payload);
          loadReviews(false);
        }
      )
      .subscribe((status) => {
        console.log("[Admin Realtime] Channel status:", status);
      });

    // 2. BroadcastChannel for cross-tab sync
    let broadcastChannel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        broadcastChannel = new BroadcastChannel("alumni_reviews_sync");
        broadcastChannel.onmessage = () => {
          loadReviews(false);
        };
      } catch (e) {
        console.error("BroadcastChannel error:", e);
      }
    }

    // 3. Storage event fallback for cross-tab sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "alumni_reviews_timestamp") {
        loadReviews(false);
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // 4. Tab Visibility & Focus re-sync
    const handleVisibilityOrFocus = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        loadReviews(false);
      }
    };
    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      if (broadcastChannel) broadcastChannel.close();
      supabase.removeChannel(channel);
    };
  }, [debouncedSearch, statusFilter, sortOption]);

  // Toggle visible / hidden confirmation in database
  const handleConfirmToggle = async () => {
    if (!reviewToToggle) return;
    const targetId = reviewToToggle.id;
    const reviewId = reviewToToggle.review_id || String(targetId);
    const newVisibility = !reviewToToggle.isVisible;

    let authUserId: string | null = null;
    try {
      const storedAdmin = localStorage.getItem("admin_user");
      if (storedAdmin) {
        const parsed = JSON.parse(storedAdmin);
        authUserId = parsed.authUserId || parsed.id || null;
      }
    } catch {}

    setIsUpdating(true);
    try {
      await updateAlumniReviewVisibility(reviewId, newVisibility, authUserId);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === targetId || r.review_id === reviewId
            ? { ...r, isVisible: newVisibility }
            : r
        )
      );
      toast.success(
        newVisibility
          ? `Review by ${reviewToToggle.name} is now live & visible`
          : `Review by ${reviewToToggle.name} has been archived & hidden`
      );

      // Broadcast update across open tabs
      if (typeof window !== "undefined") {
        try {
          const bc = new BroadcastChannel("alumni_reviews_sync");
          bc.postMessage({ type: "REVIEW_VISIBILITY_CHANGED", reviewId, isVisible: newVisibility });
          bc.close();
        } catch {}
        localStorage.setItem("alumni_reviews_timestamp", Date.now().toString());
      }
    } catch (err: any) {
      console.error("Error updating visibility:", err);
      toast.error(err.message || "Failed to update review visibility");
    } finally {
      setIsUpdating(false);
      setReviewToToggle(null);
    }
  };

  // Delete review confirmation in database
  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    const targetId = reviewToDelete.id;
    const reviewId = reviewToDelete.review_id || String(targetId);

    let authUserId: string | null = null;
    try {
      const storedAdmin = localStorage.getItem("admin_user");
      if (storedAdmin) {
        const parsed = JSON.parse(storedAdmin);
        authUserId = parsed.authUserId || parsed.id || null;
      }
    } catch {}

    setIsUpdating(true);
    try {
      await deleteAlumniReview(reviewId, authUserId);
      setReviews((prev) =>
        prev.filter((r) => r.id !== targetId && r.review_id !== reviewId)
      );
      toast.success(`Deleted review by ${reviewToDelete.name}`);

      // Broadcast delete across open tabs
      if (typeof window !== "undefined") {
        try {
          const bc = new BroadcastChannel("alumni_reviews_sync");
          bc.postMessage({ type: "REVIEW_DELETED", reviewId });
          bc.close();
        } catch {}
        localStorage.setItem("alumni_reviews_timestamp", Date.now().toString());
      }
    } catch (err: any) {
      console.error("Error deleting review:", err);
      toast.error(err.message || "Failed to delete review");
    } finally {
      setIsUpdating(false);
      setReviewToDelete(null);
    }
  };

  // Compute stats directly from DB counts
  const totalReviews = stats.total;
  const visibleCount = stats.visible;
  const hiddenCount = stats.hidden;

  // Reset pagination to page 1 whenever DB search query, status filter, or sort option changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, sortOption]);

  // Keep currentPage valid when total pages change
  const totalPages = Math.max(1, Math.ceil(reviews.length / itemsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Sliced reviews for the current page from DB results
  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return reviews.slice(startIndex, startIndex + itemsPerPage);
  }, [reviews, currentPage, itemsPerPage]);

  const handleItemsPerPageChange = (count: number) => {
    setItemsPerPage(count);
    setCurrentPage(1);
  };

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
      </div>

      {/* 2. Controls Toolbar: Search, Filters & Counter Pill */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Bar - Filter directly from DB by name */}
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
            <MagnifyingGlass size={18} weight="bold" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name..."
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
          {isLoading ? (
            <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
          ) : (
            <div className="px-3.5 py-2.5 rounded-xl bg-[#F1F5F9] text-[#475569] text-[13px] font-semibold border border-[#E2E8F0] whitespace-nowrap shadow-xs">
              {reviews.length} reviews
            </div>
          )}
        </div>
      </div>

      {/* 3. Metrics / KPI Stats Cards with Shimmer when loading */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: ARCHIVED / HIDDEN */}
        <div className="bg-[#0F172A] rounded-2xl p-5 sm:p-6 text-white border border-[#1E293B] flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10.5px] font-bold tracking-widest text-[#94A3B8] uppercase">
              ARCHIVED / HIDDEN
            </p>
            {isLoading ? (
              <div className="h-9 w-16 bg-slate-700/70 rounded-lg animate-pulse mt-1.5" />
            ) : (
              <p className="text-[32px] sm:text-[36px] font-extrabold text-white mt-1 leading-none tracking-tight">
                {String(hiddenCount).padStart(2, "0")}
              </p>
            )}
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
            {isLoading ? (
              <div className="h-9 w-16 bg-slate-700/70 rounded-lg animate-pulse mt-1.5" />
            ) : (
              <p className="text-[32px] sm:text-[36px] font-extrabold text-white mt-1 leading-none tracking-tight">
                {String(visibleCount).padStart(2, "0")}
              </p>
            )}
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
            {isLoading ? (
              <div className="h-9 w-16 bg-slate-700/70 rounded-lg animate-pulse mt-1.5" />
            ) : (
              <p className="text-[32px] sm:text-[36px] font-extrabold text-white mt-1 leading-none tracking-tight">
                {String(totalReviews).padStart(2, "0")}
              </p>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#6366F1]/15 border border-[#6366F1]/25 flex items-center justify-center text-[#818CF8] shrink-0">
            <Star size={22} weight="regular" />
          </div>
        </div>
      </div>

      {/* 4. Reviews Grid (3 columns) */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl p-5 border border-[#E2E8F0]/80 shadow-xs flex flex-col justify-between h-[280px]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-full bg-gray-200" />
                  <div className="w-16 h-5 rounded-full bg-gray-100" />
                </div>
                <div className="space-y-2 mt-4">
                  <div className="h-3.5 bg-gray-100 rounded w-full" />
                  <div className="h-3.5 bg-gray-100 rounded w-5/6" />
                </div>
                <div className="mt-4 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-[#F1F5F9]">
                <div className="h-8 rounded-xl bg-gray-100" />
                <div className="h-8 rounded-xl bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 mx-auto flex items-center justify-center mb-3">
            <MagnifyingGlass size={26} />
          </div>
          <h3 className="text-base font-bold text-gray-800">No reviews found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {totalReviews === 0
              ? "No reviews have been submitted by alumni yet."
              : "Try adjusting your search query or status filter to see testimonials."}
          </p>
          {totalReviews > 0 && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#0E1528] text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Scrollable Reviews Cards Container */}
          <div className="max-h-[620px] overflow-y-auto pr-2 review-scroll scroll-smooth">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-2">
              {paginatedReviews.map((review) => {
                return (
                  <div
                    key={review.id}
                    className="bg-white rounded-2xl p-5 border border-[#E2E8F0]/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      {/* Top Avatar Row & Status Badge */}
                      <div className="flex items-center justify-between">
                        {/* Initials Circle */}
                        <div className="w-9 h-9 rounded-full bg-[#1E293B] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {review.initials}
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

                      {/* Review Text with dedicated vertical scrollbar */}
                      <div className={`overflow-y-auto overflow-x-hidden pr-1 review-scroll mt-3 mb-2.5 ${review.photos && review.photos.length > 0 ? "h-[72px] max-h-[72px]" : "h-[92px] max-h-[92px]"}`}>
                        <blockquote className="text-[#475569] text-[13px] italic leading-snug break-words [overflow-wrap:anywhere]">
                          <span
                            aria-hidden="true"
                            className="inline-block text-base leading-none text-[#FF8117] font-serif font-bold mr-1 align-baseline select-none not-italic"
                          >
                            &ldquo;
                          </span>
                          <span className="break-words [overflow-wrap:anywhere]">{cleanReviewText(review.text)}</span>
                          <span
                            aria-hidden="true"
                            className="inline-block text-base leading-none text-[#FF8117] font-serif font-bold ml-1 align-baseline select-none not-italic"
                          >
                            &rdquo;
                          </span>
                        </blockquote>
                      </div>

                      {/* Author Name, Email and Date */}
                      <div className="mt-3.5">
                        <h4 className="text-[14px] font-bold text-[#0F172A] leading-snug">
                          {review.name}
                        </h4>
                        {review.email && (
                          <p className="text-[11.5px] text-[#64748B] font-medium truncate mt-0.5">
                            {review.email}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 text-[11.5px] text-[#94A3B8] font-normal mt-0.5">
                          <CalendarBlank size={13} weight="bold" />
                          <span>{review.date}</span>
                        </div>
                      </div>

                      {/* Photo Attachments (if any) */}
                      {review.photos && review.photos.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-gray-100">
                          <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <ImageIcon size={12} />
                            <span>Attached Photos ({review.photos.length})</span>
                          </p>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {review.photos.map((photo, pIdx) => (
                              <div
                                key={pIdx}
                                onClick={() => setSelectedPhoto(photo)}
                                className="relative size-12 rounded-lg overflow-hidden shrink-0 border border-gray-200 cursor-pointer hover:border-blue-500 transition-colors shadow-2xs group"
                              >
                                <Image
                                  src={photo}
                                  alt="Review attachment"
                                  fill
                                  sizes="48px"
                                  className="object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Buttons: Hide / Delete */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-[#F1F5F9]">
                      <button
                        onClick={() => setReviewToToggle(review)}
                        disabled={isUpdating}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[12px] font-semibold text-[#475569] transition-colors cursor-pointer disabled:opacity-50"
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
                        disabled={isUpdating}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[12px] font-semibold text-[#EF4444] border border-[#FECACA]/70 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Trash size={15} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalItems={reviews.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemsPerPageOptions={[6, 9, 12, 18]}
            onItemsPerPageChange={handleItemsPerPageChange}
            alwaysShow={true}
            bgClassName="bg-transparent pt-3 border-t border-[#E2E8F0]/80"
          />
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
    </div>
  );
}
