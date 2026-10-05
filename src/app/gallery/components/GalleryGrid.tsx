"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  X,
  Eye,
  Image as ImageIcon,
  CaretLeft,
  CaretRight,
  CaretDown,
  CheckCircle,
} from "@phosphor-icons/react";
import { GalleryCategory, GalleryImageOutput, fetchGalleryImages } from "../../../../lib/helpers/galleryAPI";
import { supabase } from "@/lib/supabaseClient";

// Fallback initial "Other" category images for Image-2 (Experience Life at Achievers)
const INITIAL_OTHER_IMAGES: GalleryImageOutput[] = [
  {
    gallery_image_id: "3b70f67a-542c-41d7-b2a9-579b38a8b0fa",
    title: "other1",
    category: GalleryCategory.OTHER,
    image_url: "https://mzbctopjpftwnkqpuqhf.supabase.co/storage/v1/object/public/gallery/gallery/Other/1791011231887-other1.jpg",
    storage_path: "gallery/Other/1791011231887-other1.jpg",
    file_size: 33287,
    mime_type: "image/jpeg",
    createdBy: "a12334e7-ecc8-44a3-803b-9935c10caafa",
    display_order: 7,
    is_Active: true,
    is_deleted: false,
    createdAt: "2026-10-03 07:07:18.56602+00",
  },
  {
    gallery_image_id: "2fb561fb-1b7d-4e6d-9949-41c7d2a2813e",
    title: "other2",
    category: GalleryCategory.OTHER,
    image_url: "https://mzbctopjpftwnkqpuqhf.supabase.co/storage/v1/object/public/gallery/gallery/Other/1791011248125-other2.png",
    storage_path: "gallery/Other/1791011248125-other2.png",
    file_size: 924894,
    mime_type: "image/png",
    createdBy: "a12334e7-ecc8-44a3-803b-9935c10caafa",
    display_order: 8,
    is_Active: true,
    is_deleted: false,
    createdAt: "2026-10-03 07:07:36.04842+00",
  },
];

