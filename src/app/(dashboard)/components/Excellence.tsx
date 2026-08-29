import { Medal, Desktop } from "@phosphor-icons/react/dist/ssr";

export default function Excellence() {
  return (
    <section className="py-20 bg-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Images & Badges */}
          <div className="relative">
            {/* Primary Image */}
            <div className="relative z-10 w-[80%] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <div 
                className="absolute inset-0 bg-slate-800"
                style={{
                  backgroundImage: "url('/excellence-1.jpg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            </div>
            
            {/* Secondary Image */}
            <div className="absolute top-[-10%] right-0 z-0 w-[60%] aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900">
              <div 
                className="absolute inset-0 bg-slate-700"
                style={{
                  backgroundImage: "url('/excellence-2.jpg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            </div>
            
            {/* Floating Badge 1 */}
            <div className="absolute bottom-10 left-[-5%] z-20 bg-amber-500 rounded-xl p-6 shadow-xl max-w-[200px]">
              <h4 className="text-3xl font-bold text-slate-900 mb-1">24/7</h4>
              <p className="text-sm text-slate-900 font-medium">
                Expert Mentorship & Query Resolution
              </p>
            </div>
            
            {/* Floating Badge 2 */}
            <div className="absolute bottom-[-10%] right-[10%] z-20 bg-slate-800/90 backdrop-blur-md rounded-xl p-6 shadow-xl border border-slate-700 max-w-[240px]">
              <h4 className="text-lg font-bold text-white mb-1">Visionary Approach</h4>
              <p className="text-sm text-slate-300">
                Beyond syllabus education.
              </p>
            </div>
          </div>
          
          {/* Right: Text Content */}
          <div className="lg:pl-8 mt-16 lg:mt-0">
            <span className="text-amber-500 font-bold tracking-wider text-sm uppercase mb-4 block">
              ACADEMIC EXCELLENCE
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              A Tradition of <br/>
              Excellence & <span className="text-amber-500">Success</span>
            </h2>
            <p className="text-slate-300 text-lg mb-10 leading-relaxed">
              At Achievers Junior College, we don't just teach; we ignite the flame of curiosity and discipline. Our results-driven pedagogy is balanced with holistic personality development.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mr-6 border border-slate-700">
                  <Medal size={24} weight="duotone" className="text-amber-500" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Personalized Learning Paths</h4>
                  <p className="text-slate-400">
                    Every student is assigned a mentor to track progress and identify strengths.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mr-6 border border-slate-700">
                  <Desktop size={24} weight="duotone" className="text-amber-500" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Tech-Enabled Classrooms</h4>
                  <p className="text-slate-400">
                    Using high-end digital interactive modules for complex concepts.
                  </p>
                </div>
              </div>
            </div>
            
          </div>
          
        </div>
      </div>
    </section>
  );
}
