"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "@phosphor-icons/react";

// Top Accordion Highlights
const accordionHighlights = [
  { src: "/home-banner.webp", alt: "Vast Green Campus" },
  { src: "/cultivate-skills.png", alt: "Hands-on Learning" },
  { src: "/export-mentorship.png", alt: "Expert Mentorship" },
  { src: "/visionary-approach.png", alt: "Visionary Approach" },
];

// Gallery Database with Categories - Exactly 4 items per category to form perfect rectangles
const infraImages = [
  { src: "/campus-1.jpg", alt: "State-of-the-Art Architecture", category: "Infrastructure", classes: "col-span-1 sm:col-span-2 md:col-span-2 row-span-1 sm:row-span-2" },
  { src: "/campus-3.jpg", alt: "Collaborative Learning Spaces", category: "Infrastructure", classes: "col-span-1 sm:col-span-2 md:col-span-2 row-span-1" },
  { src: "/infra_lab_1787834339700.jpg", alt: "Advanced Science Labs", category: "Infrastructure", classes: "col-span-1 sm:col-span-1 md:col-span-1 row-span-1" },
  { src: "/infra_auditorium_1787834420299.jpg", alt: "Modern Auditorium", category: "Infrastructure", classes: "col-span-1 sm:col-span-1 md:col-span-1 row-span-1" },
];

const studentImages = [
  { src: "/campus-4.jpg", alt: "Vibrant Campus Life", category: "Student Life", classes: "col-span-1 sm:col-span-2 md:col-span-2 row-span-1 sm:row-span-2" },
  { src: "/student_cafe_1787834367710.jpg", alt: "Student Cafeteria", category: "Student Life", classes: "col-span-1 sm:col-span-2 md:col-span-2 row-span-1" },
  { src: "/campus-2.jpg", alt: "Modern Library Facilities", category: "Student Life", classes: "col-span-1 sm:col-span-1 md:col-span-1 row-span-1" },
  { src: "/student_sports_1787834353751.jpg", alt: "Sports & Athletics", category: "Student Life", classes: "col-span-1 sm:col-span-1 md:col-span-1 row-span-1" },
];

const excellenceImages = [
  { src: "/excellence_grad_1787834448067.jpg", alt: "Graduation Ceremony", category: "Excellence", classes: "col-span-1 sm:col-span-2 md:col-span-2 row-span-1 sm:row-span-2" },
  { src: "/excellence-2.jpg", alt: "Academic Excellence", category: "Excellence", classes: "col-span-1 sm:col-span-2 md:col-span-2 row-span-1" },
  { src: "/excellence-1.jpg", alt: "Awards and Recognition", category: "Excellence", classes: "col-span-1 sm:col-span-1 md:col-span-1 row-span-1" },
  { src: "/excellence_award_1787834405849.jpg", alt: "Leadership & Success", category: "Excellence", classes: "col-span-1 sm:col-span-1 md:col-span-1 row-span-1" },
];

const allGalleryImages = [...infraImages, ...studentImages, ...excellenceImages];

const categories = ["All", "Infrastructure", "Student Life", "Excellence"];

export default function GalleryGrid() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxImage, setLightboxImage] = useState<{src: string, alt: string} | null>(null);

  const filteredImages = activeCategory === "All" 
    ? allGalleryImages 
    : allGalleryImages.filter(img => img.category === activeCategory);

  return (
    <section className="bg-[#FFFFFF] py-[32px] sm:py-[48px]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-[40px]">
        
        {/* Header */}
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

        {/* 1. Interactive Expanding Accordion */}
        <div className="w-full flex h-[350px] md:h-[500px] gap-[8px] md:gap-[16px] mb-[64px]">
          {accordionHighlights.map((highlight, index) => (
            <div 
              key={index}
              className="relative flex-1 hover:flex-[3] transition-all duration-700 ease-in-out cursor-pointer rounded-[16px] md:rounded-[24px] overflow-hidden group shadow-lg"
              onClick={() => setLightboxImage(highlight)}
            >
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={highlight.src}
                  alt={highlight.alt}
                  fill
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
              
              {/* Overlay that fades in on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#111433]/90 via-[#111433]/10 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 ease-in-out flex flex-col justify-end p-[16px] md:p-[32px]">
                <div className="transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out delay-100 hidden md:block w-[300px]">
                  <h3 className="font-sora font-bold text-[24px] text-[#FFFFFF] drop-shadow-md border-l-4 border-[#FFA401] pl-3 truncate">
                    {highlight.alt}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Category Filters */}
        <div className="flex flex-wrap justify-center gap-[12px] md:gap-[16px] mb-[32px] md:mb-[48px]">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-[24px] py-[10px] rounded-full font-sora font-semibold text-[14px] md:text-[15px] transition-all duration-300 cursor-pointer ${
                activeCategory === cat 
                  ? "bg-[#0A1E37] text-white shadow-md scale-105" 
                  : "bg-[#F7F9FB] text-[#424654] hover:bg-[#E0E3E5]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. Filtered Gapless Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 auto-rows-[250px] gap-[16px] md:gap-[24px]">
          {filteredImages.map((image, index) => (
            <div 
              key={`${activeCategory}-${index}`} // forces re-animation on filter change
              className={`relative rounded-[16px] overflow-hidden group shadow-[0px_4px_20px_rgba(0,0,0,0.05)] cursor-pointer transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-4 ${image.classes}`}
              onClick={() => setLightboxImage(image)}
            >
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* Grid Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1E37]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out flex flex-col justify-end p-[24px]">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-in-out">
                  <span className="text-[#FFA401] font-bold text-[12px] uppercase tracking-wider mb-1 block">
                    {image.category}
                  </span>
                  <h3 className="font-sora font-semibold text-[18px] text-[#FFFFFF] leading-tight">
                    {image.alt}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 4. Full-Screen Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 transition-opacity duration-300 animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          {/* Close Button */}
          <button 
            className="absolute top-[24px] right-[24px] md:top-[40px] md:right-[40px] text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all duration-300 z-[110] cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxImage(null);
            }}
          >
            <X size={32} weight="bold" />
          </button>

          {/* Lightbox Content */}
          <div 
            className="relative w-full max-w-[1200px] h-[70vh] md:h-[85vh] rounded-[16px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              fill
              className="object-contain"
              sizes="100vw"
            />
            {/* Caption */}
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/60 to-transparent p-[24px] md:p-[40px] text-center pointer-events-none">
              <h3 className="font-sora font-bold text-[20px] md:text-[32px] text-white drop-shadow-lg">
                {lightboxImage.alt}
              </h3>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
