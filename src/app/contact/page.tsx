import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Clock, EnvelopeSimple, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import campusImage from "../../../public/home-banner.webp";
import ContactForm from "./components/ContactForm";

export const metadata: Metadata = {
  title: "Contact | Achievers Junior College",
  description: "Contact Achievers Junior College for admissions, courses, and campus visits.",
};

const address = "Plot #45, Education Hub, Jubilee Hills, Hyderabad, Telangana - 500033";
const mapQuery = encodeURIComponent(address);

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-5 pb-16 text-[#111630] sm:px-8 sm:pb-20">
      <h1 className="sr-only">Contact Achievers Junior College</h1>
      <section aria-label="Contact details" className="grid gap-4 rounded-xl bg-[#071429] p-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="flex gap-4 rounded-xl bg-white p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#3B82F6] text-white"><MapPin size={23} aria-hidden="true" /></span>
          <div><h2 className="text-sm font-semibold">Our Address</h2><p className="mt-1 text-xs leading-5 text-[#63799A]">Plot #45, Education Hub,<br />Jubilee Hills, Hyderabad,<br />Telangana - 500033</p></div>
        </article>
        <article className="flex gap-4 rounded-xl bg-white p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white"><Phone size={23} aria-hidden="true" /></span>
          <div><h2 className="text-sm font-semibold">Call Us</h2><div className="mt-1 text-xs leading-5 text-[#63799A]"><a href="tel:+919876543210" className="block hover:underline">+91 98765 43210</a><a href="tel:+914023456789" className="block hover:underline">+91 40 2345 6789</a></div></div>
        </article>
        <article className="flex min-w-0 gap-4 rounded-xl bg-white p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#F5A000] text-white"><EnvelopeSimple size={23} aria-hidden="true" /></span>
          <div className="min-w-0"><h2 className="text-sm font-semibold">Email Us</h2><div className="mt-1 break-words text-xs leading-5 text-[#63799A]"><a href="mailto:admissions@achieverscollege.edu.in" className="block hover:underline">admissions@achieverscollege.edu.in</a><a href="mailto:info@achieverscollege.edu.in" className="block hover:underline">info@achieverscollege.edu.in</a></div></div>
        </article>
        <article className="flex gap-4 rounded-xl bg-white p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#9333EA] text-white"><Clock size={23} aria-hidden="true" /></span>
          <div><h2 className="text-sm font-semibold">Office Hours</h2><p className="mt-1 text-xs leading-5 text-[#63799A]">Mon - Sat: 9:00 AM - 6:00 PM<br />Sunday: Closed</p></div>
        </article>
      </section>

      <div className="mt-8 grid items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
        <section aria-labelledby="location-heading" className="flex min-w-0 flex-col">
          <h2 id="location-heading" className="text-3xl font-bold tracking-tight">Find Us Here</h2>
          <p className="mt-2 text-sm text-[#63799A]">Visit our campus and experience the Achievers difference.</p>
          <div className="mt-3 min-h-[340px] flex-1 overflow-hidden rounded-2xl border border-[#E1E9F2] bg-[#F5F8FC] sm:min-h-[350px] relative">
            <iframe title="Achievers Junior College location map" src={`https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`} className="absolute inset-0 h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
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
