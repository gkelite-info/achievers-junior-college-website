"use client";

import React, { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import {
  UploadSimple,
  X,
  Plus,
  Image as ImageIcon,
  CheckCircle,
  CalendarBlank,
  Star,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ReviewItem } from "@/data/reviewsData";
import { supabase } from "@/lib/supabaseClient";
import {
  fetchAlumniReviews,
  uploadMultipleAlumniPhotos,
  submitAlumniReview,
} from "@/lib/helpers/alumniReviewsAPI";
import { getOrCreateVisitorId } from "@/lib/helpers/analyticsClient";
import ReviewDetailModal from "./ReviewDetailModal";

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

/**
 * Validations & Live Formatters:
 * 1. Full Name: 1st letter Capital, after space/dot also Capital
 * 2. Email: All letters lowercase, no spaces
 * 3. Review: 1st letter Capital, after space/newline also Capital
 */
function formatCapitalizedWords(str: string): string {
  if (!str) return "";
  return str.replace(/(^|[\s.])([a-z])/gi, (match) => match.toUpperCase());
}

function formatLowercaseEmail(str: string): string {
  if (!str) return "";
  return str.toLowerCase().replace(/\s+/g, "");
}

function formatReviewText(str: string): string {
  if (!str) return "";
  return str.replace(/(^|[\s\n\r])([a-z])/gi, (match) => match.toUpperCase());
}

/**
 * Automatically optimizes and compresses large image files client-side before upload
 */
async function optimizeImageFile(
  file: File,
  maxDimension = 2048,
  quality = 0.88
): Promise<{ file: File; dataUrl: string }> {
  // If image is already smaller than 2MB, read and return directly
  if (file.size <= 2 * 1024 * 1024) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ file, dataUrl: reader.result as string });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);

          // For very large PNGs, convert to JPEG for high-performance upload
          const outputType =
            file.type === "image/png" && file.size > 3 * 1024 * 1024
              ? "image/jpeg"
              : file.type || "image/jpeg";
          const dataUrl = canvas.toDataURL(outputType, quality);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const extension = outputType === "image/jpeg" ? ".jpg" : ".png";
                const newName = file.name.replace(/\.[^.]+$/, "") + extension;
                const optimizedFile = new File([blob], newName, {
                  type: outputType,
                  lastModified: Date.now(),
                });
                resolve({ file: optimizedFile, dataUrl });
              } else {
                resolve({ file, dataUrl });
              }
            },
            outputType,
            quality
          );
        } else {
          resolve({ file, dataUrl: e.target?.result as string });
        }
      };

      img.onerror = () => {
        resolve({ file, dataUrl: e.target?.result as string });
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      resolve({ file, dataUrl: "" });
    };

    reader.readAsDataURL(file);
  });
}