// Fallback initial category images for Image-1 (Infrastructure, Student Life, Excellence)
const INITIAL_CATEGORY_IMAGES: GalleryImageOutput[] = [
  {
    gallery_image_id: "8e8211dd-5ba7-45f8-bb03-4c01e2d4746a",
    title: "infrastructure-1",
    category: GalleryCategory.INFRASTRUCTURE,
    image_url: "https://mzbctopjpftwnkqpuqhf.supabase.co/storage/v1/object/public/gallery/gallery/Infrastructure/1791009694655-infrastructure-1.png",
    storage_path: "gallery/Infrastructure/1791009694655-infrastructure-1.png",
    file_size: 6803168,
    mime_type: "image/png",
    createdBy: "a12334e7-ecc8-44a3-803b-9935c10caafa",
    display_order: 0,
    is_Active: true,
    is_deleted: false,
    createdAt: "2026-10-03 06:41:43.932475+00",
  },
  {
    gallery_image_id: "d0e9bc54-0422-4157-bf10-9c25d77455b9",
    title: "infrastructure-2",
    category: GalleryCategory.INFRASTRUCTURE,
    image_url: "https://mzbctopjpftwnkqpuqhf.supabase.co/storage/v1/object/public/gallery/gallery/Infrastructure/1791009871503-infrastructure-2.webp",
    storage_path: "gallery/Infrastructure/1791009871503-infrastructure-2.webp",
    file_size: 118734,
    mime_type: "image/webp",
    createdBy: "a12334e7-ecc8-44a3-803b-9935c10caafa",
    display_order: 1,
    is_Active: true,
    is_deleted: false,
    createdAt: "2026-10-03 06:44:38.506588+00",
  },
  {
    gallery_image_id: "cafb7f0f-c181-478b-967c-dfc3e9ac9fe8",
    title: "infrastructure-3",
    category: GalleryCategory.INFRASTRUCTURE,
    image_url: "https://mzbctopjpftwnkqpuqhf.supabase.co/storage/v1/object/public/gallery/gallery/Infrastructure/1791011036004-infrastructure-3.jpg",
    storage_path: "gallery/Infrastructure/1791011036004-infrastructure-3.jpg",
    file_size: 34354,
    mime_type: "image/jpeg",
    createdBy: "a12334e7-ecc8-44a3-803b-9935c10caafa",
    display_order: 2,
    is_Active: true,
    is_deleted: false,
    createdAt: "2026-10-03 07:04:01.629195+00",
  },
  {
    gallery_image_id: "4077b64c-95db-4255-9989-f675f3fcc01d",
    title: "studentlife_1",
    category: GalleryCategory.STUDENT_LIFE,
    image_url: "https://mzbctopjpftwnkqpuqhf.supabase.co/storage/v1/object/public/gallery/gallery/Student-Life/1791011063982-studentlife_1.webp",
    storage_path: "gallery/Student-Life/1791011063982-studentlife_1.webp",
    file_size: 107942,
    mime_type: "image/webp",
    createdBy: "a12334e7-ecc8-44a3-803b-9935c10caafa",
    display_order: 3,
    is_Active: true,
    is_deleted: false,
    createdAt: "2026-10-03 07:04:30.105401+00",
  },
  {
    gallery_image_id: "e588b8d8-ae9e-481f-b7fd-dea5096ad28c",
    title: "studentlife_2",
    category: GalleryCategory.STUDENT_LIFE,
    image_url: "https://mzbctopjpftwnkqpuqhf.supabase.co/storage/v1/object/public/gallery/gallery/Student-Life/1791011083922-studentlife_2.jpg",
    storage_path: "gallery/Student-Life/1791011083922-studentlife_2.jpg",
    file_size: 110883,
    mime_type: "image/jpeg",
    createdBy: "a12334e7-ecc8-44a3-803b-9935c10caafa",
    display_order: 4,
    is_Active: true,
    is_deleted: false,
    createdAt: "2026-10-03 07:04:49.998193+00",
  },
  {
    gallery_image_id: "7283871e-1bbf-4c3b-b4f6-098cfe52794d",
    title: "studentexcellence_1",
    category: GalleryCategory.EXCELLENCE,
    image_url: "https://mzbctopjpftwnkqpuqhf.supabase.co/storage/v1/object/public/gallery/gallery/Excellence/1791011163137-studentexcellence_1.jpg",
    storage_path: "gallery/Excellence/1791011163137-studentexcellence_1.jpg",
    file_size: 38134,
    mime_type: "image/jpeg",
    createdBy: "a12334e7-ecc8-44a3-803b-9935c10caafa",
    display_order: 5,
    is_Active: true,
    is_deleted: false,
    createdAt: "2026-10-03 07:06:09.98738+00",
  },
  {
    gallery_image_id: "9cc41050-bd9f-4e01-91d6-4e9442c0bb89",
    title: "studentexcellence_2",
    category: GalleryCategory.EXCELLENCE,
    image_url: "https://mzbctopjpftwnkqpuqhf.supabase.co/storage/v1/object/public/gallery/gallery/Excellence/1791011182940-studentexcellence_2.avif",
    storage_path: "gallery/Excellence/1791011182940-studentexcellence_2.avif",
    file_size: 10147,
    mime_type: "image/avif",
    createdBy: "a12334e7-ecc8-44a3-803b-9935c10caafa",
    display_order: 6,
    is_Active: true,
    is_deleted: false,
    createdAt: "2026-10-03 07:06:28.42043+00",
  },
];

// Official category tabs for Section 2 (Image-1) - Other is NOT here!
const CATEGORIES = ["All", "Infrastructure", "Student Life", "Excellence"];
const INITIAL_BATCH_SIZE = 6;
const BATCH_INCREMENT = 6;

