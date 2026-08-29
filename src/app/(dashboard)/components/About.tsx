import Image from "next/image";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";

const bullets = [
  "Comprehensive research-based academic curriculum.",
  "Personalized mentorship and career guidance sessions.",
  "World-class labs and collaborative learning spaces.",
];

export default function About() {
  return (
    <section className="bg-[#111433] py-[32px] sm:py-[64px]" id="about">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-0">
        <div className="bg-[#FFFFFF] rounded-[16px] px-6 py-[62px] xl:px-[40px] flex flex-col xl:flex-row justify-center items-center gap-[32px] xl:gap-[77.86px] relative isolate overflow-hidden">

          {/* Left: Image with decorative background */}
          <div className="w-full xl:w-[560px] relative shrink-0">
            {/* Decorative pattern */}
            <div
              className="hidden md:block absolute w-[124px] h-[124px] -right-[39px] -top-[39px] opacity-30 -z-10"
              style={{
                background: "radial-gradient(70.71% 70.71% at 50% 50%, #3525CD 8.84%, rgba(53, 37, 205, 0) 8.84%)"
              }}
            />

            {/* Image Container */}
            <div className="relative w-full aspect-[560/588] rounded-[16px] overflow-hidden shadow-[0px_24.33px_48.66px_-11.68px_rgba(0,0,0,0.25)] bg-slate-100 z-10">
              <Image
                src="/cultivate-skills.png"
                alt="Cultivate Your Skills"
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 560px"
              />
              {/* Gradient Overlay */}
              <div
                className="absolute inset-0 z-20 pointer-events-none"
                style={{
                  background: "linear-gradient(0deg, rgba(53, 37, 205, 0.4) 0%, rgba(53, 37, 205, 0) 100%)"
                }}
              />
            </div>
          </div>

          {/* Right: Content */}
          <div className="w-full xl:w-[560px] flex flex-col gap-[30px] shrink-0 z-10">
            <div className="flex flex-col gap-[4px]">
              <span className="text-[#FFA401] font-bold text-[20px] leading-[14px] tracking-[1.36px] uppercase">
                ABOUT US
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-[46.7px] font-semibold text-[#191C1E] leading-tight lg:leading-[56px] mt-4">
                Cultivate Your Skills and Knowledge
              </h2>
            </div>

            <p className="text-[#464555] text-[16px] leading-[25px] font-normal">
              Our institution stands at the intersection of tradition and innovation. We believe in providing a holistic educational experience that goes beyond textbooks, preparing students for real-world challenges.
            </p>

            <ul className="flex flex-col gap-[16px]">
              {bullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-[12px]">
                  <div className="w-[24px] h-[24px] bg-[#FFA401] rounded-full flex items-center justify-center shrink-0 mt-[1px]">
                    <CheckCircle size={24} weight="bold" className="text-white" />
                  </div>
                  <span className="text-[#464555] text-[16px] leading-[23px] font-normal">{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="bg-[#FFA401] rounded-[15.5px] p-[24px] flex flex-col sm:flex-row items-center sm:items-center gap-[16px] sm:gap-[23.36px] text-center sm:text-left">
              <div className="w-[62.29px] h-[62.29px] bg-[#FFFFFF] rounded-full flex items-center justify-center shrink-0">
                <Image src="/target.svg" alt="Target Mission" width={32} height={32} className="object-contain" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-[#FFFFFF] font-semibold text-[16px] leading-[23px] mb-1">Our Mission</h4>
                <p className="text-[#FFFFFF] opacity-80 font-normal text-[14px] leading-[19px]">
                  To drive knowledge and innovation by empowering students with critical thinking skills.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