export default function Testimonials() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isUploadOpen = searchParams.get("modal") === "upload";

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restore draft state from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = sessionStorage.getItem("achievers_upload_name");
      const savedEmail = sessionStorage.getItem("achievers_upload_email");
      const savedReview = sessionStorage.getItem("achievers_upload_review");
      if (savedName) setName(savedName);
      if (savedEmail) setEmail(savedEmail);
      if (savedReview) setReviewText(savedReview);
    }
  }, []);

  // Load reviews purely from DB with Realtime WebSocket sync
  useEffect(() => {
    let isMounted = true;

    async function loadReviews(isInitial = false) {
      try {
        if (isInitial) setIsLoading(true);
        // Clean up legacy localStorage cache if present
        if (typeof window !== "undefined") {
          localStorage.removeItem("achievers_admin_reviews");
        }

        const dbReviews = await fetchAlumniReviews();
        if (isMounted) {
          if (Array.isArray(dbReviews) && dbReviews.length > 0) {
            const mapped: ReviewItem[] = dbReviews.map((r, index) => {
              const imagesList: string[] = Array.isArray(r.images)
                ? r.images
                : typeof r.images === "string"
                ? (() => {
                    try {
                      const p = JSON.parse(r.images);
                      return Array.isArray(p) ? p : [];
                    } catch {
                      return [];
                    }
                  })()
                : [];

              return {
                id: r.review_id || index + 1,
                name: r.full_name,
                initials: r.full_name
                  .trim()
                  .split(/\s+/)
                  .map((p) => p[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase(),
                text: r.review_text,
                rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
                date: r.createdAt
                  ? new Date(r.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })
                  : "",
                isVisible: r.is_Active !== false,
                photos: imagesList,
              };
            });
            setReviews(mapped);
          } else {
            setReviews([]);
          }
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
        if (isMounted && isInitial) setReviews([]);
      } finally {
        if (isMounted && isInitial) setIsLoading(false);
      }
    }

    // Initial load with skeleton shimmer
    loadReviews(true);

    // 1. Supabase Realtime WebSocket Subscription
    const channelId = `alumni_reviews_pub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alumni_reviews" },
        (payload) => {
          console.log("[Supabase Realtime] alumni_reviews change received:", payload);
          // Refresh reviews in real-time without reloading the page
          loadReviews(false);
        }
      )
      .subscribe((status) => {
        console.log("[Supabase Realtime] Testimonials channel status:", status);
      });

    // 2. BroadcastChannel for instant cross-tab sync
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

    // 3. Storage event fallback for cross-tab updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "alumni_reviews_timestamp") {
        loadReviews(false);
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // 4. Tab Visibility & Focus Change (re-fetch fresh data when switching back to tab)
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
  }, []);

  // Lock body scroll when modal is open to ensure it stays fixed in place
  useEffect(() => {
    if (isUploadOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isUploadOpen]);

  // Persist form fields in session storage so they survive refreshes
  useEffect(() => {
    const savedName = sessionStorage.getItem('achievers_upload_name');
    const savedReview = sessionStorage.getItem('achievers_upload_review');
    if (savedName) setName(savedName);
    if (savedReview) setReviewText(savedReview);
  }, []);

  useEffect(() => {
    if (name) sessionStorage.setItem('achievers_upload_name', name);
    else sessionStorage.removeItem('achievers_upload_name');
  }, [name]);

  useEffect(() => {
    if (reviewText) sessionStorage.setItem('achievers_upload_review', reviewText);
    else sessionStorage.removeItem('achievers_upload_review');
  }, [reviewText]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    const MAX_SIZE = 30 * 1024 * 1024; // 30MB limit

    const newOptimizedFiles: File[] = [];
    const newOptimizedUrls: string[] = [];

    const needsOptimization = filesArray.some((f) => f.size > 2 * 1024 * 1024);
    const loadingToastId = needsOptimization
      ? toast.loading("Optimizing photos for upload...")
      : null;

    try {
      for (const file of filesArray) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        if (file.size > MAX_SIZE) {
          toast.error(`${file.name} exceeds 30MB size limit`);
          continue;
        }

        try {
          const { file: optimizedFile, dataUrl } = await optimizeImageFile(file);
          newOptimizedFiles.push(optimizedFile);
          if (dataUrl) {
            newOptimizedUrls.push(dataUrl);
          }
        } catch {
          newOptimizedFiles.push(file);
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setPhotos((prev) => [...prev, event.target!.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      }

      if (newOptimizedUrls.length > 0) {
        setPhotos((prev) => [...prev, ...newOptimizedUrls]);
      }
      if (newOptimizedFiles.length > 0) {
        setImageFiles((prev) => [...prev, ...newOptimizedFiles]);
      }
    } finally {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      e.target.value = "";
    }
  };

  const handleOpenModal = () => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("modal", "upload");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCloseModal = () => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("modal");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCapitalizedWords(e.target.value);
    setName(formatted);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLowercaseEmail(e.target.value);
    setEmail(formatted);
  };

  const handleReviewTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const formatted = formatReviewText(e.target.value);
    setReviewText(formatted);
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = formatCapitalizedWords(name.trim());
    const finalEmail = formatLowercaseEmail(email.trim());
    const cleanReview = formatReviewText(reviewText.trim());

    if (!cleanName) {
      toast.error("Please enter your full name");
      return;
    }
    if (cleanName.length < 2) {
      toast.error("Full name must be at least 2 characters long");
      return;
    }

    if (!finalEmail) {
      toast.error("Please enter your email address");
      return;
    }
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(finalEmail)) {
      toast.error("Please enter a valid email address (all lowercase, e.g. name@example.com)");
      return;
    }

    if (!cleanReview) {
      toast.error("Please write your review / experience");
      return;
    }
    if (cleanReview.length < 5) {
      toast.error("Review must be at least 5 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload images to the Supabase storage bucket 'alumni-reviews'
      let uploadedPhotoUrls: string[] = [];
      if (imageFiles.length > 0) {
        uploadedPhotoUrls = await uploadMultipleAlumniPhotos(imageFiles);
      } else {
        // Fallback for pre-existing non-data URLs
        uploadedPhotoUrls = photos.filter((p) => !p.startsWith("data:"));
      }

      // 2. Submit to the database table public.alumni_reviews via helper
      // Uses the same visitorId that is tracked in public.application_analytics_logs
      const visitorId = getOrCreateVisitorId();

      const savedReview = await submitAlumniReview({
        full_name: cleanName,
        review_text: cleanReview,
        email: finalEmail,
        rating: Number(rating),
        images: uploadedPhotoUrls,
        visitorId,
      });

      const today = new Date();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formattedDate = `${monthNames[today.getMonth()]} ${String(today.getDate()).padStart(2, "0")}, ${today.getFullYear()}`;

      const newReviewItem: ReviewItem = {
        id: Date.now(),
        initials: name
          .trim()
          .split(/\s+/)
          .map((p) => p[0])
          .join("")
          .substring(0, 2)
          .toUpperCase(),
        name: savedReview.full_name || name.trim(),
        date: formattedDate,
        text: savedReview.review_text || reviewText.trim(),
        rating: savedReview.rating || rating,
        isVisible: true,
        photos: uploadedPhotoUrls,
      };

      setReviews((prev) => [newReviewItem, ...prev]);

      // Notify open admin and alumni tabs across browser windows
      if (typeof window !== "undefined") {
        try {
          const bc = new BroadcastChannel("alumni_reviews_sync");
          bc.postMessage({ type: "REVIEW_SUBMITTED" });
          bc.close();
        } catch {}
        localStorage.setItem("alumni_reviews_timestamp", Date.now().toString());
      }

      toast.success("Thank you! Your review has been uploaded successfully.");

      // Reset Form
      setName("");
      setEmail("");
      setRating(5);
      setReviewText("");
      setPhotos([]);
      setImageFiles([]);
      handleCloseModal();

      sessionStorage.removeItem("achievers_upload_name");
      sessionStorage.removeItem("achievers_upload_email");
      sessionStorage.removeItem("achievers_upload_review");
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      toast.error(err.message || "Something went wrong while uploading your review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="testimonials-heading" className="w-full">
      {/* Header with Title and Upload Review Button */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E1E9F2] pb-6">
        <div>
          <h2 id="testimonials-heading" className="text-3xl font-bold tracking-tight text-[#0A1E37] sm:text-4xl">
            What Our Alumni Say
          </h2>
          <p className="mt-2 text-base text-[#63799A]">
            Real stories. Real journeys. Real Achievers.
          </p>
        </div>

        {/* Upload Review Action Button */}
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF8117] hover:bg-[#e06f0e] text-white px-5 py-3 font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
        >
          <Plus size={18} weight="bold" />
          <span>Upload Review & Photos</span>
        </button>
      </div>

      {/* Review Boxes Vertical Scroll Container */}
      <div className="max-h-[520px] overflow-y-auto pr-2 review-scroll scroll-smooth">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="flex flex-col justify-between h-[330px] min-h-[330px] max-h-[330px] w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm box-border"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-2.5 pb-2 border-b border-gray-50">
                    <div className="size-9 rounded-full bg-gray-200" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2 mt-2.5">
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                    <div className="h-3 bg-gray-100 rounded w-4/6" />
                  </div>
                </div>
                <div className="mt-2 pt-1.5 border-t border-gray-50 flex items-center">
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-[#63799A]">
            <p className="text-base font-medium">No reviews published yet.</p>
            <p className="text-sm mt-1">Be the first to share your experience!</p>
            <button
              onClick={handleOpenModal}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0A1E37] text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              <Plus size={16} weight="bold" />
              Upload Review
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-2">
            {reviews.map((person) => {
              const hasPhotos = person.photos && person.photos.length > 0;

              return (
                <div
                  key={person.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 flex flex-col justify-between shadow-[0px_4px_20px_rgba(10,30,55,0.05)] hover:shadow-[0px_8px_30px_rgba(10,30,55,0.09)] hover:border-[#FF8117]/40 transition-all duration-300 group box-border"
                >
                  <div>
                    {/* Top Profile: Initials avatar + Name + Role + Rating Stars */}
                    <div className="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-gray-50">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          aria-hidden="true"
                          className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full border-2 border-[#FFC65B] bg-[#081D36] text-[11px] sm:text-xs font-bold text-white shadow-xs"
                        >
                          {person.initials ||
                            person.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-[#0A1E37] text-sm leading-snug truncate group-hover:text-[#FF8117] transition-colors">
                            {person.name}
                          </h3>
                          <p className="text-[11px] text-[#63799A] truncate">
                            {person.role || "Achievers Alumnus"}
                          </p>
                        </div>
                      </div>

                      {/* Star Rating */}
                      <div
                        className="flex items-center gap-0.5 text-amber-400 shrink-0"
                        title={`${person.rating || 5} out of 5 stars`}
                      >
                        {Array.from({ length: Math.min(5, Math.max(1, person.rating || 5)) }).map((_, i) => (
                          <Star key={i} size={15} weight="fill" />
                        ))}
                      </div>
                    </div>

                    {/* Middle Content: Review text with View More link */}
                    <div className="relative mb-3.5">
                      <p className="text-xs sm:text-[13px] text-[#464555] leading-relaxed line-clamp-3 break-words [overflow-wrap:anywhere]">
                        &ldquo;{cleanReviewText(person.text)}&rdquo;
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedReview(person)}
                        className="text-xs font-bold text-[#FF8117] hover:text-[#e06f0e] hover:underline transition-colors mt-1.5 inline-flex items-center gap-1 cursor-pointer"
                      >
                        View More &rarr;
                      </button>
                    </div>

                    {/* Attached Photos Thumbnail Grid */}
                    {hasPhotos && (
                      <div className="mb-3.5">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#63799A] mb-2">
                          <span className="flex items-center gap-1.5 text-[#FF8117]">
                            <ImageIcon size={13} weight="bold" />
                            <span>Attached Photos ({person.photos.length})</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 w-full">
                          {person.photos.slice(0, 3).map((photo, pIdx) => {
                            const maxVisiblePhotos = 3;
                            const isLastSlot = pIdx === maxVisiblePhotos - 1;
                            const remainingCount = person.photos.length - maxVisiblePhotos;
                            const showRemainingBadge = isLastSlot && remainingCount > 0;

                            return (
                              <div
                                key={pIdx}
                                onClick={() => setSelectedReview(person)}
                                className="relative h-18 sm:h-20 rounded-xl overflow-hidden border border-gray-200 hover:border-[#FF8117] cursor-pointer group/photo transition-all bg-gray-50 shadow-2xs"
                              >
                                <Image
                                  src={photo}
                                  alt={`${person.name} media ${pIdx + 1}`}
                                  fill
                                  sizes="(max-width: 768px) 33vw, 120px"
                                  className="object-cover group-hover/photo:scale-105 transition-transform duration-300"
                                />
                                {showRemainingBadge && (
                                  <div className="absolute inset-0 bg-black/75 backdrop-blur-2xs flex items-center justify-center transition-colors group-hover/photo:bg-black/60">
                                    <span className="text-white font-black text-xs tracking-wide">
                                      +{remainingCount}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer with Date */}
                  <div className="pt-2.5 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-[#63799A] shrink-0">
                    <CalendarBlank size={13} />
                    <span>{person.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Review Modal Flow */}
      <Transition appear show={isUploadOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[9999]" onClose={handleCloseModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 flex items-center justify-center p-4 overflow-hidden">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg max-h-[90vh] flex flex-col transform rounded-2xl bg-white p-6 sm:p-7 text-left shadow-2xl border border-gray-100 overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-gray-100 pb-4 shrink-0">
                  <div>
                    <Dialog.Title as="h3" className="text-xl font-bold text-[#0A1E37] leading-tight">
                      Upload Alumni Review
                    </Dialog.Title>
                    <p className="text-xs text-[#63799A] mt-1">
                      Share your journey and photos with current and future Achievers.
                    </p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors -mt-1 cursor-pointer"
                    aria-label="Close"
                  >
                    <X size={20} weight="bold" />
                  </button>
                </div>

                {/* Review Form */}
                <form onSubmit={handleSubmitReview} className="space-y-4 mt-5 overflow-y-auto pr-1 flex-1">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-bold text-[#0A1E37] uppercase tracking-wider mb-1.5">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={handleNameChange}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-[#0A1E37] placeholder-gray-400 focus:outline-none focus:border-[#FF8117] focus:ring-1 focus:ring-[#FF8117] transition-all capitalize"
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-bold text-[#0A1E37] uppercase tracking-wider mb-1.5">
                      Your Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-[#0A1E37] placeholder-gray-400 focus:outline-none focus:border-[#FF8117] focus:ring-1 focus:ring-[#FF8117] transition-all lowercase"
                    />
                  </div>

                  {/* Rating Input */}
                  <div>
                    <label className="block text-xs font-bold text-[#0A1E37] uppercase tracking-wider mb-1.5">
                      Rating <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5 h-11 px-3.5 rounded-xl bg-gray-50 border border-gray-200">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="cursor-pointer text-amber-400 hover:scale-110 transition-transform"
                          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                        >
                          <Star size={20} weight={star <= rating ? "fill" : "regular"} />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-gray-700 ml-2">{rating}/5</span>
                    </div>
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-xs font-bold text-[#0A1E37] uppercase tracking-wider mb-1.5">
                      Your Review / Experience <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={reviewText}
                      onChange={handleReviewTextChange}
                      placeholder="Tell us about your experience at Achievers, faculty mentorship, campus life, or exam preparation..."
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm leading-snug text-[#0A1E37] placeholder-gray-400 focus:outline-none focus:border-[#FF8117] focus:ring-1 focus:ring-[#FF8117] transition-all break-words [overflow-wrap:anywhere] resize-y"
                    />
                  </div>

                  {/* Image Upload Area */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#0A1E37] uppercase tracking-wider">
                        Upload Photos
                      </label>
                      {photos.length > 0 && (
                        <span className="text-[11px] font-semibold text-[#FF8117]">
                          {photos.length} {photos.length === 1 ? "photo" : "photos"} selected
                        </span>
                      )}
                    </div>

                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 hover:border-[#FF8117] rounded-xl cursor-pointer bg-gray-50/50 hover:bg-orange-50/20 transition-all p-3 text-center">
                      <UploadSimple size={22} className="text-[#FF8117] mb-1" />
                      <span className="text-xs font-semibold text-[#0A1E37]">
                        Click to select or drag and drop photos
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        PNG, JPG, WEBP up to 30MB (automatically optimized)
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Photo Previews with Separate Scrollbar */}
                    {photos.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-[#63799A] uppercase tracking-wider">
                            Preview ({photos.length})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setPhotos([]);
                              setImageFiles([]);
                            }}
                            className="text-[10px] font-semibold text-red-500 hover:text-red-700 transition-colors"
                          >
                            Clear all
                          </button>
                        </div>
                        <div className="max-h-28 overflow-y-auto pr-1 grid grid-cols-4 sm:grid-cols-5 gap-2 rounded-xl border border-gray-100 bg-gray-50/60 p-2 review-scroll">
                          {photos.map((img, idx) => (
                            <div
                              key={idx}
                              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group bg-white shadow-2xs"
                            >
                              <Image src={img} alt="Upload preview" fill className="object-cover" />
                              <button
                                type="button"
                                onClick={() => removePhoto(idx)}
                                className="absolute top-1 right-1 size-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 shadow-sm transition-opacity"
                                title="Remove photo"
                              >
                                <X size={11} weight="bold" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl bg-[#FF8117] hover:bg-[#e06f0e] text-white px-5 py-2.5 text-xs font-semibold shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                    >
                      <span>{isSubmitting ? "Uploading..." : "Upload Review"}</span>
                    </button>
                  </div>
                </form>
            </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Lightbox Photo Preview Modal */}
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
                    className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X size={18} weight="bold" />
                  </button>

                  {selectedPhoto && (
                    <div className="relative w-full h-[450px] rounded-xl overflow-hidden bg-slate-900">
                      <Image
                        src={selectedPhoto}
                        alt="Enlarged review photo"
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

      {/* Review Detail Modal */}
      <ReviewDetailModal
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
      />
    </section>
  );
}
