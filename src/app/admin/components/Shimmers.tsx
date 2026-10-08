"use client";

import React from "react";

export function CourseCardShimmer() {
  return (
    <div className="flex min-h-36 flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2.5 flex-1">
          <div className="h-5 w-4/5 rounded-md shimmer" />
          <div className="h-5 w-2/3 rounded-md shimmer" />
        </div>
        <div className="h-7 w-14 shrink-0 rounded-lg shimmer" />
        <div className="h-9 w-20 shrink-0 rounded-lg shimmer" />
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="h-4 w-24 rounded-md shimmer" />
        <div className="flex items-center gap-2">
          <div className="h-4 w-14 rounded-md shimmer" />
          <div className="h-7 w-12 rounded-full shimmer" />
        </div>
      </div>
    </div>
  );
}

export function ApplicationsOverviewShimmer() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex h-28 items-center gap-4 rounded-2xl border border-gray-200/80 bg-white p-5"
          >
            <div className="h-12 w-12 shrink-0 rounded-2xl shimmer" />
            <div className="flex-1 space-y-2.5">
              <div className="h-3.5 w-2/3 rounded shimmer" />
              <div className="h-7 w-1/3 rounded-md shimmer" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_1fr] gap-6">
        {[1, 2].map((panel) => (
          <div
            key={panel}
            className="h-80 space-y-5 rounded-2xl border border-gray-200/80 bg-white p-6"
          >
            <div className="h-5 w-40 rounded-md shimmer" />
            <div className="h-4 w-64 max-w-full rounded shimmer" />
            <div className="h-48 w-full rounded-xl shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableShimmer() {
  return (
    <div className="space-y-3 p-4">
      <div className="h-10 rounded-xl shimmer" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-14 rounded-xl border border-gray-100 shimmer" />
      ))}
    </div>
  );
}

export function NavbarProfileShimmer() {
  return (
    <div className="flex items-center gap-2 px-1 sm:pr-2.5" aria-hidden="true">
      <div className="h-7 w-7 shrink-0 rounded-full shimmer" />
      <div className="hidden sm:block h-4 w-32 rounded-full shimmer" />
      <div className="hidden sm:block h-3.5 w-3.5 rounded shimmer" />
    </div>
  );
}

export function NavbarActionsShimmer() {
  return (
    <div className="flex items-center gap-3 sm:gap-4" aria-hidden="true">
      <NavbarProfileShimmer />
    </div>
  );
}

export function NavbarSearchShimmer() {
  return (
    <div className="hidden md:flex items-center justify-between gap-3 px-4 py-2 rounded-full border border-gray-200 bg-gray-50/80 w-64 lg:w-96 shadow-sm">
      <div className="h-3 w-32 rounded-full shimmer" />
      <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin shrink-0" />
    </div>
  );
}

export function RegistrationPageShimmer() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8" aria-hidden="true">
      {/* Header section shimmer */}
      <div className="space-y-2">
        <div className="h-8 w-44 rounded-xl shimmer" />
        <div className="h-4 w-96 max-w-full rounded-md shimmer" />
      </div>

      {/* Form Container shimmer (above form) */}
      <div className="max-w-4xl space-y-8 pt-4">
        {/* Form grid shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {[
            { width: "w-32" },
            { width: "w-28" },
            { width: "w-28" },
            { width: "w-24" },
          ].map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className={`h-4 ${item.width} rounded shimmer`} />
              <div className="h-12 w-full rounded-xl border border-gray-200 shimmer" />
            </div>
          ))}
        </div>

        {/* Add button shimmer */}
        <div className="flex justify-end pt-2">
          <div className="h-11 w-28 rounded-xl shimmer" />
        </div>

        {/* Added Branches Table shimmer (below table) */}
        <div className="pt-4 space-y-3">
          <div className="h-4 w-36 rounded shimmer" />
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <TableShimmer />
            {/* Pagination shimmer */}
            <div className="px-4 py-4 bg-white border-t border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-7 w-28 rounded-lg shimmer" />
                <div className="h-4 w-36 rounded shimmer" />
              </div>
              <div className="h-8 w-60 rounded-lg shimmer" />
            </div>
          </div>
        </div>

        {/* Action Buttons (Cancel & Save) shimmer */}
        <div className="pt-6 flex items-center justify-center gap-4">
          <div className="h-11 w-32 rounded-xl shimmer" />
          <div className="h-11 w-32 rounded-xl shimmer" />
        </div>
      </div>
    </div>
  );
}

