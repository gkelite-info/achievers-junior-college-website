import Link from "next/link";
import { InstagramLogo, ThreadsLogo, XLogo, PaperPlaneRight } from "@phosphor-icons/react/dist/ssr";

export default function Footer() {
  return (
    <footer className="bg-[#111433] pt-[63px] pb-[64px]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-[40px]">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[40px] md:gap-[24px] mb-[60px]">
          
          {/* Column 1: Brand Info */}
          <div className="flex flex-col gap-[22.8px] w-full max-w-[384px]">
            <h3 className="font-sora font-extrabold text-[24px] leading-[34px] text-[#FFFFFF]">
              Achievers Junior College
            </h3>
            <p className="font-sora font-normal text-[16px] leading-[26px] text-[#E0E3E5] opacity-80">
              Leading the way in quality intermediate education and competitive exam excellence in Hyderabad.
            </p>
            <div className="flex items-center gap-[16px] mt-[1.2px]">
              <Link href="#" className="w-[40px] h-[40px] rounded-full bg-white/10 flex items-center justify-center text-[#FFA401] hover:bg-[#FFA401] hover:text-white transition-colors cursor-pointer">
                <InstagramLogo size={20} weight="fill" />
              </Link>
              <Link href="#" className="w-[40px] h-[40px] rounded-full bg-white/10 flex items-center justify-center text-[#FFA401] hover:bg-[#FFA401] hover:text-white transition-colors cursor-pointer">
                <ThreadsLogo size={20} weight="fill" />
              </Link>
              <Link href="#" className="w-[40px] h-[40px] rounded-full bg-white/10 flex items-center justify-center text-[#FFA401] hover:bg-[#FFA401] hover:text-white transition-colors cursor-pointer">
                <XLogo size={20} weight="fill" />
              </Link>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-[24px] w-full max-w-[384px]">
            <h4 className="font-sora font-bold text-[24px] leading-[34px] text-[#FFFFFF]">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-[16px]">
              <li className="pt-[6px] pb-[3px]">
                <Link href="#about" className="font-sora font-semibold text-[12px] leading-[14px] underline text-[#E0E3E5] opacity-80 hover:text-white hover:opacity-100 transition-colors cursor-pointer">About</Link>
              </li>
              <li className="pt-[6px] pb-[3px]">
                <Link href="#services" className="font-sora font-semibold text-[12px] leading-[14px] underline text-[#E0E3E5] opacity-80 hover:text-white hover:opacity-100 transition-colors cursor-pointer">Services</Link>
              </li>
              <li className="pt-[6px] pb-[3px]">
                <Link href="#payments" className="font-sora font-semibold text-[12px] leading-[14px] underline text-[#E0E3E5] opacity-80 hover:text-white hover:opacity-100 transition-colors cursor-pointer">Payments</Link>
              </li>
              <li className="pt-[6px] pb-[3px]">
                <Link href="/gallery" className="font-sora font-semibold text-[12px] leading-[14px] underline text-[#E0E3E5] opacity-80 hover:text-white hover:opacity-100 transition-colors cursor-pointer">Gallery</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Newsletter */}
          <div className="flex flex-col gap-[22.8px] w-full max-w-[384px]">
            <h4 className="font-sora font-bold text-[24px] leading-[34px] text-[#FFFFFF]">
              Newsletter
            </h4>
            <p className="font-sora font-normal text-[16px] leading-[26px] text-[#E0E3E5] opacity-80">
              Subscribe to get the latest updates on admissions and events.
            </p>
            <form className="flex gap-[8px] mt-[1.2px] w-full">
              <input
                type="email"
                placeholder="Your Email"
                className="w-full max-w-[325px] h-[45px] bg-white/10 rounded-[8px] px-[12px] font-sora font-normal text-[16px] text-[#FFFFFF] placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#FFA401]"
                required
              />
              <button
                type="submit"
                className="w-[51px] h-[45px] bg-[#FFA401] hover:bg-[#e69400] text-[#FFFFFF] rounded-[8px] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                aria-label="Subscribe"
              >
                <PaperPlaneRight size={24} weight="fill" />
              </button>
            </form>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-[rgba(255,255,255,0.1)] pt-[24px] flex justify-center">
          <p className="font-sora font-normal text-[14px] text-[#E0E3E5] opacity-80">
            © 2024 Achievers Junior College. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
