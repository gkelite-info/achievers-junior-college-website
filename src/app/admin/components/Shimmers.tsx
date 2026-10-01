"use client";

import React from "react";

export function CourseCardShimmer() {
  return (
    <div className="flex flex-col p-4 rounded-xl border border-gray-200 shadow-sm bg-white gap-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="h-5 bg-gray-200 rounded-md w-3/4" />
        <div className="h-5 bg-gray-200 rounded-md w-12" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="h-4 bg-gray-200 rounded-md w-16" />
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded-md w-10" />
          <div className="h-5 w-9 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ApplicationsOverviewShimmer() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-100 border border-gray-200/80 p-5" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_1fr] gap-6">
        <div className="h-80 rounded-2xl bg-gray-100 border border-gray-200/80 p-6" />
        <div className="h-80 rounded-2xl bg-gray-100 border border-gray-200/80 p-6" />
      </div>
    </div>
  );
}

export function TableShimmer() {
  return (
    <div className="space-y-3 animate-pulse p-4">
      <div className="h-10 bg-gray-100 rounded-xl" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-14 bg-gray-50 rounded-xl border border-gray-100" />
      ))}
    </div>
  );
}
