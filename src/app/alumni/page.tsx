import motion from "@/components/HoverExpansion.module.css";
import type { Metadata } from "next";
import Image from "next/image";
import { CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import heroImage from "../../../public/alumini_header.png";
import graduationImage from "../../../public/excellence_grad_1787834448067.jpg";
import auditoriumImage from "../../../public/infra_auditorium_1787834420299.jpg";
import sportsImage from "../../../public/student_sports_1787834353751.jpg";
import culturalImage from "../../../public/campus-4.jpg";
import campusImage from "../../../public/campus-1.jpg";
import cafeImage from "../../../public/student_cafe_1787834367710.jpg";
import Testimonials from "./components/Testimonials";

export const metadata: Metadata = {
  title: "Alumni | Achievers Junior College",
  description: "Stay connected with the Achievers family through alumni events, shared memories, and inspiring journeys.",
};

const events = [
  { title: "Alumni Meet 2024", date: "Jan 20, 2024", dateTime: "2024-01-20", image: graduationImage, alt: "Graduates celebrating together on campus" },
  { title: "Career Guidance Session", date: "Sep 15, 2023", dateTime: "2023-09-15", image: auditoriumImage, alt: "Students attending a session in the college auditorium" },
  { title: "Alumni Sports Day", date: "Aug 12, 2023", dateTime: "2023-08-12", image: sportsImage, alt: "Students playing basketball on the campus court" },
  { title: "Cultural Night", date: "Apr 28, 2023", dateTime: "2023-04-28", image: culturalImage, alt: "A gathering in the college auditorium" },
  { title: "Alumni Giving Back", date: "Mar 10, 2023", dateTime: "2023-03-10", image: campusImage, alt: "The college community gathering outdoors" },
  { title: "Alumni Reunion", date: "Dec 18, 2022", dateTime: "2022-12-18", image: cafeImage, alt: "Friends spending time together in the campus cafeteria" },
];

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

      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 sm:px-10 sm:py-16 lg:grid-cols-[2.1fr_1fr]">
        <section aria-labelledby="events-heading">
          <div className="mb-6 border-b border-[#E1E9F2] pb-3">
            <h2 id="events-heading" className="text-2xl font-bold tracking-tight sm:text-[28px]">Alumni Events</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#63799A]">Relive the moments that keep our Achievers family connected.</p>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }, (_, row) => (
              <div key={row} className={`${motion.row} ${motion.events} grid grid-cols-1 gap-4 sm:grid-cols-3`}>
              {events.slice((row % 2) * 3, (row % 2) * 3 + 3).map((event) => (
              <article key={event.title} className={`${motion.card} group relative aspect-[4/3] overflow-hidden rounded-xl bg-[#0A1E37]`}>
                <Image src={event.image} alt={event.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 280px" className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06142F]/95 via-[#06142F]/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <h3 className="text-sm font-semibold sm:text-base">{event.title}</h3>
                  <p className="mt-2 flex items-center gap-2 text-xs text-[#DCE4EF]"><CalendarBlank size={14} weight="fill" className="text-[#FF8718]" aria-hidden="true" /><time dateTime={event.dateTime}>{event.date}</time></p>
                </div>
              </article>
              ))}
              </div>
            ))}
          </div>
        </section>
        <Testimonials />
      </div>
    </div>
  );
}
