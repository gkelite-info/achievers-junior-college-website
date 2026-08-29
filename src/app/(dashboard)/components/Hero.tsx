import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[600px] lg:min-h-[700px] py-20 flex items-center justify-center overflow-hidden">
      {/* Background Image Placeholder with Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900 bg-cover bg-center"
        style={{
          backgroundImage: "url('/home-banner.webp')", 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#081C35] to-[#0047A9]/0" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-[40px] w-full">
        <div className="max-w-3xl flex flex-col gap-[30px]">
          {/* Tagline */}
          <div className="inline-flex px-[16px] py-[3px] rounded-full bg-[#FFDDB8] w-fit">
            <span className="text-[#653E00] font-semibold text-[10px] sm:text-[12px] leading-[14px] tracking-[0.6px] uppercase">
              Hyderabad's Premier Institution
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-[48px] font-bold text-white leading-tight md:leading-[60px] tracking-tight md:tracking-[-0.96px]">
            Empowering the <br className="hidden sm:block" />
            <span className="text-amber-500">Leaders of Tomorrow</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-[18px] text-white/90 max-w-[576px] font-normal leading-relaxed sm:leading-[29px]">
            Join Achievers Junior College for a transformative educational
            experience that blends rigorous academics with personalized
            guidance. Strategically located in Hyderabad for excellence.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-[16px] pt-[17px]">
            <Link
              href="#apply"
              className="px-[32px] py-[16px] bg-[#FFA401] hover:bg-[#e69401] text-[#081C35] text-[14px] tracking-[0.14px] font-bold rounded-[8px] text-center transition-colors shadow-lg flex items-center justify-center h-[51px]"
            >
              Apply Now
            </Link>
            <Link
              href="#courses"
              className="px-[32px] py-[16px] bg-white/10 border border-white/30 hover:bg-white/20 text-[#FFFFFF] text-[14px] tracking-[0.14px] font-normal rounded-[8px] text-center transition-all backdrop-blur-[6px] flex items-center justify-center h-[51px]"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
