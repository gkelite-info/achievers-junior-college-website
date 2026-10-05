import motion from "@/components/HoverExpansion.module.css";
import type { Metadata } from "next";
import Image from "next/image";
import heroImage from "../../../public/alumini_header.png";
import Testimonials from "./components/Testimonials";

export const metadata: Metadata = {
  title: "Alumni | Achievers Junior College",
  description: "Stay connected with the Achievers family through alumni events, shared memories, and inspiring journeys.",
};

export default function AlumniPage() {
  return (
    <div className="bg-white text-[#0A1E37]">
      <section className={`${motion.banner} relative isolate flex min-h-[440px] items-center overflow-hidden bg-[#051E3B] py-16 sm:min-h-[500px] lg:min-h-[470px]`} aria-labelledby="alumni-heading">
        <Image src={heroImage} alt="Achievers graduates standing together outside the college" fill preload sizes="100vw" className="-z-20 object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#031D3A]/90 via-[#031D3A]/35 to-transparent lg:from-[#031D3A]/30 lg:via-transparent" />
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-10">
          <p className="mb-5 inline-block rounded-full border border-white/20 bg-[#112C46]/70 px-3 py-1 text-xs font-bold tracking-[1.5px] text-[#FF8718]">OUR ALUMNI</p>
          <h1 id="alumni-heading" className="max-w-[720px] text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[60px]">Once an Achiever,<br /><span className="text-[#FF8117]">Always an Achiever</span></h1>
          <p className="mt-6 max-w-[580px] text-base leading-relaxed text-[#D2DDEA] sm:text-lg">Our alumni are our pride. Their journeys inspire us and remind us that the values, learning, and friendships built here last a lifetime.</p>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20 border-b border-[#E1E9F2]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-10 text-center">
          <span className="text-[#FFA401] font-bold text-[16px] leading-[24px] tracking-[1px] uppercase block mb-2">
            Our Pride
          </span>
          <h2 className="text-[28px] sm:text-[36px] font-semibold text-[#0B1C30] mb-6">
            ALUMNI
          </h2>
          <p className="text-lg text-[#464555] max-w-[900px] mx-auto leading-relaxed mb-8">
            Our alumni are the strongest ambassadors of Achievers Junior College.
            Graduates have successfully pursued higher education and established rewarding careers in:
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-[1000px] mx-auto mb-10">
            {[
              "Engineering", "Medicine", "Pharmacy", "Information Technology", 
              "Business", "Chartered Accountancy", "Banking", "Government Services", 
              "Entrepreneurship", "Research", "Education"
            ].map((field) => (
              <span key={field} className="px-5 py-2.5 bg-[#F2F6FC] text-[#0055CC] rounded-full font-medium shadow-[0px_2px_4px_rgba(0,0,0,0.02)]">
                {field}
              </span>
            ))}
          </div>
          <p className="text-lg text-[#464555] max-w-[900px] mx-auto leading-relaxed">
            Many alumni regularly return to mentor current students, share industry experiences, conduct career
            guidance sessions, and inspire future generations. <br className="hidden sm:block" />
            <span className="font-semibold text-[#191C1E] mt-4 inline-block">Their achievements reflect our commitment to nurturing excellence.</span>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-10 sm:py-16">
        <Testimonials />
      </div>
    </div>
  );
}
