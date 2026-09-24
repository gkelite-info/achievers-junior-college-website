import { CheckCircle } from "@phosphor-icons/react/dist/ssr";

const reasons = [
  "Experienced & Dedicated Faculty",
  "Personalized Attention for Every Student",
  "Smart Classrooms",
  "Well-Equipped Laboratories",
  "Library Resources",
  "Career-Focused Learning",
  "Technology-Enabled Education",
  "Safe & Student-Friendly Campus",
  "Affordable Quality Education",
];

export default function WhyChooseUs() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[#FFA401] font-bold text-[16px] leading-[24px] tracking-[1px] uppercase">
              The Achievers Advantage
            </span>
            <h2 className="mt-2 text-3xl font-semibold sm:text-[40px] text-[#0B1C30] leading-tight">
              Why Choose <br /> Achievers Junior College?
            </h2>
            <p className="mt-6 text-[#464555] text-lg max-w-[500px]">
              We are committed to helping every student become academically successful, professionally competent, and personally confident.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-6">
            {reasons.map((reason) => (
              <div key={reason} className="flex items-start gap-3">
                <CheckCircle size={24} weight="fill" className="text-[#0055CC] shrink-0 mt-1" />
                <span className="text-[#191C1E] font-medium text-lg leading-tight">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
