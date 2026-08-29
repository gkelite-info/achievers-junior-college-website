import Image from "next/image";

export interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

export default function TestimonialCard({ quote, name, role, avatar }: TestimonialCardProps) {
  return (
    <div className="bg-[#FFFFFF] rounded-[16px] p-[32px] flex flex-col gap-[24px]">
      {/* Icon */}
      <div className="shrink-0 w-[32px] h-[32px] relative">
        <Image 
          src="/quotes.svg"
          alt="Quote"
          fill
          className="object-contain object-left"
        />
      </div>
      
      {/* Quote */}
      <p className="text-[#464555] font-normal text-[16px] leading-[24px] grow">
        {quote}
      </p>

      {/* Profile */}
      <div className="flex items-center gap-[16px] pt-[8px]">
        <div className="w-[48px] h-[48px] rounded-full overflow-hidden shrink-0 relative bg-slate-200">
          <Image 
            src={avatar} 
            alt={name}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div className="flex flex-col">
          <h5 className="font-semibold text-[16px] leading-[24px] text-[#191C1E]">
            {name}
          </h5>
          <p className="font-normal text-[12px] leading-[16px] text-[#464555]">
            {role}
          </p>
        </div>
      </div>
    </div>
  );
}
