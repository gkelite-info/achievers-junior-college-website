import Image from "next/image";

export default function CampusLife() {
  return (
    <section className="bg-[#111433] pb-[42px] pt-[20px]" id="campus">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-[40px] flex flex-col gap-[32px]">
        <div className="text-center">
          <h2 className="font-sora text-[32px] leading-[42px] font-semibold text-[#FFFFFF]">
            Campus Life
          </h2>
        </div>
        
        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[16px] h-auto md:h-[400px]">
          {/* Large Left Image */}
          <div className="sm:col-span-2 md:row-span-2 rounded-[12px] overflow-hidden relative group h-[300px] md:h-full shadow-[0px_4px_20px_rgba(30,58,138,0.05)] bg-transparent">
            <Image 
              src="/campus-life-1.png"
              alt="Campus Life 1"
              fill
              className="object-cover scale-[1.08] transition-transform duration-500 group-hover:scale-[1.15]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          
          {/* Top Middle */}
          <div className="sm:col-span-1 md:row-span-1 rounded-[12px] overflow-hidden relative group h-[200px] md:h-full shadow-[0px_4px_20px_rgba(30,58,138,0.05)] bg-transparent">
            <Image 
              src="/campus-life-2.png"
              alt="Campus Life 2"
              fill
              className="object-cover scale-[1.08] transition-transform duration-500 group-hover:scale-[1.15]"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          </div>
          
          {/* Top Far Right */}
          <div className="sm:col-span-1 md:row-span-1 rounded-[12px] overflow-hidden relative group h-[200px] md:h-full shadow-[0px_4px_20px_rgba(30,58,138,0.05)] bg-transparent">
            <Image 
              src="/campus-life-3.png"
              alt="Campus Life 3"
              fill
              className="object-cover scale-[1.08] transition-transform duration-500 group-hover:scale-[1.15]"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          </div>
          
          {/* Bottom Right Wide */}
          <div className="sm:col-span-2 md:col-span-2 md:row-span-1 rounded-[12px] overflow-hidden relative group h-[200px] md:h-full shadow-[0px_4px_20px_rgba(30,58,138,0.05)] bg-transparent">
            <Image 
              src="/campus-life-4.png"
              alt="Campus Life 4"
              fill
              className="object-cover scale-[1.08] transition-transform duration-500 group-hover:scale-[1.15]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
