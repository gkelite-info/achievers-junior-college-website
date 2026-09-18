"use client";

import motion from "@/components/HoverExpansion.module.css";
import { useRef, useState } from "react";
import Image from "next/image";
import learningImage from "../../../../public/about_professor_1.png";
import physicsImage from "../../../../public/about_professor_2.png";
import biologyImage from "../../../../public/about_professor_3.png";
import economicsImage from "../../../../public/about_professor_4.png";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

const faculty = [
  { subject: "Mathematics", name: "Dr. Sarah Jensen", experience: "15 Years Experience", image: learningImage },
  { subject: "Physics", name: "Prof. David Miller", experience: "20 Years Experience", image: physicsImage },
  { subject: "Biology", name: "Dr. Elena Rodriguez", experience: "12 Years Experience", image: biologyImage },
  { subject: "Economics", name: "Robert Chen, MBA", experience: "18 Years Experience", image: economicsImage },
];

export default function Faculty() {
  const track = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  function move(direction: number) {
    const element = track.current;
    if (!element) return;
    const card = element.firstElementChild as HTMLElement | null;
    const distance = (card?.offsetWidth ?? element.clientWidth) + 24;
    const end = element.scrollWidth - element.clientWidth;
    if (end <= 1) {
      setOffset((current) => (current + direction + faculty.length) % faculty.length);
      return;
    }
    const left = direction > 0 && element.scrollLeft >= end - 2
      ? 0
      : direction < 0 && element.scrollLeft <= 2
        ? end
        : element.scrollLeft + direction * distance;
    element.scrollTo({ left, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  return (
    <section className="bg-[#F7F9FB] py-10 sm:py-12" aria-labelledby="faculty-heading">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-10">
        <div className="mb-10 flex items-center justify-between gap-4 sm:mb-16">
          <div>
            <h2 id="faculty-heading" className="text-3xl font-semibold tracking-tight text-[#111433] sm:text-[46px] sm:leading-tight">Distinguished Faculty</h2>
            <p className="mt-2 text-sm text-[#464555] sm:text-base">Experts who inspire the next generation</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => move(-1)} aria-label="Previous faculty" aria-controls="faculty-cards" className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-[#8B8D9B] transition-colors hover:bg-[#E7EEFF] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0055CC] sm:size-12"><CaretLeft size={20} /></button>
            <button type="button" onClick={() => move(1)} aria-label="Next faculty" aria-controls="faculty-cards" className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-[#8B8D9B] transition-colors hover:bg-[#E7EEFF] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0055CC] sm:size-12"><CaretRight size={20} /></button>
          </div>
        </div>
        <div ref={track} id="faculty-cards" tabIndex={0} aria-label="Faculty profiles" className={`${motion.row} ${motion.faculty} flex snap-x snap-mandatory gap-6 overflow-x-auto pt-3 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}>
          {Array.from({ length: faculty.length }, (_, index) => faculty[(index + offset) % faculty.length]).map((person) => (
            <button type="button" key={person.name} onClick={() => move(1)} aria-label={`${person.name}, ${person.subject}. Show next faculty member`} className={`${motion.card} group cursor-pointer text-left transition duration-300 hover:shadow-xl active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0055CC] motion-reduce:transform-none motion-reduce:transition-none w-[80%] shrink-0 snap-start overflow-hidden rounded-[24px] bg-white shadow-[0_3px_3px_rgba(0,0,0,0.18)] sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-72px)/4)]`}>
              <span className="relative block overflow-hidden bg-[#E7ECF0] aspect-[280/255]">
                <Image src={person.image} alt={person.name} fill sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 440px" className="object-contain" />
              </span>
              <span className="block px-6 py-7">
                <span className="block mb-2 text-xs font-semibold tracking-[1.3px] text-[#F39800] uppercase">{person.subject}</span>
                <span className="block text-base text-[#0055CC]">{person.name}</span>
                <span className="block mt-1 text-sm text-[#464555]">{person.experience}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
