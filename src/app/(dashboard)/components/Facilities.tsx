import { 
  MonitorPlay, Flask, Desktop, BookOpen, Laptop, Basketball, 
  MicrophoneStage, Compass, Handshake, ShieldCheck, Users, Sparkle 
} from "@phosphor-icons/react/dist/ssr";

const facilities = [
  { name: "Smart Digital Classrooms", icon: MonitorPlay },
  { name: "Modern Science Laboratories", icon: Flask },
  { name: "Computer Lab", icon: Desktop },
  { name: "Library", icon: BookOpen },
  { name: "Digital Learning Resources", icon: Laptop },
  { name: "Sports Facilities", icon: Basketball },
  { name: "Seminar Hall", icon: MicrophoneStage },
  { name: "Career Guidance Cell", icon: Compass },
  { name: "Counseling Support", icon: Handshake },
  { name: "Safe & Secure Campus", icon: ShieldCheck },
  { name: "Student Activity Areas", icon: Users },
  { name: "Clean & Hygienic Environment", icon: Sparkle },
];

export default function Facilities() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-[35px]">
        <div className="text-center mb-16">
          <span className="text-[#FFA401] font-bold text-[16px] leading-[24px] tracking-[1px] uppercase">
            Campus Experience
          </span>
          <h2 className="mt-2 text-[28px] sm:text-[40px] font-semibold text-[#0B1C30]">
            Campus Facilities
          </h2>
          <p className="mt-6 text-[#464555] max-w-[800px] mx-auto text-[16px] sm:text-lg leading-[28px]">
            Achievers Junior College offers a modern learning environment equipped with facilities that support academic excellence.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {facilities.map((facility) => (
            <div key={facility.name} className="flex flex-col items-center gap-4 p-6 sm:p-8 rounded-[24px] bg-[#F2F6FC] hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center justify-center size-16 rounded-full bg-[#0055CC] text-white">
                <facility.icon size={32} weight="fill" />
              </div>
              <h3 className="text-center font-semibold text-[#191C1E] text-[17px] sm:text-[19px]">{facility.name}</h3>
            </div>
          ))}
        </div>
        
        <div className="mt-14 text-center">
          <p className="inline-block px-6 py-4 rounded-2xl bg-[#FFF6E5] border border-[#FFE0A3] text-[#191C1E] font-medium text-[16px] sm:text-lg">
            Every facility is designed to enhance learning and overall student development.
          </p>
        </div>
      </div>
    </section>
  );
}
