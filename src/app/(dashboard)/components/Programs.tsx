import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

const programs = [
  {
    id: "mpc",
    title: "MPC",
    description: "Integrated IIT-JEE (Mains & Advanced) coaching with intermediate board curriculum focus.",
    icon: "/user-with-gears.svg",
    active: false,
  },
  {
    id: "bipc",
    title: "BiPC",
    description: "Rigorous NEET coaching combined with intensive laboratory work and conceptual biology mastery.",
    icon: "/medpuls.svg",
    active: true,
  },
  {
    id: "mec-cec",
    title: "MEC & CEC",
    description: "Advanced training for CA-Foundation, Management studies, and National Law Entrance tests.",
    icon: "/currency.svg",
    active: false,
  },
];

export default function Programs() {
  return (
    <section className="bg-[#FFFFFF] pt-[17px] pb-[53px]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-[35px]">
        {/* Header Container */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-[64px] gap-[32px] xl:gap-[180px]">
          <div className="w-full xl:max-w-[650px] flex flex-col gap-[16px]">
            <span className="text-[#FFA401] font-bold text-[16px] leading-[24px] tracking-[1px] uppercase">
              OUR ACADEMIC VERTICALS
            </span>
            <h2 className="text-[28px] sm:text-[32px] md:text-[36px] lg:text-[40px] xl:text-[45px] font-semibold text-[#0B1C30] leading-tight xl:leading-[56px] tracking-tight xl:tracking-[-0.48px]">
              Specialized Programs for <br className="hidden md:block" />
              <span className="text-[#FFA401]">Global Success</span>
            </h2>
          </div>
          <div className="max-w-[448px] xl:pr-[12px]">
            <p className="text-[#444933] text-[16px] leading-[24px] font-normal">
              We offer tailored academic streams that blend core curriculum with competitive exam training for engineering, medicine, and management.
            </p>
          </div>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[32px]">
          {programs.map((program) => {
            return (
              <div
                key={program.id}
                className={`rounded-[32px] p-[40px] flex flex-col gap-[16px] transition-transform duration-300 hover:-translate-y-2 ${
                  program.active
                    ? "bg-[#0E1436]"
                    : "bg-[#EFF4FF] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
                }`}
              >
                <div
                  className={`w-[64px] h-[64px] rounded-full flex items-center justify-center ${
                    program.active ? "bg-[#FFFFFF]" : "bg-[#081D36]"
                  }`}
                >
                  <Image 
                    src={program.icon} 
                    alt={`${program.title} icon`} 
                    width={29} 
                    height={29}
                    className="object-contain"
                  />
                </div>
                
                <h3
                  className={`text-[24px] font-semibold leading-[32px] mt-[16px] ${
                    program.active ? "text-[#FFFFFF]" : "text-[#0B1C30]"
                  }`}
                >
                  {program.title}
                </h3>
                
                <p
                  className={`text-[16px] leading-[24px] font-normal min-h-[96px] ${
                    program.active ? "text-[#FFFFFF] opacity-90" : "text-[#0B1C30] opacity-80"
                  }`}
                >
                  {program.description}
                </p>
                
                <div className="pt-[15px] mt-auto">
                  <Link
                    href={`#${program.id}`}
                    className={`inline-flex items-center text-[16px] font-semibold leading-[24px] group transition-opacity hover:opacity-80 ${
                      program.active ? "text-[#EFF4FF]" : "text-[#0B1C30]"
                    }`}
                  >
                    Explore Program
                    <ArrowRight
                      size={19}
                      weight="bold"
                      className="ml-[8px] transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