export function GalleryOverallShimmer() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" aria-hidden="true">
      {/* 1. Header Shimmer */}
      <div className="space-y-2">
        <div className="h-7 w-60 rounded-xl shimmer" />
        <div className="h-4 w-96 max-w-full rounded shimmer" />
      </div>

      {/* 2. Controls Toolbar: Category Filter Pills, Search Bar & Sort Dropdown */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Category Filter Pills Shimmer */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {[76, 128, 120, 110, 84].map((width, idx) => (
            <div
              key={idx}
              className="h-8 rounded-xl shimmer shrink-0"
              style={{ width: `${width}px` }}
            />
          ))}
        </div>

        {/* Search & Sort Controls Shimmer */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-60 sm:w-64 rounded-xl shimmer flex-1" />
          <div className="h-9 w-32 rounded-xl shimmer shrink-0" />
        </div>
      </div>

      {/* 3. Grid Shimmer (12 Cards: Upload Box + 11 Image Cards across 3 Rows) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {/* Upload Card Shimmer */}
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-4 sm:p-5 flex flex-col justify-between items-center text-center shadow-xs">
          <div className="flex flex-col items-center w-full space-y-2">
            <div className="w-11 h-11 rounded-full shimmer" />
            <div className="h-4 w-32 rounded-md shimmer" />
            <div className="h-3 w-40 rounded shimmer" />
          </div>
          <div className="w-full space-y-2 mt-3">
            <div className="h-8 w-full rounded-xl shimmer" />
            <div className="h-8 w-full rounded-xl shimmer" />
          </div>
        </div>

        {/* 11 Gallery Cards Shimmer */}
        {Array.from({ length: 11 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm flex flex-col"
          >
            <div className="relative aspect-[4/3] w-full bg-gray-100 shimmer" />
            <div className="px-4 py-3 border-t border-gray-50 flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 rounded-full bg-gray-200 shimmer" />
              <div className="h-3.5 w-24 rounded bg-gray-200 shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminHomeShimmer() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto select-none font-sans" aria-hidden="true">
      {/* 1. Header Shimmer */}
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-xl shimmer" />
        <div className="h-4 w-96 max-w-full rounded-md shimmer" />
      </div>

      {/* 2. 5 Metric / KPI Cards Shimmer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs flex flex-col justify-between min-h-[160px]"
          >
            <div className="w-10 h-10 rounded-xl shimmer" />
            <div className="mt-4 space-y-2">
              <div className="h-7 w-20 rounded-md shimmer" />
              <div className="h-3.5 w-28 rounded shimmer" />
            </div>
            <div className="mt-3 h-4 w-32 rounded shimmer" />
          </div>
        ))}
      </div>

      {/* 3. Two Column Grid - Row 1 Shimmer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications Card Shimmer */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 flex flex-col justify-between min-h-[440px]">
          <div>
            <div className="pb-4 border-b border-gray-100">
              <div className="h-5 w-44 rounded-md shimmer" />
            </div>
            <div className="divide-y divide-gray-50 pt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 flex-1">
                    <div className="w-10 h-10 rounded-full shrink-0 shimmer" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-36 rounded shimmer" />
                      <div className="h-3 w-16 rounded shimmer" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5 shrink-0">
                    <div className="h-3.5 w-28 rounded shimmer hidden sm:block" />
                    <div className="h-6 w-16 rounded-full shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Overview Card Shimmer */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 flex flex-col justify-between min-h-[440px]">
          <div>
            <div className="pb-4 border-b border-gray-100">
              <div className="h-5 w-40 rounded-md shimmer" />
            </div>
            <div className="mt-6 h-48 w-full rounded-xl shimmer" />
            <div className="flex justify-between gap-2 mt-2 px-9">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="h-3 w-6 rounded shimmer" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 mt-4 border-t border-gray-100/80">
            <div className="h-16 rounded-2xl border border-slate-100 shimmer" />
            <div className="h-16 rounded-2xl border border-slate-100 shimmer" />
          </div>
        </div>
      </div>

      {/* 4. Two Column Grid - Row 2 Shimmer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Gallery Images Card Shimmer */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 min-h-[420px]">
          <div className="pb-4 border-b border-gray-100">
            <div className="h-5 w-44 rounded-md shimmer" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <div className="aspect-[4/3] w-full rounded-xl shimmer" />
                <div className="h-3 w-16 rounded shimmer" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reviews Card Shimmer */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 min-h-[420px]">
          <div className="pb-4 border-b border-gray-100">
            <div className="h-5 w-36 rounded-md shimmer" />
          </div>
          <div className="space-y-3.5 mt-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl border border-slate-100 p-4.5 shimmer" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

