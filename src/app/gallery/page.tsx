import GalleryGrid from "./components/GalleryGrid";
import Image from "next/image";

export default function GalleryPage() {
  return (
    <div className="bg-[#FFFFFF] min-h-screen">
      {/* Gallery Hero Section */}
      <section className="relative w-full h-[400px] flex items-center justify-center overflow-hidden bg-[#111433]">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/home-banner.png" 
            alt="Achievers Junior College Campus" 
            fill 
            className="object-cover opacity-30" 
            priority
          />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="font-sora font-bold text-[40px] md:text-[56px] leading-[48px] md:leading-[64px] text-[#FFFFFF] mb-4">
            Our Gallery
          </h1>
          <p className="font-sora font-normal text-[18px] text-[#E0E3E5] max-w-[600px] mx-auto">
            A visual journey through the vibrant life, modern infrastructure, and academic excellence at Achievers Junior College.
          </p>
        </div>
      </section>

      {/* Gallery Grid component */}
      <GalleryGrid />
    </div>
  );
}
