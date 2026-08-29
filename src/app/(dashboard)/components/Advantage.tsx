import { ChalkboardTeacher, Desktop, Bus, GraduationCap } from "@phosphor-icons/react/dist/ssr";

const advantages = [
  {
    icon: <ChalkboardTeacher size={32} weight="duotone" className="text-indigo-900" />,
    title: "Experienced Faculty",
    description: "Learn from veteran educators with a proven track record of student success.",
  },
  {
    icon: <Desktop size={32} weight="duotone" className="text-indigo-900" />,
    title: "Smart Classrooms",
    description: "Digital learning tools and audio-visual aids for better conceptual clarity.",
  },
  {
    icon: <Bus size={32} weight="duotone" className="text-indigo-900" />,
    title: "Safe Transportation",
    description: "Safe and reliable transport facilities covering major parts of the city.",
  },
  {
    icon: <GraduationCap size={32} weight="duotone" className="text-indigo-900" />,
    title: "Scholarships",
    description: "Rewarding academic brilliance with merit-based financial aid programs.",
  },
];

export default function Advantage() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            The Achievers Advantage
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {advantages.map((adv, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
                {adv.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{adv.title}</h3>
              <p className="text-slate-600 max-w-sm leading-relaxed">
                {adv.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
