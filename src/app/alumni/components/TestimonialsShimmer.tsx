import React from "react";

export default function TestimonialsShimmer() {
  return (
    <section className="w-full animate-pulse">
      {/* Header Shimmer */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E1E9F2] pb-6">
        <div className="space-y-3">
          <div className="h-10 w-64 rounded-xl bg-gray-200"></div>
          <div className="h-5 w-48 rounded-lg bg-gray-100"></div>
        </div>
        <div className="h-12 w-48 rounded-xl bg-gray-200"></div>
      </div>

      {/* Grid Shimmer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm box-border">
            <div>
              <div className="flex items-center justify-between gap-2.5 mb-3.5 pb-2.5 border-b border-gray-50">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-full bg-gray-200"></div>
                  <div className="h-4 w-28 rounded-lg bg-gray-200"></div>
                </div>
                <div className="h-3 w-16 rounded bg-amber-100"></div>
              </div>
              <div className="space-y-2 mt-2.5">
                <div className="h-3 w-full rounded bg-gray-100"></div>
                <div className="h-3 w-5/6 rounded bg-gray-100"></div>
                <div className="h-3 w-4/6 rounded bg-gray-100"></div>
              </div>
              <div className="h-3 w-16 rounded bg-orange-100 mt-2.5"></div>
              <div className="grid grid-cols-3 gap-2 mt-3.5">
                <div className="h-18 rounded-xl bg-gray-100"></div>
                <div className="h-18 rounded-xl bg-gray-100"></div>
                <div className="h-18 rounded-xl bg-gray-100"></div>
              </div>
            </div>
            <div className="mt-3.5 pt-2 border-t border-gray-50 flex items-center">
              <div className="h-3 w-20 rounded bg-gray-100"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
