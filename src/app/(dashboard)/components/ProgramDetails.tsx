import React from 'react';
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";

const programDetails = [
  {
    id: "mpc",
    title: "MPC – Mathematics, Physics & Chemistry",
    description: "The MPC program is ideal for students aspiring to pursue careers in Engineering, Technology, Computer Science, Artificial Intelligence, Data Science, Architecture, Defence Services, and other technical fields.",
    listTitle: "Students develop:",
    list: [
      "Strong mathematical and analytical abilities",
      "Scientific reasoning and problem-solving skills",
      "Conceptual understanding through practical learning",
      "Preparation for engineering and competitive entrance examinations"
    ]
  },
  {
    id: "bipc",
    title: "BiPC – Biology, Physics & Chemistry",
    description: "The BiPC program prepares students for rewarding careers in Medicine and Life Sciences. It provides a strong scientific foundation through theoretical learning and practical laboratory experiences.",
    listTitle: "Career pathways include:",
    list: [
      "Medicine (MBBS)",
      "Dentistry (BDS)",
      "Pharmacy",
      "Nursing",
      "Biotechnology",
      "Agriculture",
      "Veterinary Science",
      "Allied Health Sciences",
      "Research and Life Sciences"
    ],
    listTitle2: "Students benefit from:",
    list2: [
      "Well-equipped science laboratories",
      "Practical experimentation",
      "Medical entrance examination guidance",
      "Personalized academic mentoring"
    ]
  },
  {
    id: "mec",
    title: "MEC – Mathematics, Economics & Commerce",
    description: "The MEC program is designed for students interested in finance, business, economics, and management. It combines mathematical and commercial knowledge to prepare students for professional careers in the corporate and financial sectors.",
    listTitle: "Career opportunities include:",
    list: [
      "Chartered Accountancy (CA)",
      "Banking and Finance",
      "Business Administration",
      "Financial Management",
      "Investment and Insurance",
      "Economics",
      "Entrepreneurship",
      "Business Analytics"
    ],
    footer: "Students develop strong analytical, financial, and decision-making skills that prepare them for higher education and professional success."
  },
  {
    id: "cec",
    title: "CEC – Civics, Economics & Commerce",
    description: "The CEC program provides students with a comprehensive understanding of commerce, economics, governance, and public administration. It is ideal for students interested in law, administration, management, and social sciences.",
    listTitle: "Career pathways include:",
    list: [
      "Law",
      "Civil Services",
      "Public Administration",
      "Business Management",
      "Commerce",
      "Political Science",
      "Journalism",
      "Social Sciences"
    ],
    footer: "The curriculum strengthens communication skills, leadership qualities, critical thinking, and decision-making abilities."
  },
  {
    id: "ace",
    title: "ACE – Accounts, Commerce & Economics",
    description: "The ACE Program (Accounts, Commerce & Economics) is specially designed for students who aspire to build successful careers in commerce, finance, business, accounting, management, and entrepreneurship. By integrating Accounts, Commerce, and Economics, the program provides students with a strong academic foundation while developing practical business knowledge and analytical skills required in today's competitive world.",
    footer: "Our experienced faculty emphasize concept-based learning, real-world business applications, case studies, regular assessments, and personalized mentoring to ensure students gain a thorough understanding of financial principles, commercial practices, and economic concepts."
  }
];

export default function ProgramDetails() {
  return (
    <section className="bg-[#F9FAFB] py-16 sm:py-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-[35px]">
        <div className="text-center mb-16">
          <h2 className="text-[28px] sm:text-[36px] font-semibold text-[#0B1C30]">
            Detailed Program Breakdown
          </h2>
          <p className="mt-4 text-[#464555] max-w-[700px] mx-auto text-lg">
            Explore the career pathways and core benefits of each academic stream we offer.
          </p>
        </div>
        
        <div className="flex flex-col gap-12">
          {programDetails.map((prog, index) => (
            <div key={prog.id} id={prog.id} className={`bg-white rounded-[32px] p-8 sm:p-12 shadow-[0px_4px_16px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col gap-6 scroll-mt-24`}>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="shrink-0 w-12 h-12 rounded-full bg-[#E5EDF7] flex items-center justify-center text-[#0055CC] font-bold text-xl">
                  {index + 1}
                </div>
                <h3 className="text-2xl sm:text-[28px] font-semibold text-[#191C1E]">{prog.title}</h3>
              </div>
              <p className="text-lg text-[#464555] leading-relaxed">
                {prog.description}
              </p>
              
              {prog.list && (
                <div className="mt-2">
                  <h4 className="font-semibold text-[#191C1E] text-lg mb-4">{prog.listTitle}</h4>
                  <ul className="grid sm:grid-cols-2 gap-y-3 gap-x-8">
                    {prog.list.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle size={24} weight="fill" className="text-[#10B981] shrink-0 mt-0.5" />
                        <span className="text-[#464555] text-[16px]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {prog.list2 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-[#191C1E] text-lg mb-4">{prog.listTitle2}</h4>
                  <ul className="grid sm:grid-cols-2 gap-y-3 gap-x-8">
                    {prog.list2.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle size={24} weight="fill" className="text-[#0055CC] shrink-0 mt-0.5" />
                        <span className="text-[#464555] text-[16px]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {prog.footer && (
                <div className="mt-4 p-6 bg-[#F2F6FC] rounded-2xl">
                  <p className="text-[#191C1E] font-medium leading-relaxed text-[16px]">
                    {prog.footer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
