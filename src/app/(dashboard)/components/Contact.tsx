import { MapPin, Phone, EnvelopeSimple, CaretDown } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

export default function Contact() {
  return (
    <section className="bg-[#FFFFFF] pt-[45px] pb-[96px]" id="contact">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-[40px]">
        <div className="flex flex-col lg:flex-row justify-center items-start gap-[64px]">
          
          {/* Left: Contact Info & Map */}
          <div className="flex flex-col gap-[32px] w-full lg:w-[568px] shrink-0">
            <h2 className="font-sora font-semibold text-[32px] leading-[42px] text-[#0A1E37]">
              Get in Touch
            </h2>
            
            <div className="flex flex-col gap-[24px] sm:gap-[32px]">
              <div className="flex items-start gap-[16px]">
                <MapPin size={20} weight="fill" className="text-[#0A1E37] mt-1 shrink-0" />
                <p className="font-sora font-normal text-[16px] leading-[26px] text-[#424654]">
                  Plot #45, Education Hub, Jubilee Hills, Hyderabad, Telangana - 500033
                </p>
              </div>
              
              <div className="flex items-start gap-[16px]">
                <Phone size={20} weight="fill" className="text-[#0A1E37] shrink-0 mt-[3px]" />
                <p className="font-sora font-normal text-[16px] leading-[26px] text-[#424654]">
                  +91 98765 43210 | +91 40 2345 6789
                </p>
              </div>
              
              <div className="flex items-start gap-[16px]">
                <EnvelopeSimple size={20} weight="fill" className="text-[#0A1E37] shrink-0 mt-[3px]" />
                <p className="font-sora font-normal text-[16px] leading-[26px] text-[#424654] break-all">
                  admissions@achieverscollege.edu.in
                </p>
              </div>
            </div>
            
            {/* Map Embed */}
            <div className="w-full h-[256px] bg-[#ECEEF0] shadow-[inset_0px_2px_4px_rgba(0,0,0,0.05)] rounded-[12px] relative overflow-hidden mt-[1.6px]">
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0} 
                src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=Plot%20%2345,%20Education%20Hub,%20Jubilee%20Hills,%20Hyderabad,%20Telangana%20-%20500033+(Achievers%20Junior%20College)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                title="Achievers Junior College Location"
              />
            </div>
          </div>
          
          {/* Right: Enquiry Form */}
          <div className="relative w-full lg:w-[568px] bg-[#F2F4F6] border border-[rgba(194,198,214,0.3)] rounded-[16px] p-[24px] sm:p-[40px] flex flex-col gap-[32px] shrink-0 shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]">
            <h3 className="font-sora font-semibold text-[24px] leading-[34px] text-[#0A1E37]">
              Admission Enquiry
            </h3>
            
            <form className="flex flex-col gap-[16px]">
              <div className="flex flex-col md:flex-row gap-[16px]">
                <input
                  type="text"
                  placeholder="Student Name"
                  className="w-full h-[50px] bg-[#FFFFFF] border border-[#C2C6D6] rounded-[8px] px-[12px] font-sora text-[16px] text-[#191C1E] placeholder-[#6B7280] focus:outline-none focus:border-[#FFA401]"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full h-[50px] bg-[#FFFFFF] border border-[#C2C6D6] rounded-[8px] px-[12px] font-sora text-[16px] text-[#191C1E] placeholder-[#6B7280] focus:outline-none focus:border-[#FFA401]"
                  required
                />
              </div>
              
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full h-[50px] bg-[#FFFFFF] border border-[#C2C6D6] rounded-[8px] px-[12px] font-sora text-[16px] text-[#191C1E] placeholder-[#6B7280] focus:outline-none focus:border-[#FFA401]"
                required
              />
              
              <div className="relative w-full">
                <select 
                  className="w-full h-[50px] bg-[#FFFFFF] border border-[#C2C6D6] rounded-[8px] pl-[12px] pr-[40px] font-sora text-[16px] text-[#191C1E] placeholder-[#6B7280] focus:outline-none focus:border-[#FFA401] appearance-none cursor-pointer"
                  required
                  defaultValue=""
                >
                  <option value="" disabled className="text-[#6B7280]">Select Interested Course</option>
                  <option value="mpc">MPC - Integrated IIT-JEE</option>
                  <option value="bipc">BiPC - NEET Coaching</option>
                  <option value="mec">MEC & CEC</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-[12px] pointer-events-none">
                  <CaretDown size={24} className="text-[#6B7280]" />
                </div>
              </div>
              
              <textarea
                placeholder="Your Message"
                className="w-full h-[128px] bg-[#FFFFFF] border border-[#C2C6D6] rounded-[8px] p-[12px] font-sora text-[16px] text-[#191C1E] placeholder-[#6B7280] focus:outline-none focus:border-[#FFA401] resize-none"
                required
              ></textarea>
              
              <button
                type="submit"
                className="w-full h-[56px] bg-[#FFA401] rounded-[8px] font-sora font-bold text-[18px] text-[#FFFFFF] flex justify-center items-center mt-2 hover:bg-[#e69400] transition-colors"
              >
                Send Enquiry
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </section>
  );
}
