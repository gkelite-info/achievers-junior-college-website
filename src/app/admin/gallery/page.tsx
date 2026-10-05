"use client";

import React, { useState, useMemo, useRef, Fragment } from "react";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import {
  MagnifyingGlass,
  CaretDown,
  CloudArrowUp,
  Trash,
  CalendarBlank,
  X,
  Eye,
  Check,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";

import { fetchGalleryImages, uploadGalleryImage, deleteGalleryImage, GalleryCategory, GalleryImageOutput } from "@/lib/helpers/galleryAPI";
import { supabase } from "@/lib/supabaseClient";
import { Pagination } from "@/app/admin/components/Pagination";
import { useUser } from "@/context/UserContext";
import { GalleryOverallShimmer } from "@/app/admin/components/Shimmers";
import { useAdminLoading } from "@/app/admin/context/AdminLoadingContext";

function GalleryGridShimmer() {
  return (
    <>
      {Array.from({ length: 11 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm flex flex-col"
        >
          <div className="relative aspect-[4/3] w-full bg-gray-100 shimmer" />
          <div className="px-4 py-3 border-t border-gray-50 flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded-full bg-gray-200 shimmer" />
            <div className="h-3.5 w-24 rounded bg-gray-200 shimmer" />
          </div>
        </div>
      ))}
    </>
  );
}

type CategoryType = "Infrastructure" | "Student Life" | "Excellence" | "Other";

type GalleryItem = {
  id: string;
  title: string;
  category: CategoryType;
  image: string;
  date: string;
  timestamp: number;
  isUploading?: boolean;
};

export default function AdminGalleryPage() {
  const { user } = useUser();
  const { setIsPageLoading, triggerTabShimmer } = useAdminLoading();
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGridLoading, setIsGridLoading] = useState(false);

  const [categoryCounts, setCategoryCounts] = useState<{
    all: number;
    infrastructure: number;
    studentLife: number;
    excellence: number;
    other: number;
  }>({
    all: 0,
    infrastructure: 0,
    studentLife: 0,
    excellence: 0,
    other: 0,
  });

  // Initial Load from DB
  React.useEffect(() => {
    async function loadImages() {
      try {
        setIsLoading(true);
        setIsPageLoading(true);
        const data = await fetchGalleryImages();
        const formatted = data.map((item) => ({
          id: item.gallery_image_id,
          title: item.title || "Untitled",
          category: item.category as CategoryType,
          image: item.image_url,
          date: new Date(item.createdAt).toLocaleDateString("en-US", { month: 'short', day: '2-digit', year: 'numeric' }),
          timestamp: new Date(item.createdAt).getTime(),
        }));
        setImages(formatted);
        setCategoryCounts({
          all: data.length,
          infrastructure: data.filter((img) => img.category === "Infrastructure").length,
          studentLife: data.filter((img) => img.category === "Student Life").length,
          excellence: data.filter((img) => img.category === "Excellence").length,
          other: data.filter((img) => img.category === "Other").length,
        });
      } catch (err) {
        console.error("Failed to load gallery images", err);
        toast.error("Failed to load gallery images");
      } finally {
        setIsLoading(false);
        setIsPageLoading(false);
      }
    }
    loadImages();
  }, [setIsPageLoading]);

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<"latest" | "oldest">("latest");

  // Debounce search input to trigger shimmer and delay filtering
  React.useEffect(() => {
    if (searchInput !== searchQuery) {
      setIsGridLoading(true);
      const timer = setTimeout(() => {
        setSearchQuery(searchInput);
        setIsGridLoading(false);
      }, 400); // 400ms shimmer
      return () => clearTimeout(timer);
    }
  }, [searchInput, searchQuery]);

  // Handle Category Click: Fetch from DB with shimmer transition
  const handleCategoryChange = async (cat: string) => {
    if (cat === activeCategory && !isGridLoading) return;
    setActiveCategory(cat);
    setCurrentPage(1);
    setIsGridLoading(true);
    triggerTabShimmer(350);

    try {
      const [data] = await Promise.all([
        fetchGalleryImages(cat === "All" ? undefined : cat),
        new Promise((resolve) => setTimeout(resolve, 350)), // smooth perceptible shimmer transition
      ]);

      const formatted = data.map((item) => ({
        id: item.gallery_image_id,
        title: item.title || "Untitled",
        category: item.category as CategoryType,
        image: item.image_url,
        date: new Date(item.createdAt).toLocaleDateString("en-US", { month: 'short', day: '2-digit', year: 'numeric' }),
        timestamp: new Date(item.createdAt).getTime(),
      }));
      setImages(formatted);
    } catch (err) {
      console.error("Failed to load category images", err);
      toast.error("Failed to load images from database");
    } finally {
      setIsGridLoading(false);
    }
  };

  // Upload Form State in First Card
  const [uploadCategory, setUploadCategory] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal States
  const [imageToDelete, setImageToDelete] = useState<GalleryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<GalleryItem | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);

  React.useEffect(() => {
    if (previewImage) {
      setIsPreviewLoading(true);
    }
  }, [previewImage]);

  // Filter & Sort
  const filteredImages = useMemo(() => {
    return images
      .filter((img) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = img.title.toLowerCase().includes(q);
          const matchCategory = img.category.toLowerCase().includes(q);
          const matchDate = img.date.toLowerCase().includes(q);
          return matchTitle || matchCategory || matchDate;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOption === "oldest") {
          return a.timestamp - b.timestamp;
        }
        return b.timestamp - a.timestamp;
      });
  }, [images, searchQuery, sortOption]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 11; // 11 items + 1 upload card = 12 grid items

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOption]);

  const paginatedImages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredImages.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredImages, currentPage, itemsPerPage]);

  // Handle Image Upload
  const handleUploadClick = () => {
    if (!uploadCategory) {
      toast.error("Please select a category first.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const category = uploadCategory as CategoryType;
    setIsUploading(true);

    const fileArray = Array.from(files);
    let successCount = 0;

    for (const file of fileArray) {
      try {
        const result = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const today = new Date();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedDate = `${monthNames[today.getMonth()]} ${String(today.getDate()).padStart(2, "0")}, ${today.getFullYear()}`;
        
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const title = file.name.replace(/\.[^/.]+$/, "") || "New Upload";

        const tempImage: GalleryItem = {
          id: tempId,
          title,
          category,
          image: result,
          date: formattedDate,
          timestamp: Date.now(),
          isUploading: true,
        };

        setImages((prev) => [tempImage, ...prev]);

        const storagePath = `gallery/${category.replace(/\s+/g, '-')}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        
        // 1. Upload file directly to Supabase Storage
        const { data: storageData, error: uploadError } = await supabase.storage
          .from("gallery")
          .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
          });
          
        if (uploadError) {
          console.error("Supabase storage error:", uploadError);
          throw new Error("Failed to upload image file to storage bucket.");
        }
        
        // 2. Get Public URL
        const { data: publicUrlData } = supabase.storage
          .from("gallery")
          .getPublicUrl(storagePath);

        // 3. Save metadata to the PostgreSQL database
        const uploaded = await uploadGalleryImage({
          title,
          category,
          image_url: publicUrlData.publicUrl,
          storage_path: storagePath,
          file_size: file.size,
          mime_type: file.type,
          createdBy: user?.authUserId,
          display_order: 0,
        });

        const newImage: GalleryItem = {
          id: uploaded.gallery_image_id,
          title: uploaded.title || title,
          category: uploaded.category as CategoryType,
          image: uploaded.image_url,
          date: new Date(uploaded.createdAt).toLocaleDateString("en-US", { month: 'short', day: '2-digit', year: 'numeric' }),
          timestamp: new Date(uploaded.createdAt).getTime(),
        };

        setImages((prev) => {
          const filtered = prev.filter((img) => img.id !== tempId);
          if (activeCategory === "All" || activeCategory === category) {
            return [newImage, ...filtered];
          }
          return filtered;
        });

        const countKey = category === "Student Life" ? "studentLife" : category.toLowerCase() as "infrastructure" | "studentLife" | "excellence" | "other";
        setCategoryCounts((prev) => ({
          ...prev,
          all: prev.all + 1,
          [countKey]: (prev[countKey] || 0) + 1,
        }));

        successCount++;
      } catch (err) {
        console.error("Failed to upload image:", err);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} image(s) added to ${category} successfully!`);
      // Notify website tabs immediately in real-time
      if (typeof window !== "undefined") {
        try {
          const bc = new BroadcastChannel("gallery_realtime_sync");
          bc.postMessage({ type: "GALLERY_UPDATED", timestamp: Date.now() });
          bc.close();
        } catch (e) {}
        try {
          localStorage.setItem("gallery_realtime_timestamp", Date.now().toString());
        } catch (e) {}
      }
    } else {
      toast.error("Failed to upload images. Please try again.");
    }

    setUploadCategory("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsUploading(false);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!imageToDelete) return;
    setIsDeleting(true);
    try {
      await deleteGalleryImage(imageToDelete.id);
      setImages((prev) => prev.filter((img) => img.id !== imageToDelete.id));
      const deletedCat = imageToDelete.category;
      const countKey = deletedCat === "Student Life" ? "studentLife" : deletedCat.toLowerCase() as "infrastructure" | "studentLife" | "excellence" | "other";
      setCategoryCounts((prev) => ({
        ...prev,
        all: Math.max(0, prev.all - 1),
        [countKey]: Math.max(0, (prev[countKey] || 1) - 1),
      }));
      toast.success(`Removed photo from ${imageToDelete.category}.`);
      setImageToDelete(null);

      // Notify website tabs immediately in real-time
      if (typeof window !== "undefined") {
        try {
          const bc = new BroadcastChannel("gallery_realtime_sync");
          bc.postMessage({ type: "GALLERY_DELETED", timestamp: Date.now() });
          bc.close();
        } catch (e) {}
        try {
          localStorage.setItem("gallery_realtime_timestamp", Date.now().toString());
        } catch (e) {}
      }
    } catch (err) {
      toast.error("Failed to delete image.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 1. Initial Page Load: Show full overall shimmer across the whole page
  if (isLoading) {
    return <GalleryOverallShimmer />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* 1. Header Section */}
      <div>
        <h1 className="text-[28px] font-extrabold text-[#111827] tracking-tight leading-tight">
          Gallery Management
        </h1>
        <p className="text-[13.5px] text-[#64748B] mt-1 max-w-3xl">
          Upload and manage images to showcase on the college website.
        </p>
      </div>

      {/* 2. Controls Toolbar: Category Filter Pills, Search Bar & Sort Dropdown */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Category Filter Pills (Fetches from DB with shimmer transition) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <button
            onClick={() => handleCategoryChange("All")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === "All"
                ? "bg-[#0E1528] text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200/80"
            }`}
          >
            All ({categoryCounts.all})
          </button>
          <button
            onClick={() => handleCategoryChange("Infrastructure")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === "Infrastructure"
                ? "bg-[#0E1528] text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200/80"
            }`}
          >
            Infrastructure ({categoryCounts.infrastructure})
          </button>
          <button
            onClick={() => handleCategoryChange("Student Life")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === "Student Life"
                ? "bg-[#0E1528] text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200/80"
            }`}
          >
            Student Life ({categoryCounts.studentLife})
          </button>
          <button
            onClick={() => handleCategoryChange("Excellence")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === "Excellence"
                ? "bg-[#0E1528] text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200/80"
            }`}
          >
            Excellence ({categoryCounts.excellence})
          </button>
          <button
            onClick={() => handleCategoryChange("Other")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === "Other"
                ? "bg-[#0E1528] text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200/80"
            }`}
          >
            Other ({categoryCounts.other})
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[220px] sm:min-w-[260px] flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <MagnifyingGlass size={16} weight="bold" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search images by category..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 shadow-xs transition-colors"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative min-w-[130px]">
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value as "latest" | "oldest");
                setIsGridLoading(true);
                setTimeout(() => setIsGridLoading(false), 400);
              }}
              className="w-full appearance-none px-3.5 pr-8 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 focus:outline-none focus:border-blue-500 shadow-xs cursor-pointer"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <CaretDown
              size={13}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 3. Gallery Grid (4 Columns, First Card is Upload Box) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {/* CARD 1: Upload New Image Card (Dashed Border) */}
        <div className="rounded-2xl border-2 border-dashed border-[#BFDBFE] bg-white p-4 sm:p-5 flex flex-col justify-between items-center text-center shadow-xs hover:border-blue-400 transition-colors">
          <div className="flex flex-col items-center">
            {/* Circle with Upload Cloud Icon */}
            <div className="w-11 h-11 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-2 shadow-xs">
              <CloudArrowUp size={24} weight="bold" />
            </div>
            <h3 className="text-[15px] font-bold text-[#111827]">Upload New Image</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Add an image to gallery</p>
          </div>

          <div className="w-full space-y-2 mt-3">
            {/* Select Category Dropdown */}
            <div className="relative w-full">
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full appearance-none px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
              >
                <option value="">Select Category</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Student Life">Student Life</option>
                <option value="Excellence">Excellence</option>
                <option value="Other">Other</option>
              </select>
              <CaretDown
                size={13}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            {/* Upload Image Button */}
            <button
              onClick={handleUploadClick}
              type="button"
              disabled={isUploading}
              className={`w-full py-2 px-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${isUploading ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Upload Image</span>
              )}
            </button>
          </div>
        </div>

        {/* Shimmers when category is loading from DB */}
        {isGridLoading && <GalleryGridShimmer />}

        {/* REMAINING CARDS: Gallery Images (Paginated) */}
        {!isGridLoading && paginatedImages.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-200"
          >
            {/* Image Container with Badges */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => setPreviewImage(item)}
              />

              {/* Top-Left Category Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-[#0E1528]/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-sm">
                  {item.category}
                </span>
              </div>

              {/* Top-Right Delete Trash Button (Hide if uploading) */}
              {!item.isUploading && (
                <div className="absolute top-3 right-3 z-30">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageToDelete(item);
                    }}
                    className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-[#EF4444] shadow-sm flex items-center justify-center cursor-pointer transition-all hover:scale-105"
                    title="Delete image"
                    aria-label="Delete image"
                  >
                    <Trash size={14} weight="regular" />
                  </button>
                </div>
              )}

              {/* Uploading Overlay */}
              {item.isUploading && (
                <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center transition-all duration-300">
                  <svg className="animate-spin h-8 w-8 text-white mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-white text-xs font-semibold px-3 py-1 bg-black/30 rounded-full">Uploading...</span>
                </div>
              )}

              {/* Quick Preview Hover Overlay (Hide if uploading) */}
              {!item.isUploading && (
                <button
                  type="button"
                  onClick={() => setPreviewImage(item)}
                  className="absolute inset-0 z-10 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  title="Click to view photo"
                >
                  <span className="bg-white/90 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                    <Eye size={14} weight="bold" /> View
                  </span>
                </button>
              )}
            </div>

            {/* Bottom Card Footer: Date with Calendar Icon */}
            <div className="px-4 py-3 bg-white flex items-center gap-1.5 text-[12px] text-[#64748B] border-t border-gray-50">
              <CalendarBlank size={14} className="text-[#94A3B8]" />
              <span>{item.date}</span>
            </div>
          </div>
        ))}
      </div>

      {!isGridLoading && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredImages.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          alwaysShow={true}
          bgClassName="bg-transparent pt-4"
        />
      )}

      {!isGridLoading && filteredImages.length === 0 && (
        <div className="col-span-full py-16 text-center text-gray-500 bg-white border border-gray-100 rounded-2xl shadow-xs">
          <p className="text-sm font-semibold text-gray-700">No images match your search</p>
          <p className="text-xs text-gray-400 mt-1">Try selecting another category or clearing your search filter.</p>
          <button
            onClick={() => {
              handleCategoryChange("All");
              setSearchInput("");
            }}
            className="mt-3 px-3.5 py-1.5 rounded-xl bg-[#0E1528] text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* 4. Delete Confirmation Modal (Matching Established Pattern) */}
      <Transition appear show={!!imageToDelete} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[10000]"
          onClose={() => setImageToDelete(null)}
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
                    onClick={() => setImageToDelete(null)}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg cursor-pointer"
                    aria-label="Close"
                  >
                    <X size={18} weight="bold" />
                  </button>

                  {/* Centered Circular Icon */}
                  <div className="w-14 h-14 rounded-full bg-[#FEF2F2] flex items-center justify-center mx-auto mb-4 border border-[#FEE2E2]">
                    <Trash size={26} weight="regular" className="text-[#EF4444]" />
                  </div>

                  <Dialog.Title
                    as="h3"
                    className="text-[20px] font-bold text-[#111827] text-center mb-2"
                  >
                    Delete this photo?
                  </Dialog.Title>

                  <p className="text-[13.5px] text-[#64748B] text-center max-w-[310px] mx-auto leading-relaxed mb-6">
                    This image will be permanently removed from the{" "}
                    <strong className="text-gray-800 font-semibold">{imageToDelete?.category}</strong>{" "}
                    gallery and will no longer appear on the website.
                  </p>

                  <div className="flex items-center justify-center gap-3 mt-2">
                    <button
                      type="button"
                      className="flex-1 py-2.5 px-4 rounded-xl border border-[#D0D5DD] bg-white hover:bg-gray-50 text-[14px] font-semibold text-[#344054] transition-colors cursor-pointer shadow-xs"
                      onClick={() => setImageToDelete(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isDeleting}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleConfirmDelete}
                    >
                      {isDeleting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash size={16} weight="bold" />
                          <span>Delete Photo</span>
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

      {/* 5. Full Image Lightbox Preview Modal */}
      <Transition appear show={!!previewImage} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[10000]"
          onClose={() => setPreviewImage(null)}
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
                <Dialog.Panel className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-700">
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-colors"
                  >
                    <X size={18} weight="bold" />
                  </button>

                    {previewImage && (
                      <div>
                        <div className="relative w-full flex justify-center items-center bg-slate-900 rounded-t-xl overflow-hidden min-h-[300px] sm:min-h-[400px]">
                          {isPreviewLoading && (
                            <div className="absolute inset-0 z-10 shimmer-dark" />
                          )}
                          <img
                            key={previewImage.image}
                            src={previewImage.image}
                            alt={previewImage.title}
                            className={`max-w-full max-h-[75vh] object-contain transition-opacity duration-300 relative z-20 ${isPreviewLoading ? 'opacity-0' : 'opacity-100'}`}
                            onLoad={() => setIsPreviewLoading(false)}
                            onError={() => setIsPreviewLoading(false)}
                          />
                        </div>
                        <div className="p-4 flex items-center text-xs bg-white rounded-b-xl">
                        <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg font-semibold text-xs">
                          {previewImage.category}
                        </span>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
