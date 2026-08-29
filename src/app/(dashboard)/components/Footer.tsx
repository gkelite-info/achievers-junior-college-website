import { FacebookLogo, TwitterLogo, InstagramLogo, PaperPlaneRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#111433] pt-[63px] pb-[47px] relative">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-[40px] flex flex-col">
        
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-[40px] md:gap-[24px] mb-[64px]">
          
          {/* Brand & Socials */}
          <div className="flex flex-col gap-[22.8px] w-full md:max-w-[384px]">
            <h3 className="font-sora font-extrabold text-[24px] leading-[34px] text-[#FFFFFF]">
              Achievers Junior College
            </h3>
            <p className="font-sora font-normal text-[16px] leading-[26px] text-[#E0E3E5] opacity-80">
              Leading the way in quality intermediate education and competitive exam excellence in Hyderabad.
            </p>
            <div className="flex items-center gap-[16px] mt-1">
              <Link href="#" className="w-[40px] h-[40px] bg-[rgba(255,255,255,0.1)] rounded-full flex justify-center items-center hover:bg-[rgba(255,255,255,0.2)] transition-colors">
                <FacebookLogo size={20} weight="fill" className="text-[#FFA401]" />
              </Link>
              <Link href="#" className="w-[40px] h-[40px] bg-[rgba(255,255,255,0.1)] rounded-full flex justify-center items-center hover:bg-[rgba(255,255,255,0.2)] transition-colors">
                <TwitterLogo size={20} weight="fill" className="text-[#FFA401]" />
              </Link>
              <Link href="#" className="w-[40px] h-[40px] bg-[rgba(255,255,255,0.1)] rounded-full flex justify-center items-center hover:bg-[rgba(255,255,255,0.2)] transition-colors">
                <InstagramLogo size={20} weight="fill" className="text-[#FFA401]" />
              </Link>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="flex flex-col gap-[24px] w-full md:max-w-[384px] md:pb-[56px]">
            <h4 className="font-sora font-bold text-[24px] leading-[34px] text-[#FFFFFF]">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-[16px]">
              {['About', 'Services', 'Payments', 'Gallery'].map((link) => (
                <li key={link} className="py-[3px]">
                  <Link href="#" className="font-sora font-semibold text-[12px] leading-[14px] text-[#E0E3E5] opacity-80 underline hover:opacity-100 transition-opacity">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="flex flex-col gap-[22.8px] w-full md:max-w-[384px] md:pb-[78px]">
            <h4 className="font-sora font-bold text-[24px] leading-[34px] text-[#FFFFFF]">
              Newsletter
            </h4>
            <p className="font-sora font-normal text-[16px] leading-[26px] text-[#E0E3E5] opacity-80">
              Subscribe to get the latest updates on admissions and events.
            </p>
            <form className="flex items-start gap-[8px] mt-[1.2px]" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email"
                placeholder="Your Email"
                className="flex-grow h-[46px] bg-[rgba(255,255,255,0.1)] rounded-[8px] px-[12px] font-sora text-[16px] text-white placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#FFA401]"
                required
              />
              <button 
                type="submit"
                className="w-[51px] h-[45px] shrink-0 bg-[#FFA401] rounded-[8px] flex justify-center items-center hover:bg-[#e69400] transition-colors"
              >
                <PaperPlaneRight size={20} weight="fill" className="text-[#FFFFFF]" />
              </button>
            </form>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-[rgba(255,255,255,0.1)] pt-[31px] flex justify-center">
          <p className="font-sora font-semibold text-[12px] leading-[14px] text-[#E0E3E5] opacity-60 text-center">
            © 2024 Achievers Junior College. All rights reserved.
          </p>
        </div>
        
      </div>
    </footer>
  );
}
