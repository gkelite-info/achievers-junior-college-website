interface StatItem {
  value: string;
  label: string;
}

interface StatsBarProps {
  variant?: "light" | "dark";
  stats?: StatItem[];
}

const defaultStats: StatItem[] = [
  { value: "98%", label: "Pass Rate" },
  { value: "10,000+", label: "Students" },
  { value: "25+", label: "Expert Faculty" },
  { value: "20+", label: "Years of Legacy" },
];

export default function StatsBar({ variant = "dark", stats = defaultStats }: StatsBarProps) {
  if (variant === "light") {
    return (
      <div className="bg-[#ECEEF0] py-[32px] sm:py-[48px]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-[40px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-[32px] md:gap-[24px] justify-items-center">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center gap-[3px] w-full max-w-[282px]">
                <h3 className="font-poppins font-semibold text-[24px] sm:text-[32px] leading-[30px] sm:leading-[42px] text-[#0B1C30]">
                  {stat.value}
                </h3>
                <p className="font-poppins font-semibold text-[12px] sm:text-[14px] leading-[15px] sm:leading-[17px] tracking-[0.14px] text-[#424654] text-center">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-[#111433] pt-[20px] pb-[17px] sm:pt-[40px] sm:pb-[34px]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-[40px]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[24px] justify-items-center">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="flex flex-col justify-center items-center gap-[3px] w-full max-w-[282px] h-[87px] bg-[#FFFFFF] rounded-[5px] p-[10px]"
            >
              <h3 className="font-poppins font-semibold text-[24px] sm:text-[32px] leading-[30px] sm:leading-[42px] text-[#0B1C30]">
                {stat.value}
              </h3>
              <p className="font-poppins font-semibold text-[12px] sm:text-[14px] leading-[15px] sm:leading-[17px] tracking-[0.14px] text-[#424654] text-center">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
