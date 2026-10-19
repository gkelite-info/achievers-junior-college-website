"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { X, Star, CalendarBlank, Image as ImageIcon } from "@phosphor-icons/react";
import { ReviewItem } from "@/data/reviewsData";

interface ReviewDetailModalProps {
  review: ReviewItem | null;
  onClose: () => void;
}

export default function ReviewDetailModal({
  review,
  onClose,
}: ReviewDetailModalProps) {
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const uniquePhotos = Array.from(new Set(review?.photos || []));

  useEffect(() => {
    setActivePhoto(null);
  }, [review]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (review) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [review]);

  if (!review) return null;

  const cleanText = (review.text || "").replace(/^["'“\s]+|["'”\s]+$/g, "");
  const ratingCount = Math.min(5, Math.max(1, review.rating || 5));

  const initials =
    review.initials ||
    review.name
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-2 border-[#FFC65B] bg-[#081D36] text-white shadow-xs">
              {initials}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#0A1E37] leading-tight">
                {review.name}
              </h3>
              <p className="text-xs text-[#63799A]">
                {review.role || "Achievers Alumnus"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: ratingCount }).map((_, i) => (
                <Star key={i} size={16} weight="fill" />
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X size={20} weight="bold" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 review-scroll">
          {/* Review text in quote container */}
          <div className="bg-[#FFF8F2] border border-[#FFE4CC] rounded-xl p-4 sm:p-5">
            <p className="text-sm sm:text-base text-[#191C1E] leading-relaxed break-words [overflow-wrap:anywhere]">
              &ldquo;{cleanText}&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-[#63799A]">
              <CalendarBlank size={14} />
              <span>Posted on {review.date || "Recent"}</span>
            </div>
          </div>

          {/* Attached Photos */}
          {uniquePhotos.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#63799A] mb-2.5">
                <ImageIcon size={16} weight="bold" />
                <span>Attached Photos ({uniquePhotos.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {uniquePhotos.map((photo, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActivePhoto(photo)}
                    className="relative h-28 sm:h-36 rounded-xl overflow-hidden border border-gray-200 hover:border-[#FF8117] cursor-pointer group transition-all bg-gray-50 shadow-2xs"
                  >
                    <Image
                      src={photo}
                      alt={`${review.name} photo ${idx + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 200px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white text-[10px] font-semibold bg-black/60 px-2 py-0.5 rounded transition-opacity">
                        View Larger
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enlarged Photo Lightbox */}
      {activePhoto && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setActivePhoto(null);
          }}
          className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[85vh] rounded-2xl overflow-hidden border border-white/20 bg-slate-900"
          >
            <button
              type="button"
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-[#FF8117] hover:text-white transition-colors cursor-pointer"
              aria-label="Close photo preview"
            >
              <X size={18} weight="bold" />
            </button>
            <div className="relative w-full h-[65vh]">
              <Image
                src={activePhoto}
                alt="Enlarged review photo"
                fill
                className="object-contain p-2"
                sizes="(max-width: 768px) 100vw, 900px"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
