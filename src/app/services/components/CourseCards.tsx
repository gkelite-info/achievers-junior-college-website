"use client";

import motion from "@/components/HoverExpansion.module.css";
import { Atom, ChartBar, Dna, Target, UsersThree } from "@phosphor-icons/react";

const courses = [
  { name: "MPC", subjects: "Mathematics, Physics, Chemistry", description: "The ideal choice for engineering aspirants with a strong foundation in science and analytical thinking.", icon: Atom },
  { name: "BiPC", subjects: "Biology, Physics, Chemistry", description: "Designed for students aiming for careers in medicine, life sciences and allied health fields.", icon: Dna },
  { name: "MEC", subjects: "Mathematics, Economics, Commerce", description: "A great path for students interested in business, economics, finance, and management studies.", icon: ChartBar },
  { name: "CEC", subjects: "Civics, Economics, Commerce", description: "Build a strong foundation for careers in law, public administration, business, and social sciences.", icon: UsersThree },
  { name: "ACE", subjects: "Achievers Competitive Excellence", description: "A focused program with integrated coaching for competitive exams like JEE, NEET, and other national level exams.", icon: Target },
];


export default function CourseCards() {
  return (
    <div className={`${motion.row} ${motion.courses} grid gap-5 pt-3 sm:grid-cols-2 lg:grid-cols-5`}>
      {courses.map(({ name, subjects, description, icon: Icon }) => {
        return (
          <article key={name} className={`${motion.card} relative flex flex-col rounded-[18px] border border-[#E1ECFC] bg-[#EAEAEA] p-6 text-[#111630] transition duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none`}>
            <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-[#111630] text-white">
              <Icon size={24} weight={name === "CEC" ? "fill" : "regular"} aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold">{name}</h3>
            <p className="mt-1 text-xs font-medium leading-snug">{subjects}</p>
            <p className="mt-4 text-xs leading-relaxed text-[#4B5A73]">{description}</p>
          </article>
        );
      })}
    </div>
  );
}
