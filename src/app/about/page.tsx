import motion from "@/components/HoverExpansion.module.css";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Crown, Eye, Flag, GraduationCap, Lightbulb, Quotes, ShieldCheck, Target, Trophy } from "@phosphor-icons/react/dist/ssr";
import Faculty from "./components/Faculty";
import campusImage from "../../../public/campus-1.jpg";
import labImage from "../../../public/campus-3.jpg";
import libraryImage from "../../../public/campus-2.jpg";
import sportsImage from "../../../public/student_sports_1787834353751.jpg";
import bannerImage from "../../../public/home-banner.webp";
import journeyImage from "../../../public/about_image_1.png";
import facultyImage from "../../../public/about_image_2.png";
import teachingImage from "../../../public/about_image_3.png";
import classroomImage from "../../../public/about_image_4.png";

export const metadata: Metadata = {
  title: "About | Achievers Junior College",
  description: "Discover our journey, experienced faculty, core values, and life at Achievers Junior College.",
};

const pillars = [
  { title: "Academic Excellence", icon: GraduationCap, filled: false },
  { title: "Integrity", icon: ShieldCheck, filled: true },
  { title: "Innovation", icon: Lightbulb, filled: true },
  { title: "Leadership", icon: Crown, filled: true },
  { title: "Discipline", icon: Target, filled: false },
  { title: "Student Success", icon: Trophy, filled: true },
];

