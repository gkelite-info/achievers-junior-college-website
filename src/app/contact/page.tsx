import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Clock, EnvelopeSimple, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import campusImage from "../../../public/home-banner.webp";
import ContactForm from "./components/ContactForm";

export const metadata: Metadata = {
  title: "Contact | Achievers Junior College",
  description: "Contact Achievers Junior College for admissions, courses, and campus visits.",
};

const address = "9-4-137/51, Tolichowki Rd, Jamali Kunta, Owaisi colony, Surya Nagar, Toli Chowki, Hyderabad, Telangana 500008";
const mapQuery = encodeURIComponent(address);

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-5 pb-16 text-[#111630] sm:px-8 sm:pb-20">
      <h1 className="mb-2 text-2xl font-semibold">Contact Us</h1>
      <ul className="list-disc pl-5 text-sm">
        <li>We warmly welcome students and parents to visit Achievers Junior College and experience our vibrant learning environment.</li>
        <li>Our admissions team is available to provide complete guidance regarding admissions, academic programs, facilities, scholarships and career opportunities.</li>
      </ul>
      <section aria-label="Contact details" className="grid gap-4 rounded-xl bg-[#071429] mt-5 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="flex flex-col items-center text-center gap-4 rounded-xl bg-white p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#3B82F6] text-white"><MapPin size={23} aria-hidden="true" /></span>
          <div><h2 className="text-sm font-semibold">Our Address</h2><p className="mt-1 text-xs leading-5 text-[#63799A]">9-4-137/51, Tolichowki Rd, Jamali Kunta, Owaisi colony, Surya Nagar, Toli Chowki, Hyderabad, Telangana 500008</p></div>
        </article>
        <article className="flex flex-col items-center text-center gap-4 rounded-xl bg-white p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white"><Phone size={23} aria-hidden="true" /></span>
          <div><h2 className="text-sm font-semibold">Call Us</h2><div className="mt-1 text-xs leading-5 text-[#63799A]"><a href="tel:+917337581166" className="block hover:underline">+91 7337581166</a><a href="tel:+918897288809" className="block hover:underline">+91 8897288809</a></div></div>
        </article>
        <article className="flex flex-col items-center text-center gap-4 rounded-xl bg-white p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#F5A000] text-white"><EnvelopeSimple size={23} aria-hidden="true" /></span>
          <div className="min-w-0"><h2 className="text-sm font-semibold">Email Us</h2><div className="mt-1 break-words text-xs leading-5 text-[#63799A]"><a href="mailto:achieversjnrcollege@gmail.com" className="block hover:underline">achieversjnrcollege@gmail.com</a><a href="mailto:achieversjuniorcollege26@gmail.com" className="block hover:underline">achieversjuniorcollege26@gmail.com</a></div></div>
        </article>
        <article className="flex flex-col items-center text-center gap-4 rounded-xl bg-white p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#9333EA] text-white"><Clock size={23} aria-hidden="true" /></span>
          <div><h2 className="text-sm font-semibold">Office Hours</h2><p className="mt-1 text-xs leading-5 text-[#63799A]">Mon - Sat: 9:00 AM - 6:00 PM<br />Sunday: Closed</p></div>
        </article>
      </section>

      <div className="mt-8 grid items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
        <section aria-labelledby="location-heading" className="flex min-w-0 flex-col">
          <h2 id="location-heading" className="text-3xl font-bold tracking-tight">Find Us Here</h2>
          <p className="mt-2 text-sm text-[#63799A]">Visit our campus and experience the Achievers difference.</p>
          <div className="mt-3 min-h-[340px] flex-1 overflow-hidden rounded-2xl border border-[#E1E9F2] bg-[#F5F8FC] sm:min-h-[350px] relative">
            <iframe title="Achievers Junior College location map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3133.074633303871!2d78.41448417420492!3d17.39831808349077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb970078edcc13%3A0x12aa94649f50b675!2sAchievers%20Junior%20College!5e1!3m2!1sen!2sin!4v1790240440027!5m2!1sen!2sin" className="absolute inset-0 h-full w-full border-0" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
          </div>
          <div className="mt-2 flex items-center gap-4 rounded-2xl bg-[#071429] p-4 text-white">
            <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl"><Image src={campusImage} alt="Achievers Junior College campus" fill sizes="80px" className="object-cover" /></div>
            <div className="min-w-0"><h3 className="text-sm font-semibold">Achievers Junior College</h3><p className="mt-1 text-[10px] leading-4 text-[#D2DDEA]">{address}</p><a href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#FFA401] hover:underline">Get Directions <ArrowRight size={14} aria-hidden="true" /></a></div>
          </div>
        </section>
        <ContactForm />
      </div>
    </div>
  );
}
