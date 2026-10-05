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
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { INITIAL_REVIEWS, ReviewItem } from "@/data/reviewsData";

export default function Testimonials() {
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load from localStorage or initialize with INITIAL_REVIEWS
  useEffect(() => {
    try {
      const stored = localStorage.getItem("achievers_admin_reviews");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If stored reviews exist and have items, use visible ones
          const visible = parsed.filter((r: ReviewItem) => r.isVisible !== false);
          setReviews(visible.length > 0 ? visible : INITIAL_REVIEWS);
        } else {
          setReviews(INITIAL_REVIEWS);
          localStorage.setItem("achievers_admin_reviews", JSON.stringify(INITIAL_REVIEWS));
        }
      } else {
        setReviews(INITIAL_REVIEWS);
        localStorage.setItem("achievers_admin_reviews", JSON.stringify(INITIAL_REVIEWS));
      }
    } catch {
      setReviews(INITIAL_REVIEWS);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload only image files");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Please write your review");
      return;
    }

    setIsSubmitting(true);

    const today = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = `${monthNames[today.getMonth()]} ${String(today.getDate()).padStart(2, "0")}, ${today.getFullYear()}`;

    const newReview: ReviewItem = {
      id: Date.now(),
      initials: name
        .trim()
        .split(" ")
        .map((p) => p[0])
        .join("")
        .substring(0, 2)
        .toUpperCase(),
      name: name.trim(),
      date: formattedDate,
      text: reviewText.trim(),
      isVisible: true,
      photos: photos,
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);

    // Save to localStorage
    try {
      localStorage.setItem("achievers_admin_reviews", JSON.stringify(updatedReviews));
    } catch {
      // quota or local storage fail safe
    }

    toast.success("Thank you! Your review has been uploaded successfully.");

    // Reset Form
    setName("");
    setReviewText("");
    setPhotos([]);
    setIsSubmitting(false);
    setIsUploadOpen(false);
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
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF8117] hover:bg-[#e06f0e] text-white px-5 py-3 font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
        >
          <Plus size={18} weight="bold" />
          <span>Upload Review & Photos</span>
        </button>
      </div>

      {/* Review Boxes Grid (Static Review Boxes with Optional Images) */}
      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-[#63799A]">
          <p className="text-base font-medium">No reviews published yet.</p>
          <p className="text-sm mt-1">Be the first to share your experience!</p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0A1E37] text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            <Plus size={16} weight="bold" />
            Upload Review
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((person) => {
            const hasPhotos = person.photos && person.photos.length > 0;

            return (
              <figure
                key={person.id}
                className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-[0px_4px_20px_rgba(10,30,55,0.05)] hover:shadow-[0px_8px_30px_rgba(10,30,55,0.09)] transition-all duration-300"
              >
                <div>
                  {/* Top Profile: Only Avatar and Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      aria-hidden="true"
                      className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-[#FFC65B] bg-[#081D36] text-sm font-bold text-white shadow-xs"
                    >
                      {person.initials ||
                        person.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                    </div>
                    <span className="font-bold text-[#0A1E37] text-base leading-snug">
                      {person.name}
                    </span>
                  </div>

                  {/* Review Quote Text */}
                  <blockquote className="text-[14.5px] leading-relaxed text-[#464555]">
                    <span aria-hidden="true" className="inline-block text-xl leading-4 text-[#FF8117] mr-1.5 font-serif font-bold">
                      &ldquo;
                    </span>
                    {person.text}
                  </blockquote>

                  {/* Images Uploaded With Review (Optional in Review Boxes) */}
                  {hasPhotos && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-[11px] font-bold text-[#63799A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <ImageIcon size={14} />
                        <span>Attached Photos ({person.photos.length})</span>
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {person.photos.map((photo, pIndex) => (
                          <div
                            key={pIndex}
                            onClick={() => setSelectedPhoto(photo)}
                            className="group relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer shadow-xs hover:border-[#FF8117] transition-all"
                          >
                            <Image
                              src={photo}
                              alt={`${person.name} photo attachment ${pIndex + 1}`}
                              fill
                              sizes="(max-width: 768px) 50vw, 200px"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 text-white text-[11px] font-semibold bg-black/60 px-2 py-1 rounded-md transition-opacity">
                                View
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer with Date */}
                <div className="mt-5 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-[#63799A]">
                  <span className="flex items-center gap-1.5">
                    <CalendarBlank size={14} />
                    {person.date}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <CheckCircle size={12} weight="fill" />
                    Verified Alumni
                  </span>
                </div>
              </figure>
            );
          })}
        </div>
      )}

      {/* Upload Review Modal Flow */}
      <Transition appear show={isUploadOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[9999]" onClose={() => setIsUploadOpen(false)}>
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
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 sm:p-7 text-left align-middle shadow-2xl transition-all border border-gray-100">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                      <Dialog.Title as="h3" className="text-xl font-bold text-[#0A1E37]">
                        Upload Alumni Review
                      </Dialog.Title>
                      <p className="text-xs text-[#63799A] mt-0.5">
                        Share your journey and photos with current and future Achievers.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsUploadOpen(false)}
                      className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      aria-label="Close"
                    >
                      <X size={20} weight="bold" />
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmitReview} className="space-y-4 mt-5">
                    {/* Name Input */}
                    <div>
                      <label className="block text-xs font-bold text-[#0A1E37] uppercase tracking-wider mb-1.5">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-[#0A1E37] placeholder-gray-400 focus:outline-none focus:border-[#FF8117] focus:ring-1 focus:ring-[#FF8117] transition-all"
                        required
                      />
                    </div>



                    {/* Review Text */}
                    <div>
                      <label className="block text-xs font-bold text-[#0A1E37] uppercase tracking-wider mb-1.5">
                        Your Review / Experience <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Tell us about your experience at Achievers, faculty mentorship, campus life, or exam preparation..."
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-[#0A1E37] placeholder-gray-400 focus:outline-none focus:border-[#FF8117] focus:ring-1 focus:ring-[#FF8117] transition-all"
                        required
                      />
                    </div>

                    {/* Image Upload Area (Optional) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-[#0A1E37] uppercase tracking-wider">
                          Upload Photos <span className="text-gray-400 font-normal lowercase">(optional)</span>
                        </label>
                        <span className="text-[11px] text-gray-500">
                          Campus memories, achievements, or your photo
                        </span>
                      </div>

                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 hover:border-[#FF8117] rounded-xl cursor-pointer bg-gray-50/50 hover:bg-orange-50/20 transition-all p-3 text-center">
                        <UploadSimple size={24} className="text-[#FF8117] mb-1" />
                        <span className="text-xs font-semibold text-[#0A1E37]">
                          Click to select or drag and drop photos
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5">
                          PNG, JPG, WEBP up to 5MB
                        </span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>

                      {/* Photo Previews */}
                      {photos.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {photos.map((img, idx) => (
                            <div
                              key={idx}
                              className="relative h-16 w-16 rounded-lg overflow-hidden border border-gray-200 group"
                            >
                              <Image src={img} alt="Upload preview" fill className="object-cover" />
                              <button
                                type="button"
                                onClick={() => removePhoto(idx)}
                                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 shadow-sm"
                                title="Remove photo"
                              >
                                <X size={12} weight="bold" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setIsUploadOpen(false)}
                        className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-xl bg-[#FF8117] hover:bg-[#e06f0e] text-white px-5 py-2.5 text-xs font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Plus size={16} weight="bold" />
                        <span>Publish Review</span>
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
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
    </section>
  );
}
