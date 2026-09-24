import GalleryGrid from "./components/GalleryGrid";
import Image from "next/image";

export default function GalleryPage() {
  return (
    <div className="bg-[#FFFFFF] min-h-screen">
      {/* Gallery Hero Section */}
      <section className="relative w-full h-[400px] flex items-center justify-center overflow-hidden bg-[#111433]">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/home-banner.webp" 
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

      <section className="bg-white py-16 sm:py-20 border-b border-[#E1E9F2]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-10 text-center">
          <span className="text-[#FFA401] font-bold text-[16px] leading-[24px] tracking-[1px] uppercase block mb-2">
            Campus Life in Pictures
          </span>
          <h2 className="text-[28px] sm:text-[36px] font-semibold text-[#0B1C30] mb-6">
            GALLERY
          </h2>
          <p className="text-lg text-[#464555] max-w-[900px] mx-auto leading-relaxed mb-8">
            The Gallery captures the vibrant academic and campus life of Achievers Junior College.
            Visitors can explore photographs showcasing:
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-[1100px] mx-auto mb-10">
            {[
              "Campus Infrastructure", "Smart Classrooms", "Science Laboratories", "Library", 
              "Sports Activities", "Cultural Events", "Annual Celebrations", "Educational Tours", 
              "Workshops", "Personality Development Sessions", "AI & Digital Learning", 
              "Student Achievements", "Seminars", "Career Guidance Programs", 
              "Competitions", "Graduation Memories"
            ].map((item) => (
              <span key={item} className="px-5 py-2.5 bg-[#F2F6FC] text-[#0055CC] rounded-full font-medium shadow-[0px_2px_4px_rgba(0,0,0,0.02)] text-sm sm:text-base">
                {item}
              </span>
            ))}
          </div>
          <p className="text-lg text-[#191C1E] font-semibold max-w-[900px] mx-auto leading-relaxed">
            Every image reflects our commitment to creating an inspiring learning environment.
          </p>
        </div>
      </section>

      {/* Gallery Grid component */}
      <GalleryGrid />
    </div>
  );
}
