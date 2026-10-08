"use client";

import { useEffect, useState } from "react";
import motion from "@/components/HoverExpansion.module.css";
import { Atom, ChartBar, Dna, Target, UsersThree } from "@phosphor-icons/react";

const courses = [
  { id: "mpc", name: "MPC", subjects: "Mathematics, Physics, Chemistry", description: "The ideal choice for engineering aspirants with a strong foundation in science and analytical thinking.", icon: Atom },
  { id: "bipc", name: "BiPC", subjects: "Biology, Physics, Chemistry", description: "Designed for students aiming for careers in medicine, life sciences and allied health fields.", icon: Dna },
  { id: "mec", name: "MEC", subjects: "Mathematics, Economics, Commerce", description: "A great path for students interested in business, economics, finance, and management studies.", icon: ChartBar },
  { id: "cec", name: "CEC", subjects: "Civics, Economics, Commerce", description: "Build a strong foundation for careers in law, public administration, business, and social sciences.", icon: UsersThree },
  { id: "ace", name: "ACE", subjects: "Achievers Competitive Excellence", description: "A focused program with integrated coaching for competitive exams like JEE, NEET, and other national level exams.", icon: Target },
];

export default function CourseCards() {
  const [activeCourse, setActiveCourse] = useState<string>("mpc");

  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined" && window.location.hash) {
        const h = window.location.hash.slice(1).toLowerCase();
        if (h) setActiveCourse(h);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  return (
    <div className={`${motion.row} ${motion.courses} grid gap-5 pt-3 sm:grid-cols-2 lg:grid-cols-5`}>
      {courses.map(({ id, name, subjects, description, icon: Icon }) => {
        const isSelected = activeCourse === id;
        return (
          <a
            key={name}
            href={`#${id}`}
            onClick={() => setActiveCourse(id)}
            className={`group relative flex flex-col rounded-[22px] border p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer ${
              isSelected
                ? "bg-[#0E1436] text-white border-[#0E1436] shadow-xl"
                : "bg-[#EFF4FF] hover:bg-[#0E1436] text-[#111630] border-[#E1ECFC] shadow-sm"
            }`}
          >
            <div
              className={`mb-5 flex size-12 items-center justify-center rounded-full transition-colors duration-300 ${
                isSelected
                  ? "bg-white text-[#0E1436]"
                  : "bg-[#0E1436] text-white group-hover:bg-white group-hover:text-[#0E1436]"
              }`}
            >
              <Icon size={24} weight={name === "CEC" ? "fill" : "regular"} aria-hidden="true" />
            </div>
            <h3
              className={`text-xl font-bold transition-colors duration-300 ${
                isSelected ? "text-white" : "text-[#111630] group-hover:text-white"
              }`}
            >
              {name}
            </h3>
            <p
              className={`mt-1 text-xs font-medium leading-snug transition-colors duration-300 ${
                isSelected ? "text-white/80" : "text-[#4B5A73] group-hover:text-white/80"
              }`}
            >
              {subjects}
            </p>
            <p
              className={`mt-4 text-xs leading-relaxed transition-colors duration-300 ${
                isSelected ? "text-[#E0E8F5]" : "text-[#4B5A73] group-hover:text-[#E0E8F5]"
              }`}
            >
              {description}
            </p>
          </a>
        );
      })}
    </div>
  );
}
