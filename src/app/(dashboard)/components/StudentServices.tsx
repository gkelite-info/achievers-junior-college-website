import { BookOpen, Laptop, Heartbeat } from "@phosphor-icons/react/dist/ssr";

const steps = [
  {
    num: "1",
    title: "Inquiry",
    desc: "Submit online form or visit campus.",
  },
  {
    num: "2",
    title: "Counseling",
    desc: "Interact with our academic experts.",
  },
  {
    num: "3",
    title: "Registration",
    desc: "Documentation and fee formalities.",
  },
  {
    num: "4",
    title: "Onboarding",
    desc: "Orientation and commencement.",
  },
];

export default function StudentServices() {
  return (
    <section className="bg-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Left: Services (Dark) */}
          <div className="py-20">
            <h2 className="text-3xl font-bold text-amber-500 mb-10">
              Student Services
            </h2>
            
            <div className="space-y-8 mb-12">
              <div className="flex items-start">
                <BookOpen size={24} className="text-white mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-bold text-white">Digital Library</h4>
                  <p className="text-sm text-slate-400">Access to thousands of journals and e-books.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Laptop size={24} className="text-white mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-bold text-white">Advanced Computer Lab</h4>
                  <p className="text-sm text-slate-400">Latest hardware and coding environments.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Heartbeat size={24} className="text-white mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-bold text-white">Sports & Wellness</h4>
                  <p className="text-sm text-slate-400">Encouraging physical health and team spirit.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-8">
              <h3 className="text-xl font-bold text-amber-500 mb-2">Online Fee Payment</h3>
              <p className="text-slate-300 mb-6 text-sm">
                Secure and convenient portal for all transaction needs.
              </p>
              <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded transition-colors shadow-lg">
                Pay Fees Now
              </button>
            </div>
          </div>
          
          {/* Right: Admissions 2026 (White Card overlapping) */}
          <div className="lg:py-20 pb-20 lg:pb-0 h-full flex flex-col justify-center">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl relative lg:-mr-12">
              <h3 className="text-3xl font-bold text-slate-900 mb-10">
                Admissions 2026
              </h3>
              
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:ml-[1.125rem] md:before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-amber-200 before:to-transparent">
                {steps.map((step, idx) => (
                  <div key={idx} className="relative flex items-start">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-500 ring-4 ring-white z-10 text-white font-bold flex-shrink-0 mr-6">
                      {step.num}
                    </div>
                    <div className="pt-1.5">
                      <h4 className="text-lg font-bold text-slate-900 mb-1">{step.title}</h4>
                      <p className="text-slate-600 text-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
