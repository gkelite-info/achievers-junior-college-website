"use client";

import Link from "next/link";
import Image from "next/image";

const programs = [
  {
    id: "mpc",
    title: "MPC",
    description: "Mathematics, Physics & Chemistry. Ideal for careers in Engineering, AI, Data Science, and Architecture.",
    icon: "/user-with-gears.svg",
  },
  {
    id: "bipc",
    title: "BiPC",
    description: "Biology, Physics & Chemistry. Prepares students for careers in Medicine, Pharmacy, and Biotechnology.",
    icon: "/medpuls.svg",
  },
  {
    id: "mec",
    title: "MEC",
    description: "Mathematics, Economics & Commerce. Designed for future financial leaders, CA, and management.",
    icon: "/currency.svg",
  },
  {
    id: "cec",
    title: "CEC",
    description: "Civics, Economics & Commerce. Perfect for careers in Law, Civil Services, and Public Administration.",
    icon: "/target.svg",
  },
  {
    id: "ace",
    title: "ACE",
    description: "Accounts, Commerce & Economics. Comprehensive foundation for CA, CS, CMA, and entrepreneurship.",
    icon: "/file.svg",
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
              <Link
                key={program.id}
                href={`/services#${program.id}`}
                className={`group ${colSpanClass} rounded-[32px] p-[40px] flex flex-col gap-[16px] transition-all duration-300 hover:-translate-y-2 cursor-pointer bg-[#EFF4FF] hover:bg-[#0E1436] active:bg-[#0E1436] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] hover:shadow-xl`}
              >
                <div
                  className="w-[64px] h-[64px] rounded-full flex items-center justify-center transition-colors duration-300 bg-[#081D36] group-hover:bg-[#FFFFFF]"
                >
                  <Image
                    src={program.icon}
                    alt={`${program.title} icon`}
                    width={29}
                    height={29}
                    className="object-contain transition-all duration-300 brightness-0 invert group-hover:invert-0 group-hover:brightness-0"
                  />
                </div>

                <h3
                  className="text-[24px] font-semibold leading-[32px] mt-[16px] transition-colors duration-300 text-[#0B1C30] group-hover:text-[#FFFFFF]"
                >
                  {program.title}
                </h3>

                <p
                  className="text-[16px] leading-[24px] font-normal min-h-[96px] transition-colors duration-300 text-[#0B1C30]/80 group-hover:text-[#FFFFFF]/90"
                >
                  {program.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