const features = [
  {
    eyebrow: "World Class Mentorship", title: "Experienced Faculty", image: facultyImage,
    alt: "An experienced professor teaching students in a collaborative classroom",
    description: "Our educators are more than just teachers they are industry veterans and research scholars from top-tier global institutions, dedicated to personalized student growth.",
  },
  {
    eyebrow: "Future-Ready Infrastructure", title: "Advanced Teaching Methods", image: teachingImage,
    alt: "A bright modern learning space equipped with digital workstations",
    description: "Blending experienced faculty with modern teaching techniques to create engaging classrooms. Our approach encourages conceptual understanding, critical thinking, and academic excellence.",
    noteTitle: "Teaching Approach", note: "Interactive lessons powered by smart classroom technology and digital learning resources.",
  },
  {
    eyebrow: "Future-Ready Learning", title: "Smart Classrooms", image: classroomImage,
    alt: "A teacher providing personalized academic guidance to a student",
    description: "Our smart classrooms combine interactive digital learning with experienced teaching to create an engaging and collaborative environment where students understand concepts with greater clarity and confidence.",
    noteTitle: "Academic Support", note: "Continuous classroom interaction and personalized guidance help students strengthen their concepts.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white text-[#111433]">
      <section className="mx-auto max-w-[1280px] px-4 pt-7 sm:px-10 sm:pt-10" aria-labelledby="journey-heading">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="rounded-[40px] bg-[#F2F6FC] p-4">
            <div className={`${motion.image} group relative aspect-[560/600] overflow-hidden rounded-[32px]`}>
              <Image src={journeyImage} alt="Students walking outside the Achievers college building" fill preload sizes="(max-width: 768px) 100vw, 560px" className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none" />
            </div>
          </div>
          <div className="md:pr-6">
            <h1 id="journey-heading" className="text-3xl font-semibold leading-tight sm:text-[32px]">About Us</h1>
            <p className="mt-7 text-base leading-relaxed text-[#464555] sm:text-lg">
              Founded in 2013, Achievers Junior College has established itself as one of the trusted institutions dedicated to providing quality Intermediate education in Telangana. Recognized by the Government of Telangana, the college has consistently focused on academic excellence, character building, skill development, and career readiness.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#464555] sm:text-lg">
              For over a decade, we have successfully mentored more than 4,000 students, helping them secure admissions into prestigious universities and professional institutions while preparing them for meaningful careers and responsible citizenship.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#464555] sm:text-lg">
              What truly distinguishes Achievers Junior College is our commitment to holistic development. Alongside academic excellence, we place equal emphasis on personality development, communication skills, leadership training, public speaking, critical thinking, creativity, emotional intelligence, teamwork, digital literacy, and career planning.
            </p>
            <div className="mt-8 space-y-6">
              <div className="relative overflow-hidden rounded-[30px] bg-[#E7EEFF] px-7 py-6 before:absolute before:inset-y-4 before:left-0 before:w-[3px] before:bg-[#A36500]">
                <h2 className="text-xl font-semibold text-[#925800] sm:text-2xl">Learn. Grow. Achieve.</h2>
                <p className="mt-2 text-sm leading-snug text-[#303241]">We continue to inspire young minds to dream bigger, work harder, and achieve excellence in every stage of life.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {[
            { 
              title: "Our Vision", 
              icon: Eye, 
              color: "bg-[#FFA401]", 
              text: "Our vision is to become one of the most respected and trusted junior colleges by creating an educational environment where academic excellence meets innovation, character, leadership, and lifelong learning. We envision empowering students with the knowledge, confidence, practical skills, and ethical values necessary to excel in higher education, competitive examinations, professional careers, entrepreneurship, and society. Our aspiration is to develop individuals who are not only successful professionals but also compassionate leaders, responsible citizens, and lifelong learners capable of making meaningful contributions to the world." 
            },
            { 
              title: "Our Mission", 
              icon: Flag, 
              color: "bg-[#0055CC]", 
              text: "At Achievers Junior College, our mission is to provide an inspiring and enriching educational experience that nurtures intellectual growth, personal development, and professional readiness. We are committed to delivering high-quality education through experienced faculty and innovative teaching methodologies. Building strong conceptual understanding that enables students to excel academically. Encouraging critical thinking, analytical reasoning, creativity, and problem-solving abilities. Developing communication skills, confidence, leadership qualities, and emotional intelligence." 
            },
            { 
              title: "Our Philosophy", 
              icon: Lightbulb, 
              color: "bg-[#10B981]", 
              text: "We believe education is the foundation upon which successful lives are built. Academic achievement alone is not sufficient in today's competitive world. Students must also develop confidence, adaptability, leadership, communication skills, emotional resilience, technological awareness, and strong moral values. Our educational philosophy focuses on developing the complete individual by balancing academics, personal growth, practical exposure, innovation, and character formation. Every student receives encouragement to explore their talents, overcome challenges, think independently, and become lifelong learners prepared for the future." 
            },
          ].map(({ title, icon: Icon, color, text }) => (
            <article key={title} className="relative overflow-hidden rounded-[24px] px-7 py-10 shadow-[0_3px_4px_rgba(0,0,0,0.28)] sm:px-10 sm:py-12">
              <div className={`absolute inset-x-0 top-0 h-1 ${color}`} />
              <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-[#E5EDF7]"><Icon size={32} weight="bold" aria-hidden="true" /></div>
              <h2 className="text-2xl font-semibold text-[#191C1E]">{title}</h2>
              <p className="mt-5 text-sm sm:text-base leading-relaxed text-[#464555]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-10 sm:py-16" aria-labelledby="edge-heading">
        <h2 id="edge-heading" className="mb-10 text-center text-3xl font-semibold tracking-tight sm:mb-12 sm:text-[46px]">The Achievers Edge</h2>
        <div className="space-y-12 sm:space-y-24">
          {features.map((feature, index) => (
            <article key={feature.title} className="grid items-center gap-7 md:grid-cols-2 md:gap-20">
              <div className={index === 1 ? "md:order-2" : ""}>
                <p className="mb-5 text-sm font-bold text-[#925800]">{feature.eyebrow}</p>
                <h3 className="text-2xl font-semibold sm:text-[32px] sm:leading-tight">{feature.title}</h3>
                <p className={`mt-6 leading-relaxed text-[#464555] ${index === 2 ? "text-base" : "text-lg"}`}>{feature.description}</p>
                {feature.note ? (
                  <div className="mt-5 rounded-[30px] bg-[#E7EEFF] p-6">
                    <h4 className={`mb-2 text-xs font-bold uppercase ${index === 1 ? "text-[#0055CC]" : "text-[#111433]"}`}>{feature.noteTitle}</h4>
                    <p className="text-base leading-relaxed">{feature.note}</p>
                  </div>
                ) : (
                  <p className="mt-8 flex items-center gap-3 text-base"><CheckCircle size={22} className="shrink-0 text-[#0055CC]" weight="bold" aria-hidden="true" />Weekly Mentorship Sessions</p>
                )}
              </div>
              <div className={`${motion.image} group relative aspect-[16/9] overflow-hidden rounded-[30px] ${index === 1 ? "md:order-1" : ""}`}>
                <Image src={feature.image} alt={feature.alt} fill sizes="(max-width: 768px) 100vw, 560px" className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#111433] py-16 text-white sm:py-20" aria-labelledby="pillars-heading">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-10">
          <h2 id="pillars-heading" className="text-center text-3xl font-semibold">Our Core Pillars</h2>
          <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
            {pillars.map(({ title, icon: Icon, filled }, index) => (
              <div key={title} className="flex flex-col items-center gap-4 text-center">
                <div className={`flex size-24 items-center justify-center rounded-full ${index % 2 === 0 ? "bg-[#0066F5] ring-2 ring-inset ring-white/10" : "bg-[#FFBD60]"}`}><Icon size={44} weight={filled ? "fill" : "regular"} aria-hidden="true" /></div>
                <h3 className="text-sm font-bold">{title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pt-14 sm:px-16 sm:pt-24" aria-labelledby="principal-heading">
        <div className="grid overflow-hidden rounded-[30px] bg-[#111433] text-white md:grid-cols-2">
          <div className={`${motion.image} group relative aspect-[4/5] overflow-hidden md:aspect-auto md:min-h-[660px]`}>
            <Image src={libraryImage} alt="Students collaborating in the campus library" fill sizes="(max-width: 768px) 100vw, 576px" className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none" />
          </div>
          <div className="relative flex flex-col justify-center px-8 py-16 sm:px-16 sm:py-24">
            <Quotes size={48} weight="fill" className="mb-8 text-white/20 md:absolute md:top-12 md:left-12" aria-hidden="true" />
            <h2 id="principal-heading" className="text-3xl font-semibold leading-tight">Empowering the next generation of global citizens.</h2>
            <blockquote className="mt-6 text-lg leading-relaxed text-[#E0E3E5]">&quot;At Achievers, we are setting a new standard for education. Our mission is to provide a fresh, innovative environment where every student is empowered to find their unique voice and lead in a rapidly evolving world.&quot;</blockquote>
            <p className="mt-10 text-2xl font-semibold">Dr. Sarah Henderson</p>
            <p className="mt-1 text-xs tracking-[2px] text-[#E0E3E5] uppercase">Principal &amp; Academic Dean</p>
          </div>
        </div>
      </section>

      <Faculty />

      <section className="bg-[#DFE8FF] py-10 sm:py-12" aria-labelledby="life-heading">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-16">
          <h2 id="life-heading" className="mb-10 text-center text-3xl font-semibold sm:mb-16">Life at Achievers</h2>
          <div className={`${motion.row} ${motion.photos} grid grid-cols-2 gap-4 md:h-[550px] md:grid-cols-4 md:grid-rows-2 lg:!h-auto`}>
            {[
              { src: campusImage, alt: "Students enjoying a lively outdoor campus gathering", className: "col-span-2 aspect-square md:row-span-2 md:aspect-auto" },
              { src: labImage, alt: "Students working together on a laboratory experiment", className: "aspect-[4/3] md:aspect-auto" },
              { src: libraryImage, alt: "Students studying together in the campus library", className: "aspect-[4/3] md:aspect-auto" },
              { src: sportsImage, alt: "An energetic college basketball game", className: "col-span-2 aspect-video md:aspect-auto" },
            ].map((photo) => (
              <div key={photo.src.src} className={`${motion.card} group relative overflow-hidden rounded-[30px] ${photo.className}`}>
                <Image src={photo.src} alt={photo.alt} fill sizes={photo.className.includes("col-span-2") ? "(max-width: 768px) 100vw, 560px" : "(max-width: 768px) 50vw, 280px"} className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${motion.banner} group relative my-12 flex min-h-[420px] items-center justify-center overflow-hidden bg-[#111433] px-4 py-16 text-center text-white`} aria-labelledby="apply-heading">
        <Image src={bannerImage} alt="" fill sizes="100vw" className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none" />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative">
          <h2 id="apply-heading" className="max-w-[700px] text-3xl font-bold leading-tight sm:text-5xl">Ready to Begin Your<br className="hidden sm:block" /> Academic Journey?</h2>
          <Link href="?apply=true" className="mt-6 inline-block rounded-full bg-[#FFA401] px-10 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#E69401]">Apply Now</Link>
        </div>
      </section>
    </div>
  );
}