export default function GalleryGrid() {
  const [allImages, setAllImages] = useState<GalleryImageOutput[]>([
    ...INITIAL_CATEGORY_IMAGES,
    ...INITIAL_OTHER_IMAGES,
  ]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  // Lightbox Modal State
  const [lightboxImage, setLightboxImage] = useState<GalleryImageOutput | null>(null);

  // Fetch images from API on mount and subscribe to realtime updates
  useEffect(() => {
    let isMounted = true;

    async function loadImages() {
      try {
        const data = await fetchGalleryImages();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const activeImages = data.filter((item) => item.is_Active !== false && !item.is_deleted);
          if (activeImages.length > 0) {
            setAllImages(activeImages);
          }
        }
      } catch (err) {
        console.error("Could not fetch gallery images from API:", err);
      }
    }

    // Initial load with shimmer
    setIsLoading(true);
    loadImages().finally(() => {
      if (isMounted) setIsLoading(false);
    });

    // 1. Supabase Realtime WebSocket Subscription (with unique channel name)
    const channelId = `gallery_rt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gallery_images' },
        (payload) => {
          console.log("Supabase Realtime event received:", payload);

          if (payload.eventType === 'INSERT' && payload.new) {
            const newImg = payload.new as GalleryImageOutput;
            if (newImg.is_Active !== false && !newImg.is_deleted) {
              setAllImages((prev) => {
                const exists = prev.some((img) => img.gallery_image_id === newImg.gallery_image_id);
                if (exists) return prev;
                return [newImg, ...prev];
              });
            }
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const oldId = (payload.old as any).gallery_image_id;
            if (oldId) {
              setAllImages((prev) => prev.filter((img) => img.gallery_image_id !== oldId));
            }
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updated = payload.new as GalleryImageOutput;
            if (updated.is_deleted || updated.is_Active === false) {
              setAllImages((prev) => prev.filter((img) => img.gallery_image_id !== updated.gallery_image_id));
            } else {
              setAllImages((prev) =>
                prev.map((img) => (img.gallery_image_id === updated.gallery_image_id ? updated : img))
              );
            }
          }

          // Fetch fresh list from server to ensure perfect sync
          loadImages();
        }
      )
      .subscribe((status) => {
        console.log("Gallery Realtime subscription status:", status);
      });

    // 2. Cross-tab BroadcastChannel sync (triggers 0ms instantly when admin uploads/deletes)
    let broadcastChannel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        broadcastChannel = new BroadcastChannel("gallery_realtime_sync");
        broadcastChannel.onmessage = () => {
          loadImages();
        };
      } catch (e) {
        console.error("BroadcastChannel error:", e);
      }
    }

    // 3. Storage event fallback for cross-tab sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "gallery_realtime_timestamp") {
        loadImages();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // 4. Window Focus & Tab Visibility Change (re-syncs immediately when switching back to tab)
    const handleVisibilityOrFocus = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        loadImages();
      }
    };
    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    // 5. Automatic periodic background re-sync (every 3 seconds)
    const autoSyncInterval = setInterval(() => {
      loadImages();
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(autoSyncInterval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      if (broadcastChannel) broadcastChannel.close();
      supabase.removeChannel(channel);
    };
  }, []);

  // 1. Other Category Images: ONLY in Image-2 ("Experience Life at Achievers")
  const otherImages = useMemo(() => {
    const list = allImages.filter((img) => img.category?.toLowerCase() === "other");
    return list.length > 0 ? list : INITIAL_OTHER_IMAGES;
  }, [allImages]);

  // 2. Category Images for Image-1 (Infrastructure, Student Life, Excellence): Other is NOT in Image-1!
  const categoryImages = useMemo(() => {
    return allImages.filter((img) => img.category?.toLowerCase() !== "other");
  }, [allImages]);

  // Filtered images for Image-1
  const filteredImages = useMemo(() => {
    return categoryImages.filter((img) => {
      return activeCategory === "All" || img.category?.toLowerCase() === activeCategory.toLowerCase();
    });
  }, [categoryImages, activeCategory]);

  // Count per category (for Image-1 categories)
  const getCategoryCount = (cat: string) => {
    if (cat === "All") return categoryImages.length;
    return categoryImages.filter((img) => img.category?.toLowerCase() === cat.toLowerCase()).length;
  };

  // Lightbox carousel navigation
  const handleNextPhoto = useCallback(() => {
    if (!lightboxImage) return;
    const currentList = lightboxImage.category?.toLowerCase() === "other" ? otherImages : filteredImages;
    const idx = currentList.findIndex((img) => img.gallery_image_id === lightboxImage.gallery_image_id);
    if (idx >= 0) {
      setLightboxImage(currentList[(idx + 1) % currentList.length]);
    }
  }, [lightboxImage, otherImages, filteredImages]);

  const handlePrevPhoto = useCallback(() => {
    if (!lightboxImage) return;
    const currentList = lightboxImage.category?.toLowerCase() === "other" ? otherImages : filteredImages;
    const idx = currentList.findIndex((img) => img.gallery_image_id === lightboxImage.gallery_image_id);
    if (idx >= 0) {
      setLightboxImage(currentList[(idx - 1 + currentList.length) % currentList.length]);
    }
  }, [lightboxImage, otherImages, filteredImages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxImage) return;
      if (e.key === "ArrowRight") handleNextPhoto();
      if (e.key === "ArrowLeft") handlePrevPhoto();
      if (e.key === "Escape") setLightboxImage(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage, handleNextPhoto, handlePrevPhoto]);

  return (
    <section className="bg-[#FFFFFF] py-[32px] sm:py-[48px]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-[40px]">
        {/* ============================================================== */}
        {/* IMAGE-2 SECTION: "Experience Life at Achievers" (Other Category) */}
        {/* ============================================================== */}
        <div className="flex flex-col items-center text-center gap-[12px] mb-[32px] md:mb-[48px]">
          <span className="text-[#FFA401] font-bold text-[16px] tracking-[1.36px] uppercase">
            Campus Tour
          </span>
          <h2 className="font-sora font-semibold text-[32px] md:text-[40px] leading-[42px] md:leading-[52px] text-[#0A1E37] max-w-[600px]">
            Experience Life at Achievers
          </h2>
          <p className="font-sora font-normal text-[16px] leading-[26px] text-[#424654] max-w-[700px]">
            Explore our world-class infrastructure, collaborative learning spaces, and vibrant student community designed to foster excellence.
          </p>
        </div>

        {/* Other Category Images in Image-2 (Stable Box, Slight Moving Inside Box - NO Title) */}
        <div className="max-h-[600px] md:max-h-[700px] overflow-y-auto pr-2 sm:pr-3 gallery-scroll mb-[56px] md:mb-[68px]">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 pb-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="relative aspect-[4/3] w-full rounded-[20px] overflow-hidden bg-slate-100 shimmer border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                />
              ))}
            </div>
          ) : (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 pb-2">
              {otherImages.map((image) => (
                <div
                  key={image.gallery_image_id}
                  className="group relative aspect-[4/3] w-full rounded-[20px] md:rounded-[24px] overflow-hidden cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_rgba(10,30,55,0.12)] transition-all duration-300 border border-gray-100 bg-gray-900"
                  onClick={() => setLightboxImage(image)}
                >
                  <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <Image
                      src={image.image_url}
                      alt="Life at Achievers"
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </div>

                  {/* Clean Hover Overlay with Category Pill & View Button */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1E37]/85 via-[#0A1E37]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 sm:p-5">
                    <div className="flex justify-end">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-sm transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <Eye size={14} weight="bold" />
                        <span>View</span>
                      </span>
                    </div>

                    <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0A1E37]/85 text-[#FFA401] border border-[#FFA401]/30 backdrop-blur-md shadow-xs">
                        LIFE AT ACHIEVERS
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* IMAGE-1 SECTION: Category Wise Images (Other is NOT here!)       */}
        {/* ============================================================== */}
        {/* Category Tabs & Search (STATIONARY: Pills do NOT move when scrolling images) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          {/* Category Tabs: All, Infrastructure, Student Life, Excellence */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-2.5">
            {CATEGORIES.map((cat) => {
              const count = getCategoryCount(cat);
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setIsCategoryLoading(true);
                    setTimeout(() => setIsCategoryLoading(false), 400);
                  }}
                  className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-sora font-semibold text-[13px] sm:text-[14px] transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? "bg-[#0A1E37] text-white shadow-md scale-105 ring-2 ring-[#0A1E37]/15"
                      : "bg-[#F7F9FB] text-[#424654] hover:bg-[#E0E3E5] hover:text-[#0A1E37]"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isActive ? "bg-white/20 text-white" : "bg-gray-200/80 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* VERTICAL SCROLL CONTAINER: Only images part will move, Not pills */}
        {/* ============================================================== */}
        {isLoading || isCategoryLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="relative aspect-[4/3] w-full rounded-[20px] overflow-hidden bg-slate-100 shimmer border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
              />
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center text-[#64748B]">
            <ImageIcon size={44} className="mx-auto text-slate-400 mb-3" />
            <h4 className="text-base font-semibold text-slate-800">No photos found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {`There are currently no photos in the ${activeCategory} category.`}
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Scrollable grid container */}
            <div className="max-h-[600px] md:max-h-[700px] overflow-y-auto pr-2 sm:pr-3 gallery-scroll">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 pb-2">
                {filteredImages.map((image) => (
                  <div
                    key={image.gallery_image_id}
                    onClick={() => setLightboxImage(image)}
                    className="group relative aspect-[4/3] w-full rounded-[20px] overflow-hidden border border-gray-100 bg-gray-900 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_rgba(10,30,55,0.12)] cursor-pointer transition-all duration-300"
                  >
                    {/* Uniform Image with Aspect Ratio & slight zoom inside box */}
                    <div className="absolute inset-0 w-full h-full overflow-hidden">
                      <Image
                        src={image.image_url}
                        alt={image.category}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </div>

                    {/* Clean Hover Overlay with Category Pill & View Button (NO Title) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1E37]/85 via-[#0A1E37]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 sm:p-5">
                      <div className="flex justify-end">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-sm transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <Eye size={14} weight="bold" />
                          <span>View</span>
                        </span>
                      </div>

                      <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0A1E37]/85 text-[#FFA401] border border-[#FFA401]/30 backdrop-blur-md shadow-xs">
                          {image.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Lightbox Modal: Translucent frosted glass + ambient glow, NO "OTHER" badges */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071322]/85 backdrop-blur-xl p-3 sm:p-6 transition-opacity duration-300 animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          {/* Ambient blurred glow of the image itself in background */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <Image
              src={lightboxImage.image_url}
              alt=""
              fill
              className="object-cover blur-3xl opacity-20 scale-125"
              priority
            />
          </div>

          {/* Top Header Controls */}
          <div className="absolute top-4 left-4 right-4 z-[110] flex items-center justify-between pointer-events-none">
            {/* Show category tag ONLY IF it is NOT 'Other' */}
            {lightboxImage.category && lightboxImage.category.toLowerCase() !== "other" ? (
              <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20 backdrop-blur-md shadow-xs pointer-events-auto">
                {lightboxImage.category}
              </span>
            ) : (
              <span />
            )}

            <button
              className="text-white hover:text-[#FFA401] bg-white/10 hover:bg-white/25 rounded-full p-2.5 transition-all duration-300 pointer-events-auto cursor-pointer border border-white/20 backdrop-blur-md shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxImage(null);
              }}
              aria-label="Close"
            >
              <X size={22} weight="bold" />
            </button>
          </div>

          {/* Previous Arrow Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevPhoto();
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-[110] w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 backdrop-blur-md shadow-lg hover:scale-105 active:scale-95"
            aria-label="Previous image"
          >
            <CaretLeft size={24} weight="bold" />
          </button>

          {/* Lightbox Image Container (Floating transparent with soft shadow, NO Other, NO Black Letterbox) */}
          <div
            className="relative w-full max-w-[1100px] h-[75vh] md:h-[84vh] flex items-center justify-center animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxImage.image_url}
              alt={lightboxImage.category || "Campus Photo"}
              fill
              className="object-contain drop-shadow-2xl rounded-2xl"
              sizes="100vw"
              priority
            />
          </div>

          {/* Next Arrow Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextPhoto();
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-[110] w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 backdrop-blur-md shadow-lg hover:scale-105 active:scale-95"
            aria-label="Next image"
          >
            <CaretRight size={24} weight="bold" />
          </button>
        </div>
      )}
    </section>
  );
}

