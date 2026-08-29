"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/#about" },
  { name: "Services", href: "/#services" },
  { name: "Gallery", href: "/gallery" },
  { name: "Admissions", href: "/#admissions" },
  { name: "Alumni", href: "/#alumni" },
  { name: "Payments", href: "/#payments" },
  { name: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#f7f9fb]/70 border-b border-white/20 shadow-sm backdrop-blur-[12px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-[40px]">
        <div className="flex justify-between items-center min-h-[67px] py-2">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center max-w-[80%] xl:max-w-none">
            <Link 
              href="/" 
              className="text-[18px] sm:text-[20px] xl:text-[24px] leading-tight xl:leading-[34px] font-bold text-[#081D36] tracking-tight xl:tracking-[-0.6px]"
            >
              Achievers Junior College
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex gap-[33px] items-center">
            {navLinks.map((link) => {
              const isActive = link.href === "/" 
                ? pathname === "/" 
                : link.href.startsWith("/#") 
                  ? pathname === "/" && link.name === "Home"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[14px] leading-[17px] tracking-[0.14px] transition-colors py-1 ${
                    isActive
                      ? "text-[#081D36] font-bold border-b-2 border-[#0047A9]"
                      : "text-[#424654] font-normal hover:text-[#0047A9]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* CTA Button (Desktop) */}
          <div className="hidden xl:flex items-center">
            <Link
              href="#apply"
              className="bg-[#FFA401] hover:bg-[#e69401] text-[#FFFFFF] text-[14px] tracking-[0.14px] font-normal px-[24px] py-[8px] rounded-[8px] transition-colors duration-200 shadow-md"
            >
              Apply Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center xl:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#424654] hover:text-[#081D36] focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} weight="bold" /> : <List size={24} weight="bold" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="xl:hidden bg-[#f7f9fb] border-t border-white/20 px-4 pt-2 pb-4 space-y-1 shadow-lg absolute w-full left-0">
          {navLinks.map((link) => {
            const isActive = link.href === "/" 
              ? pathname === "/" 
              : link.href.startsWith("/#") 
                ? pathname === "/" && link.name === "Home"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-3 py-3 rounded-[8px] text-[14px] tracking-[0.14px] ${
                  isActive
                    ? "bg-[#FFA401]/10 text-[#081D36] font-bold"
                    : "text-[#424654] font-normal hover:bg-[#FFA401]/5 hover:text-[#081D36]"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-4 pb-2 flex justify-center sm:justify-start px-3">
            <Link
              href="#apply"
              className="w-full sm:w-auto inline-block text-center bg-[#FFA401] hover:bg-[#e69401] text-[#FFFFFF] text-[14px] tracking-[0.14px] font-normal px-[32px] py-[10px] rounded-[8px] transition-colors shadow-md"
              onClick={() => setIsOpen(false)}
            >
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
