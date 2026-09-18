"use client";

import { useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

const testimonials = [
  { name: "Rohit Varma", details: "IIT Bombay | Class of 2018", quote: "The strong academic foundation at Achievers helped me crack IIT and build my career. The faculty and discipline here shaped who I am today." },
  { name: "Sneha Reddy", details: "MBBS, Osmania Medical College | Class of 2019", quote: "Achievers gave me the confidence and clarity to pursue my dreams. The guidance and support from teachers were exceptional." },
  { name: "Karthik Srinivas", details: "Software Engineer, TCS | Class of 2020", quote: "The competitive environment at Achievers prepared me for real-world challenges. I'm grateful for the friendships and mentorship I received." },
];

export default function Testimonials() {
  const [offset, setOffset] = useState(0);
  function move(direction: number) {
    setOffset((current) => (current + direction + testimonials.length) % testimonials.length);
  }
  return (
    <section aria-labelledby="testimonials-heading">
      <div className="mb-6 border-b border-[#E1E9F2] pb-3">
        <div className="flex items-center justify-between gap-2">
          <h2 id="testimonials-heading" className="text-2xl font-bold tracking-tight">What Our Alumni Say</h2>
          <div className="flex shrink-0 gap-1.5">
            <button type="button" onClick={() => move(-1)} aria-label="Previous testimonials" aria-controls="alumni-testimonials" className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-[#DAE4F2] text-[#63799A] transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-[#0055CC]"><CaretLeft size={15} /></button>
            <button type="button" onClick={() => move(1)} aria-label="Next testimonials" aria-controls="alumni-testimonials" className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-[#DAE4F2] text-[#63799A] transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-[#0055CC]"><CaretRight size={15} /></button>
          </div>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-[#63799A]">Real stories. Real journeys. Real Achievers.</p>
      </div>
      <div id="alumni-testimonials" className="space-y-4" aria-live="polite">
        {Array.from({ length: 5 }, (_, index) => {
          const person = testimonials[(index + offset) % testimonials.length];
          return (
            <figure key={index} className="flex gap-4 rounded-xl bg-[#EAEAEA] p-5">
              <div aria-hidden="true" className="mt-1 flex size-12 shrink-0 items-center justify-center rounded-full border border-[#FFC65B] bg-[#081D36] text-sm font-semibold text-white">{person.name.split(" ").map((part) => part[0]).join("")}</div>
              <div>
                <blockquote className="text-xs italic leading-5 text-[#4B5A73]"><span aria-hidden="true" className="block text-lg leading-4 text-[#FF8117]">&ldquo;</span>{person.quote}</blockquote>
                <figcaption className="mt-3 text-xs"><span className="block font-bold text-[#0A1E37]">{person.name}</span><span className="mt-1 block text-[#63799A]">{person.details}</span></figcaption>
              </div>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
