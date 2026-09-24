import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

const programs = [
  {
    id: "mpc",
    title: "MPC",
    description: "Mathematics, Physics & Chemistry. Ideal for careers in Engineering, AI, Data Science, and Architecture.",
    icon: "/user-with-gears.svg",
    active: false,
  },
  {
    id: "bipc",
    title: "BiPC",
    description: "Biology, Physics & Chemistry. Prepares students for careers in Medicine, Pharmacy, and Biotechnology.",
    icon: "/medpuls.svg",
    active: true,
  },
  {
    id: "mec",
    title: "MEC",
    description: "Mathematics, Economics & Commerce. Designed for future financial leaders, CA, and management.",
    icon: "/currency.svg",
    active: false,
  },
  {
    id: "cec",
    title: "CEC",
    description: "Civics, Economics & Commerce. Perfect for careers in Law, Civil Services, and Public Administration.",
    icon: "/target.svg",
    active: false,
  },
  {
    id: "ace",
    title: "ACE",
    description: "Accounts, Commerce & Economics. Comprehensive foundation for CA, CS, CMA, and entrepreneurship.",
    icon: "/file.svg",
    active: false,
  },
];

export default function Programs() {
  return (
    <section className="bg-[#FFFFFF] pt-[17px] pb-[53px]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-[35px]">
        <div className="flex flex-col mb-[64px] gap-[16px]">
          <h2 className="text-[28px] sm:text-[32px] md:text-[36px] font-semibold text-[#0B1C30] uppercase">
            ACADEMIC PROGRAMS
          </h2>
          <p className="text-[#444933] text-[16px] leading-[24px] font-normal max-w-[900px]">
            Achievers Junior College offers carefully designed Intermediate programs that combine academic
            excellence with career-oriented learning. Our curriculum is structured to build strong conceptual
            understanding, analytical thinking, and practical knowledge, enabling students to excel in higher
            education and competitive environments.
          </p>
          <p className="text-[#444933] text-[16px] leading-[24px] font-normal max-w-[900px]">
            Our experienced faculty adopt concept-based teaching methodologies supported by regular
            assessments, doubt-clearing sessions, personalized mentoring, and technology-enabled classrooms.
            Every program is designed to help students discover their strengths and achieve their career aspirations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-[32px]">
          {programs.map((program, index) => {
            let colSpanClass = "md:col-span-2";
            if (index === 3) colSpanClass = "md:col-span-2 md:col-start-2";
            if (index === 4) colSpanClass = "md:col-span-2";

            return (
              <div
                key={program.id}
                className={`${colSpanClass} rounded-[32px] p-[40px] flex flex-col gap-[16px] transition-transform duration-300 hover:-translate-y-2 ${program.active
                  ? "bg-[#0E1436]"
                  : "bg-[#EFF4FF] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
                  }`}
              >
                <div
                  className={`w-[64px] h-[64px] rounded-full flex items-center justify-center ${program.active ? "bg-[#FFFFFF]" : "bg-[#081D36]"
                    }`}
                >
                  <Image
                    src={program.icon}
                    alt={`${program.title} icon`}
                    width={29}
                    height={29}
                    className={`object-contain ${program.active ? "" : "brightness-0 invert"}`}
                  />
                </div>

                <h3
                  className={`text-[24px] font-semibold leading-[32px] mt-[16px] ${program.active ? "text-[#FFFFFF]" : "text-[#0B1C30]"
                    }`}
                >
                  {program.title}
                </h3>

                <p
                  className={`text-[16px] leading-[24px] font-normal min-h-[96px] ${program.active ? "text-[#FFFFFF] opacity-90" : "text-[#0B1C30] opacity-80"
                    }`}
                >
                  {program.description}
                </p>

                <div className="pt-[15px] mt-auto hidden">
                  <Link
                    href={`#${program.id}`}
                    className={`inline-flex items-center text-[16px] font-semibold leading-[24px] group transition-opacity hover:opacity-80 ${program.active ? "text-[#EFF4FF]" : "text-[#0B1C30]"
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
