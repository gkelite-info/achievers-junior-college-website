import motion from "@/components/HoverExpansion.module.css";
import type { Metadata } from "next";
import Image from "next/image";
import learningImage from "../../../public/cultivate-skills.png";
import Link from "next/link";
import { ArrowRight, BookOpen, ChartBar, Medal, Trophy } from "@phosphor-icons/react/dist/ssr";

import CourseCards from "./components/CourseCards";

export const metadata: Metadata = {
  title: "Services & Courses | Achievers Junior College",
  description: "Explore MPC, BiPC, MEC, CEC, and ACE programs at Achievers Junior College, with experienced faculty and personalized guidance.",
};

const benefits = [
  { title: "Expert Faculty", description: "Learn from experienced and dedicated faculty.", icon: Medal },
  { title: "Structured Curriculum", description: "Well-designed program focused on board exams and competitive exams.", icon: BookOpen },
  { title: "Personalized Guidance", description: "Individual attention and mentorship for every student.", icon: ChartBar },
  { title: "Proven Results", description: "Consistent track record of academic excellence.", icon: Trophy },
];

export default function ServicesPage() {
  return (
    <div className="bg-white text-[#111630]">
      <section className={`${motion.banner} relative isolate flex min-h-[550px] items-center overflow-hidden bg-[#081D36] py-20 sm:py-24`} aria-labelledby="services-heading">
        <Image src="/home-banner.webp" alt="Achievers Junior College campus" fill preload sizes="100vw" className="-z-20 object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,23,49,0.98)_0%,rgba(3,23,49,0.8)_40%,rgba(3,23,49,0.12)_100%)]" />
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-10">
          <p className="mb-4 text-sm font-bold tracking-[1.6px] text-[#FF8117] uppercase">Our Courses</p>
          <h1 id="services-heading" className="max-w-[640px] text-[40px] font-bold leading-[1.04] tracking-tight text-white sm:text-[60px]">
            Build Your Future<br />
            <span className="text-[#FF8117]">with the Right<br />Foundation</span>
          </h1>
          <p className="mt-4 max-w-[570px] text-base leading-relaxed text-[#E0E3E5] sm:text-lg">
            At Achievers Junior College, we offer specialized intermediate programs designed to match every student&apos;s ambition. Choose the path that leads to your success.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pt-12 sm:px-8 sm:pt-14" aria-labelledby="courses-heading">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center sm:mb-14">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[1.2px] text-[#F6770B] uppercase">Courses Offered</p>
            <h2 id="courses-heading" className="text-3xl font-bold leading-[1.15] tracking-tight sm:text-[36px]">Choose Your Path<br /><span className="text-[#FF8117]">Shape Your Tomorrow</span></h2>
          </div>
          <p className="max-w-[440px] text-base leading-relaxed text-[#4B5A73]">Our intermediate programs are designed with a strong academic foundation, experienced faculty, and personalized guidance to help you excel in competitive exams and achieve your career goals.</p>
        </div>

        <CourseCards />
      </section>

      <section className="mx-auto grid max-w-[1280px] items-center gap-10 px-4 py-16 sm:px-8 sm:py-20 lg:grid-cols-2" aria-labelledby="benefits-heading">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[1.2px] text-[#F6770B] uppercase">Why Choose Our Programs</p>
          <h2 id="benefits-heading" className="text-3xl font-bold leading-[1.15] tracking-tight sm:text-[36px]">More Than Just Courses<br /><span className="text-[#FF8117]">A Brighter Future</span></h2>
          <div className="mt-8 grid gap-x-7 gap-y-8 sm:grid-cols-2">
            {benefits.map(({ title, description, icon: Icon }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2465FF]"><Icon size={25} weight="fill" aria-hidden="true" /></div>
                <div>
                  <h3 className="text-base font-semibold">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#4B5A73]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`${motion.image} group relative aspect-[1.6] overflow-hidden rounded-[18px] bg-[#111630] shadow-[0_6px_10px_rgba(0,0,0,0.15)]`}>
          <Image src={learningImage} alt="Students collaborating on their studies" fill sizes="(max-width: 1024px) 100vw, 600px" className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none" />
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pb-10 sm:px-8" aria-labelledby="journey-heading">
        <div className="flex flex-col justify-between gap-8 rounded-[18px] bg-[linear-gradient(110deg,#111630_70%,#15234B)] px-7 py-12 text-white shadow-[0_12px_18px_rgba(0,0,0,0.15)] sm:px-12 md:flex-row md:items-center">
          <div>
            <h2 id="journey-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">Start Your Journey <span className="text-[#FF8117]">with Achievers</span></h2>
            <p className="mt-2 text-base leading-relaxed text-[#CCD0DD]">Explore our courses and take the first step towards a successful future.</p>
          </div>
          <Link href="?apply=true" className="inline-flex shrink-0 items-center justify-center gap-3 self-start rounded-xl bg-[#FA8117] px-8 py-4 text-base font-semibold transition-colors hover:bg-[#DF6C0A] md:self-auto">Apply Now <ArrowRight size={20} aria-hidden="true" /></Link>
        </div>
      </section>
    </div>
  );
}
