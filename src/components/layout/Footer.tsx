"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  InstagramLogo,
  FacebookLogo,
  XLogo,
} from "@phosphor-icons/react";

export default function Footer() {
  const pathname = usePathname();

  if (
    pathname?.includes("/registration") ||
    pathname?.includes("/login") ||
    pathname?.includes("/forgot-password") ||
    pathname?.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <footer className="bg-[#111433] pt-[63px] pb-[64px]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-[40px]">
        {/* Equal Gap 3-Column Layout */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 md:gap-8 lg:gap-14 xl:gap-20 mb-[60px]">
          {/* Column 1 (Left): College Logo & Map Embed */}
          <div className="flex flex-col gap-[18px] w-full md:w-[320px] lg:w-[350px] shrink-0">
            {/* College Logo */}
            <div className="flex items-center gap-3.5 h-[34px]">
              <div className="relative w-10 h-10 rounded-full border-2 border-[#FFA401] shadow-[0_0_14px_rgba(255,164,1,0.45)] bg-[#0A1020] flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src="/college_logo.jpeg"
                  alt="Achievers Junior College Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-sora font-extrabold text-[19px] leading-[22px] text-[#FFFFFF]">
                  Achievers
                </span>
                <span className="text-[#FFA401] font-bold text-[10px] tracking-wider uppercase leading-tight">
                  Junior College
                </span>
              </div>
            </div>

            {/* College Address Google Map Embed */}
            <div className="w-full overflow-hidden rounded-xl border border-white/10 shadow-md">
              <iframe
                title="Achievers Junior College Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3133.074633303871!2d78.41448417420492!3d17.39831808349077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb970078edcc13%3A0x12aa94649f50b675!2sAchievers%20Junior%20College!5e1!3m2!1sen!2sin!4v1790240440027!5m2!1sen!2sin"
                className="w-full h-[155px] border-0 block"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>

          {/* Column 2 (Middle): Address & Contact Details */}
          <div className="flex flex-col gap-[18px] w-full md:flex-1 md:max-w-[420px]">
            <h4 className="font-sora font-bold text-[20px] leading-[34px] text-[#FFFFFF] h-[34px] flex items-center">
              Our Address
            </h4>

            {/* Address */}
            <p className="font-sora font-normal text-[14px] leading-[23px] text-[#CBD5E1]">
              9-4-137/51, Tolichowki Rd, Jamali Kunta, Owaisi colony, Surya Nagar, Toli Chowki, Hyderabad, Telangana 500008
            </p>

            {/* Phone & Email */}
            <div className="flex flex-col gap-1.5 text-[13px] text-[#CBD5E1]">
              <p>
                <span className="font-semibold text-white">Phone: </span>
                <a href="tel:+917337581166" className="text-[#FFA401] hover:underline">
                  +91 7337581166
                </a>
                ,{" "}
                <a href="tel:+918897288809" className="text-[#FFA401] hover:underline">
                  +91 8897288809
                </a>
              </p>
              <p>
                <span className="font-semibold text-white">Email: </span>
                <a
                  href="mailto:achieversjnrcollege@gmail.com"
                  className="text-[#FFA401] hover:underline break-all"
                >
                  achieversjnrcollege@gmail.com
                </a>
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-[12px] pt-1">
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-[38px] h-[38px] rounded-full bg-white/10 flex items-center justify-center text-[#FFA401] hover:bg-[#FFA401] hover:text-white transition-colors cursor-pointer"
                aria-label="Instagram"
              >
                <InstagramLogo size={19} weight="fill" />
              </Link>
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-[38px] h-[38px] rounded-full bg-white/10 flex items-center justify-center text-[#FFA401] hover:bg-[#FFA401] hover:text-white transition-colors cursor-pointer"
                aria-label="Facebook"
              >
                <FacebookLogo size={19} weight="fill" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-[38px] h-[38px] rounded-full bg-white/10 flex items-center justify-center text-[#FFA401] hover:bg-[#FFA401] hover:text-white transition-colors cursor-pointer"
                aria-label="X (Twitter)"
              >
                <XLogo size={19} weight="fill" />
              </Link>
            </div>
          </div>

          {/* Column 3 (Right): Quick Links */}
          <div className="flex flex-col gap-[18px] w-full md:w-[200px] lg:w-[230px] shrink-0">
            <h4 className="font-sora font-bold text-[20px] leading-[34px] text-[#FFFFFF] h-[34px] flex items-center">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-[14px]">
              <li>
                <Link
                  href="/about"
                  className="font-sora text-[13px] text-[#E0E3E5] opacity-80 hover:text-[#FFA401] hover:opacity-100 transition-colors cursor-pointer"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="font-sora text-[13px] text-[#E0E3E5] opacity-80 hover:text-[#FFA401] hover:opacity-100 transition-colors cursor-pointer"
                >
                  Courses & Programs
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="font-sora text-[13px] text-[#E0E3E5] opacity-80 hover:text-[#FFA401] hover:opacity-100 transition-colors cursor-pointer"
                >
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link
                  href="/alumni"
                  className="font-sora text-[13px] text-[#E0E3E5] opacity-80 hover:text-[#FFA401] hover:opacity-100 transition-colors cursor-pointer"
                >
                  Alumni & Reviews
                </Link>
              </li>
              <li>
                <Link
                  href="/payments"
                  className="font-sora text-[13px] text-[#E0E3E5] opacity-80 hover:text-[#FFA401] hover:opacity-100 transition-colors cursor-pointer"
                >
                  Online Payments
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="font-sora text-[13px] text-[#E0E3E5] opacity-80 hover:text-[#FFA401] hover:opacity-100 transition-colors cursor-pointer"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[rgba(255,255,255,0.1)] pt-[24px] flex justify-center">
          <p className="font-sora font-normal text-[14px] text-[#E0E3E5] opacity-80">
            © {new Date().getFullYear()} Achievers Junior College. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
