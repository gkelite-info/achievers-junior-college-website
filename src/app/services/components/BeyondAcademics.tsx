import { Star, Wrench, Desktop, CheckCircle, Compass, Trophy } from "@phosphor-icons/react/dist/ssr";

const pillars = [
  {
    id: "personality",
    title: "PERSONALITY DEVELOPMENT",
    subtitle: "Building Confident Leaders of Tomorrow",
    icon: Star,
    description: "At Achievers Junior College, personality development is an integral part of education. We believe students must be prepared not only to score high marks but also to succeed confidently in higher education, workplaces, interviews, entrepreneurship, and life.",
    listTitle: "Our Personality Development Program focuses on developing:",
    list: [
      "Self-confidence", "Positive attitude", "Leadership qualities", 
      "Decision-making ability", "Emotional intelligence", "Time management", 
      "Goal setting", "Stress management", "Professional etiquette", "Personal branding"
    ],
    footer: "Students participate in interactive workshops, motivational sessions, group activities, role plays, presentations, and leadership exercises that transform their overall personality."
  },
  {
    id: "skill",
    title: "SKILL DEVELOPMENT",
    subtitle: "Preparing Students for the Future",
    icon: Wrench,
    description: "Today's world demands more than academic knowledge. Our Skill Development initiatives help students acquire practical competencies required in the modern workplace.",
    listTitle: "Programs include:",
    list: [
      "Communication Skills", "English Speaking", "Public Speaking", 
      "Presentation Skills", "Interview Skills", "Group Discussion Training", 
      "Critical Thinking", "Problem Solving", "Creativity", "Innovation", 
      "Team Building", "Leadership Skills", "Digital Literacy", "Career Readiness", "Professional Ethics"
    ],
    footer: "These programs help students become confident, capable, and future-ready professionals."
  },
  {
    id: "digital",
    title: "DIGITAL & AI LEARNING",
    subtitle: "Technology is transforming every profession.",
    icon: Desktop,
    description: "To prepare students for tomorrow's careers, Achievers Junior College introduces learners to modern digital technologies.",
    listTitle: "Our learning initiatives include:",
    list: [
      "Artificial Intelligence Fundamentals", "Digital Marketing Basics", 
      "Computer Applications", "Internet Research Skills", "Online Learning Platforms", 
      "Smart Classroom Learning", "Digital Presentations", "Technology Integration"
    ],
    footer: "Students become familiar with emerging technologies while developing digital confidence."
  },
  {
    id: "career",
    title: "CAREER GUIDANCE & MENTORING",
    subtitle: "Choosing the right career is one of life's most important decisions.",
    icon: Compass,
    description: "Our dedicated Career Guidance Cell provides comprehensive support and direction.",
    listTitle: "We provide:",
    list: [
      "Career counseling", "Higher education planning", "Professional course guidance", 
      "Entrance examination awareness", "University admission support", "Goal setting", 
      "One-to-one mentoring", "Parent counseling", "Career seminars", "Alumni interaction sessions"
    ],
    footer: "Students receive continuous guidance throughout their academic journey."
  },
  {
    id: "extracurricular",
    title: "BEYOND ACADEMICS",
    subtitle: "Education is meaningful when it develops the whole person.",
    icon: Trophy,
    description: "We encourage our students to actively participate in a variety of extracurricular activities.",
    listTitle: "Students actively participate in:",
    list: [
      "Cultural Programs", "Sports Competitions", "Educational Tours", 
      "Field Visits", "Science Exhibitions", "Leadership Camps", 
      "Debate Competitions", "Quiz Programs", "Innovation Activities", 
      "Community Service", "Annual Celebrations", "Talent Shows", 
      "Seminars", "Workshops", "Guest Lectures"
    ],
    footer: "These experiences promote confidence, creativity, discipline, collaboration, and social responsibility."
  }
];

export default function BeyondAcademics() {
  return (
    <section className="bg-[#F2F6FC] py-16 sm:py-24" id="teaching-approach">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-[35px]">
        <div className="mb-16 text-center">
          <span className="text-[#FFA401] font-bold text-[16px] leading-[24px] tracking-[1px] uppercase">
            Beyond Academics
          </span>
          <h2 className="mt-2 text-[28px] sm:text-[40px] font-semibold text-[#0B1C30]">
            Our Teaching Approach
          </h2>
          <p className="mt-6 text-[#464555] max-w-[1000px] mx-auto text-[16px] sm:text-[18px] leading-[28px] sm:leading-[32px]">
            At Achievers Junior College, every academic program is supported by a student-centric learning
            approach that focuses on academic excellence and holistic development. Through personalized
            mentoring, continuous assessments, personality development, communication skills training, leadership
            programs, career guidance, digital learning, and technology-integrated education, we ensure that every
            student is equipped with the knowledge, confidence, and life skills needed to thrive in higher education
            and build a successful future.
          </p>
          <p className="mt-6 font-bold text-[#A36500] text-xl sm:text-2xl">Learn. Grow. Achieve.</p>
        </div>
        
        <div className="flex flex-col gap-10">
          {pillars.map((pillar) => (
            <div key={pillar.id} className="bg-white rounded-[32px] p-8 sm:p-12 shadow-[0px_4px_16px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col xl:flex-row gap-10">
              <div className="xl:w-5/12 flex flex-col gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#E5EDF7] flex items-center justify-center text-[#0055CC] mb-2">
                  <pillar.icon size={36} weight="fill" />
                </div>
                <h3 className="text-[28px] font-bold text-[#191C1E] uppercase">{pillar.title}</h3>
                <h4 className="text-xl font-semibold text-[#0055CC]">{pillar.subtitle}</h4>
                <p className="text-[#464555] text-lg leading-relaxed mt-2">{pillar.description}</p>
                <div className="mt-auto pt-6">
                  <p className="text-[#191C1E] font-medium leading-relaxed bg-[#FFF6E5] p-6 rounded-2xl border border-[#FFE0A3]">
                    {pillar.footer}
                  </p>
                </div>
              </div>
              
              <div className="xl:w-7/12 bg-[#F9FAFB] rounded-[24px] p-8 sm:p-10 border border-gray-100">
                <h4 className="font-semibold text-[#191C1E] text-xl mb-8">{pillar.listTitle}</h4>
                <ul className="grid sm:grid-cols-2 gap-y-5 gap-x-8">
                  {pillar.list.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle size={24} weight="fill" className="text-[#10B981] shrink-0 mt-1" />
                      <span className="text-[#464555] font-medium text-[17px]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
