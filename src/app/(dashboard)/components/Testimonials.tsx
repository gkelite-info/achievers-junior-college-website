import TestimonialCard from "./TestimonialCard";

const testimonials = [
  {
    id: 1,
    quote: "Achievers University transformed my way of learning. The mentors are incredibly supportive and the campus environment is truly inspiring.",
    name: "Sarah Johnson",
    role: "MPC Student, 2023",
    avatar: "/avatars/sarah.png",
  },
  {
    id: 2,
    quote: "The rigorous coaching for NEET was the key to my success. I wouldn't have achieved my dream score without the dedicated faculty here.",
    name: "Alex Rivera",
    role: "BiPC Student, 2023",
    avatar: "/avatars/alex.png",
  },
  {
    id: 3,
    quote: "I chose the MEC group and the career services team helped me get into my dream business school. Truly a holistic education.",
    name: "Maya Chen",
    role: "MEC Student, 2024",
    avatar: "/avatars/maya.png",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[#F7F9FB] py-[43px] pb-[72px] sm:py-[64px]" id="testimonials">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-[24px] flex flex-col gap-[64px]">
        {/* Header Container */}
        <div className="flex flex-col items-center gap-[16px]">
          <span className="text-[#FFA401] font-bold text-[18px] sm:text-[20.78px] leading-[21px] tracking-[2.08px] text-center uppercase">
            TESTIMONIALS
          </span>
          <h2 className="text-[#191C1E] font-semibold text-3xl md:text-[40px] leading-tight text-center">
            The Foundation of Our Success
          </h2>
          <p className="mt-2 text-[#464555] max-w-[800px] text-center text-[16px] sm:text-lg leading-[28px]">
            The trust and appreciation of our students and parents are the foundation of our success.
          </p>
          
          <div className="mt-2 mb-2 text-center w-full">
            <h3 className="font-semibold text-[#191C1E] text-[18px] mb-5">Families value our:</h3>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-[900px] mx-auto">
              {[
                "Dedicated Faculty", "Individual Attention", "Academic Excellence", 
                "Personality Development", "Career Guidance", "Discipline", 
                "Safe Campus", "Supportive Learning Environment", 
                "Technology-Based Teaching", "Student-Centered Approach"
              ].map((val) => (
                <span key={val} className="px-5 py-2.5 bg-white text-[#0055CC] rounded-full font-medium shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border border-[#E1E9F2] text-[15px]">
                  {val}
                </span>
              ))}
            </div>
          </div>
          
          <p className="mb-6 text-[#191C1E] font-semibold text-center max-w-[800px] text-[16px] sm:text-lg leading-[28px]">
            Their positive experiences motivate us to continuously improve and maintain the highest standards of education.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[32px] drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
          {testimonials.map((testimonial) => (
            <TestimonialCard 
              key={testimonial.id}
              quote={testimonial.quote}
              name={testimonial.name}
              role={testimonial.role}
              avatar={testimonial.avatar}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
