"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  FileText,
  BookOpen,
  CreditCard,
  Image as ImageIcon,
  Star,
} from "@phosphor-icons/react";
import { supabase } from "@/lib/supabaseClient";
import {
  getAchieversRecentApplications,
  AchieversApplication,
} from "@/lib/helpers/admin/achieversAdmissionsHelper";
import { fetchCourseAdmissions } from "@/lib/helpers/admin/admissionsAdminAPI";
import { fetchGalleryImages, GalleryImageOutput } from "@/lib/helpers/galleryAPI";
import { fetchAdminAlumniReviews } from "@/lib/helpers/alumniReviewsAPI";
import { AdminHomeShimmer } from "@/app/admin/components/Shimmers";
import { useAdminLoading } from "@/app/admin/context/AdminLoadingContext";

interface ApplicationItem {
  id: string;
  initials: string;
  name: string;
  stream: string;
  date: string;
  time?: string;
  status: "Pending" | "In Progress" | "Completed";
}

interface GalleryItem {
  id: string;
  category: "Excellence" | "Student Life" | "Infrastructure" | string;
  date: string;
  imageUrl: string;
}

interface ReviewItem {
  id: string;
  initials: string;
  name: string;
  date: string;
  status: "Visible" | "Hidden";
  quote: string;
}

interface MonthlyBar {
  month: string;
  amount: number;
  heightPct: number;
}

const DEFAULT_APPLICATIONS: ApplicationItem[] = [
  {
    id: "app-1",
    initials: "SP",
    name: "Srinivas Pasupuleti",
    stream: "MPC",
    date: "28 Sep 2026",
    time: "10:24 AM",
    status: "Pending",
  },
  {
    id: "app-2",
    initials: "AV",
    name: "Ananya Varma",
    stream: "BiPC",
    date: "27 Sep 2026",
    time: "04:18 PM",
    status: "In Progress",
  },
  {
    id: "app-3",
    initials: "PK",
    name: "Pavan Kumar",
    stream: "MEC & CEC",
    date: "27 Sep 2026",
    time: "11:06 AM",
    status: "Pending",
  },
  {
    id: "app-4",
    initials: "SS",
    name: "Sahithi Sharma",
    stream: "MPC",
    date: "26 Sep 2026",
    time: "09:52 AM",
    status: "Completed",
  },
  {
    id: "app-5",
    initials: "RD",
    name: "Rohit Desai",
    stream: "BiPC",
    date: "25 Sep 2026",
    time: "03:30 PM",
    status: "In Progress",
  },
];

const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: "gal-1",
    category: "Excellence",
    date: "28 Sep 2026",
    imageUrl: "/excellence_grad_1787834448067.jpg",
  },
  {
    id: "gal-2",
    category: "Student Life",
    date: "27 Sep 2026",
    imageUrl: "/campus-life-1.png",
  },
  {
    id: "gal-3",
    category: "Infrastructure",
    date: "26 Sep 2026",
    imageUrl: "/infra_lab_1787834339700.jpg",
  },
  {
    id: "gal-4",
    category: "Excellence",
    date: "25 Sep 2026",
    imageUrl: "/infra_auditorium_1787834420299.jpg",
  },
  {
    id: "gal-5",
    category: "Excellence",
    date: "25 Sep 2026",
    imageUrl: "/infra_auditorium_1787834420299.jpg",
  },
  {
    id: "gal-6",
    category: "Infrastructure",
    date: "26 Sep 2026",
    imageUrl: "/infra_lab_1787834339700.jpg",
  },
  {
    id: "gal-7",
    category: "Student Life",
    date: "27 Sep 2026",
    imageUrl: "/campus-life-1.png",
  },
  {
    id: "gal-8",
    category: "Excellence",
    date: "28 Sep 2026",
    imageUrl: "/excellence_grad_1787834448067.jpg",
  },
];

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    initials: "RV",
    name: "Rohit Varma",
    date: "28 Sep 2026",
    status: "Visible",
    quote:
      "“The strong academic foundation at Achievers helped me excel in my entrance examinations”",
  },
  {
    id: "rev-2",
    initials: "SR",
    name: "Sneha Reddy",
    date: "26 Sep 2026",
    status: "Hidden",
    quote:
      "“Achievers gave me the confidence, mentorship, and personalized academic guidance needed.”",
  },
  {
    id: "rev-3",
    initials: "AK",
    name: "Aditya Kumar",
    date: "24 Sep 2026",
    status: "Visible",
    quote:
      "“The faculty guidance and state-of-the-art laboratory infrastructure played a pivotal role in my career.”",
  },
  {
    id: "rev-4",
    initials: "PN",
    name: "Pooja Nair",
    date: "22 Sep 2026",
    status: "Visible",
    quote:
      "“Wonderful learning environment with dedicated teachers always available to clear concepts and doubts.”",
  },
  {
    id: "rev-5",
    initials: "MK",
    name: "Manoj Krishna",
    date: "20 Sep 2026",
    status: "Visible",
    quote:
      "“Consistent mock tests and doubt-clearing sessions gave me the confidence needed for competitive exams.”",
  },
];

const DEFAULT_MONTHLY_PAYMENTS: MonthlyBar[] = [
  { month: "Jan", amount: 6000, heightPct: 12 },
  { month: "Feb", amount: 10000, heightPct: 20 },
  { month: "Mar", amount: 17000, heightPct: 34 },
  { month: "Apr", amount: 24000, heightPct: 48 },
  { month: "May", amount: 24000, heightPct: 48 },
  { month: "Jun", amount: 16000, heightPct: 32 },
  { month: "Jul", amount: 30000, heightPct: 60 },
  { month: "Aug", amount: 36000, heightPct: 72 },
  { month: "Sep", amount: 48000, heightPct: 96 },
];

export default function AdminHomePage() {
  const { isPageLoading } = useAdminLoading();
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    applications: "11",
    courses: "3",
    payments: "₹ 3,300",
    gallery: "23",
    reviews: "6",
    totalCollected: "₹ 3,300",
    successfulPayments: "6",
  });

  const [applications, setApplications] = useState<ApplicationItem[]>(DEFAULT_APPLICATIONS);
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>(DEFAULT_GALLERY);
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_REVIEWS);
  const [monthlyBars, setMonthlyBars] = useState<MonthlyBar[]>(DEFAULT_MONTHLY_PAYMENTS);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setIsLoading(true);

        // Run data fetching queries concurrently
        const [
          appUsersRes,
          recentAppsRes,
          courseAdmissionsRes,
          galleryImagesRes,
          reviewsRes,
          transactionsRes,
        ] = await Promise.allSettled([
          // 1. Applications Count
          supabase
            .from("users")
            .select("*", { count: "exact", head: true })
            .eq("is_deleted", false),

          // 2. Recent Applications
          getAchieversRecentApplications(5),

          // 3. Active Courses
          fetchCourseAdmissions(),

          // 4. Gallery Images
          fetchGalleryImages(),

          // 5. Alumni Reviews
          fetchAdminAlumniReviews({ sort: "newest" }),

          // 6. Transactions
          supabase
            .from("application_transactions")
            .select("*")
            .order("createdAt", { ascending: true }),
        ]);

        if (!isMounted) return;

        // --- Process Applications ---
        let appCount = "11";
        if (appUsersRes.status === "fulfilled" && appUsersRes.value.count !== null && appUsersRes.value.count !== undefined) {
          appCount = String(appUsersRes.value.count);
        }

        if (recentAppsRes.status === "fulfilled" && recentAppsRes.value.length > 0) {
          const mappedApps: ApplicationItem[] = recentAppsRes.value.map(
            (app: AchieversApplication) => {
              const nameParts = (app.name || "Student").trim().split(/\s+/);
              const initials =
                nameParts.length > 1
                  ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
                  : (nameParts[0]?.slice(0, 2) || "ST").toUpperCase();

              // Derive stream code
              let stream = "General";
              const cUpper = (app.course || "").toUpperCase();
              if (cUpper.includes("MPC") || cUpper.includes("MATH")) stream = "MPC";
              else if (cUpper.includes("BIPC") || cUpper.includes("BIOLOG")) stream = "BiPC";
              else if (cUpper.includes("CEC") || cUpper.includes("CIVIC")) stream = "CEC";
              else if (cUpper.includes("MEC") || cUpper.includes("ECONOM")) stream = "MEC & CEC";
              else if (app.course) stream = app.course.split("(")[0].trim().slice(0, 16);

              // Derive status
              let status: "Pending" | "In Progress" | "Completed" = "Pending";
              if (app.admission === "Selected" || app.payment === "Success") {
                status = "Completed";
              } else if (app.admission === "Verification") {
                status = "In Progress";
              } else {
                status = "Pending";
              }

              // Extract date and time separately
              let datePart = "28 Sep 2026";
              let timePart = "";

              if (app.submitted && app.submitted.includes(",")) {
                const parts = app.submitted.split(",");
                datePart = parts[0].trim();
                timePart = parts.slice(1).join(",").trim();
              } else if (app.rawDate) {
                const d = new Date(app.rawDate);
                datePart = d.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                timePart = d.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });
              } else if (app.submitted) {
                datePart = app.submitted;
              }

              return {
                id: String(app.id || app.applicationId),
                initials,
                name: app.name,
                stream,
                date: datePart,
                time: timePart,
                status,
              };
            }
          );
          setApplications(mappedApps);
        }

        // --- Process Active Courses ---
        let activeCoursesCount = "3";
        if (courseAdmissionsRes.status === "fulfilled") {
          const activeList = courseAdmissionsRes.value.filter((c) => !c.isHidden);
          activeCoursesCount = String(activeList.length || 3);
        }

        // --- Process Gallery Images ---
        let galleryCount = "22";
        if (galleryImagesRes.status === "fulfilled" && galleryImagesRes.value.length > 0) {
          const imagesList = galleryImagesRes.value;
          galleryCount = String(imagesList.length);

          const mappedGallery: GalleryItem[] = imagesList.slice(0, 5).map(
            (img: GalleryImageOutput) => ({
              id: img.gallery_image_id,
              category: img.category || "Excellence",
              date: img.createdAt
                ? new Date(img.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "28 Sep 2026",
              imageUrl: img.image_url,
            })
          );

          // If less than 5 images, fill remainder from defaults to preserve the full grid
          if (mappedGallery.length < 5) {
            const remainder = DEFAULT_GALLERY.slice(mappedGallery.length, 5);
            setGalleryImages([...mappedGallery, ...remainder]);
          } else {
            setGalleryImages(mappedGallery);
          }
        }

        // --- Process Reviews ---
        let reviewsCount = "5";
        if (reviewsRes.status === "fulfilled") {
          const res = reviewsRes.value;
          reviewsCount = String(res.stats?.total || res.reviews?.length || 5);

          if (res.reviews && res.reviews.length > 0) {
            const mappedReviews: ReviewItem[] = res.reviews.slice(0, 5).map((r, i) => {
              const nameParts = (r.full_name || "Alumni").trim().split(/\s+/);
              const initials =
                nameParts.length > 1
                  ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
                  : (nameParts[0]?.slice(0, 2) || "AL").toUpperCase();

              return {
                id: r.review_id || String(i),
                initials,
                name: r.full_name || "Alumni Student",
                date: r.createdAt
                  ? new Date(r.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Recent",
                status: r.isVisible !== false ? "Visible" : "Hidden",
                quote:
                  r.review_text?.length > 140
                    ? `“${r.review_text.slice(0, 140).trim()}...”`
                    : `“${r.review_text?.trim() || "Great academic experience at Achievers!"}”`,
              };
            });
            setReviews(mappedReviews);
          }
        }

        // --- Process Transactions & Payment Overview ---
        let totalCollectedStr = "₹ 3,300";
        let successfulPaymentsCount = "6";

        if (transactionsRes.status === "fulfilled" && transactionsRes.value.data) {
          const txList = transactionsRes.value.data;
          const successfulTx = txList.filter(
            (t: any) =>
              !t.status ||
              t.status.toLowerCase() === "success" ||
              t.status.toLowerCase() === "completed"
          );

          const totalAmount = successfulTx.reduce(
            (sum: number, t: any) => sum + Number(t.amount || 0),
            0
          );

          if (totalAmount > 0) {
            totalCollectedStr = `₹ ${totalAmount.toLocaleString("en-IN")}`;
            successfulPaymentsCount = String(successfulTx.length);
          }


          // Build dynamic monthly chart bars
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
          const monthlyMap: Record<string, number> = {};
          monthNames.forEach((m) => (monthlyMap[m] = 0));

          successfulTx.forEach((t: any) => {
            if (t.createdAt) {
              const d = new Date(t.createdAt);
              const mName = d.toLocaleString("en-US", { month: "short" });
              if (monthlyMap[mName] !== undefined) {
                monthlyMap[mName] += Number(t.amount || 0);
              }
            }
          });

          const maxMonthly = Math.max(...Object.values(monthlyMap));
          if (maxMonthly > 0) {
            const dynamicBars: MonthlyBar[] = monthNames.map((m) => {
              const amt = monthlyMap[m] || 0;
              const heightPct = amt > 0 ? Math.max(Math.round((amt / maxMonthly) * 94), 10) : 6;
              return { month: m, amount: amt, heightPct };
            });
            setMonthlyBars(dynamicBars);
          }
        }

        // Update top KPI stats state
        setStats({
          applications: appCount,
          courses: activeCoursesCount,
          payments: totalCollectedStr,
          gallery: galleryCount,
          reviews: reviewsCount,
          totalCollected: totalCollectedStr,
          successfulPayments: successfulPaymentsCount,
        });
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading || isPageLoading) {
    return <AdminHomeShimmer />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto select-none font-sans">
      {/* 1. TOP HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Welcome Back, Admin!
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Here&apos;s an overview of your college website activity and recent updates.
        </p>
      </div>

      {/* 2. 5 METRIC / KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Applications */}
        <div className="p-5 rounded-2xl bg-[#EEF5FF] border border-blue-100/80 shadow-xs flex flex-col justify-between min-h-[135px]">
          <div className="w-10 h-10 rounded-xl bg-white border border-blue-100/60 flex items-center justify-center text-blue-600 shadow-xs">
            <FileText size={20} weight="regular" />
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-none whitespace-nowrap">
              {stats.applications}
            </div>
            <p className="text-xs font-medium text-gray-500 mt-1.5 whitespace-nowrap">
              Total Applications
            </p>
          </div>
        </div>

        {/* Card 2: Active Courses */}
        <div className="p-5 rounded-2xl bg-[#ECFDF5] border border-emerald-100/80 shadow-xs flex flex-col justify-between min-h-[135px]">
          <div className="w-10 h-10 rounded-xl bg-white border border-emerald-100/60 flex items-center justify-center text-emerald-600 shadow-xs">
            <BookOpen size={20} weight="regular" />
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-none whitespace-nowrap">
              {stats.courses}
            </div>
            <p className="text-xs font-medium text-gray-500 mt-1.5 whitespace-nowrap">
              Active Courses
            </p>
          </div>
        </div>

        {/* Card 3: Total Payments */}
        <div className="p-5 rounded-2xl bg-[#FFF9EC] border border-amber-100/80 shadow-xs flex flex-col justify-between min-h-[135px]">
          <div className="w-10 h-10 rounded-xl bg-white border border-amber-100/60 flex items-center justify-center text-amber-600 shadow-xs">
            <CreditCard size={20} weight="regular" />
          </div>
          <div className="mt-4">
            <div className="text-xl sm:text-2xl lg:text-xl xl:text-2xl font-extrabold text-gray-900 tracking-tight leading-none whitespace-nowrap">
              {stats.payments}
            </div>
            <p className="text-xs font-medium text-gray-500 mt-1.5 whitespace-nowrap">
              Total Payments
            </p>
          </div>
        </div>

        {/* Card 4: Gallery Images */}
        <div className="p-5 rounded-2xl bg-[#F6EEFF] border border-purple-100/80 shadow-xs flex flex-col justify-between min-h-[135px]">
          <div className="w-10 h-10 rounded-xl bg-white border border-purple-100/60 flex items-center justify-center text-purple-600 shadow-xs">
            <ImageIcon size={20} weight="regular" />
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-none whitespace-nowrap">
              {stats.gallery}
            </div>
            <p className="text-xs font-medium text-gray-500 mt-1.5 whitespace-nowrap">
              Gallery Images
            </p>
          </div>
        </div>

        {/* Card 5: Reviews */}
        <div className="p-5 rounded-2xl bg-[#FEF1F2] border border-rose-100/80 shadow-xs flex flex-col justify-between min-h-[135px]">
          <div className="w-10 h-10 rounded-xl bg-white border border-rose-100/60 flex items-center justify-center text-rose-500 shadow-xs">
            <Star size={20} weight="regular" />
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-none whitespace-nowrap">
              {stats.reviews}
            </div>
            <p className="text-xs font-medium text-gray-500 mt-1.5 whitespace-nowrap">
              Reviews
            </p>
          </div>
        </div>
      </div>

      {/* 3. TWO COLUMN GRID - ROW 1: Applications & Payment Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Applications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="pb-4 border-b border-gray-100/80">
              <h2 className="text-base font-bold text-gray-900">Recent Applications</h2>
            </div>

            <div className="admin-card-scroll max-h-[340px] overflow-y-auto overflow-x-auto divide-y divide-gray-50 pr-1 mt-1">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="py-3 px-2 rounded-xl hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-3 sm:gap-4"
                >
                  {/* Left: Avatar + Only Student Name (No stream) */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/60">
                      {app.initials}
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-gray-900 whitespace-nowrap">
                      {app.name}
                    </span>
                  </div>

                  {/* Right: Date stacked over Time, and Status Badge */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end text-right">
                      <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                        {app.date}
                      </span>
                      {app.time && (
                        <span className="text-[11px] text-gray-400 font-normal whitespace-nowrap">
                          {app.time}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                        app.status === "Completed"
                          ? "bg-[#EDFAF3] text-[#16A34A] border border-emerald-100"
                          : app.status === "In Progress"
                          ? "bg-[#EDF5FF] text-[#1D63ED] border border-blue-100"
                          : "bg-[#FFF8EC] text-[#D97706] border border-amber-100"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Payment Overview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-gray-100/80">
              <h2 className="text-base font-bold text-gray-900">Payment Overview</h2>
            </div>

            {/* Monthly Bar Chart */}
            <div className="mt-6">
              <div className="relative h-48 flex items-end">
                {/* Y-Axis guide ticks */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-gray-400">
                  <div className="flex items-center w-full">
                    <span className="w-8 shrink-0">50K</span>
                    <div className="flex-1 border-b border-gray-100/70" />
                  </div>
                  <div className="flex items-center w-full">
                    <span className="w-8 shrink-0">40K</span>
                    <div className="flex-1 border-b border-gray-100/70" />
                  </div>
                  <div className="flex items-center w-full">
                    <span className="w-8 shrink-0">30K</span>
                    <div className="flex-1 border-b border-gray-100/70" />
                  </div>
                  <div className="flex items-center w-full">
                    <span className="w-8 shrink-0">20K</span>
                    <div className="flex-1 border-b border-gray-100/70" />
                  </div>
                  <div className="flex items-center w-full">
                    <span className="w-8 shrink-0">10K</span>
                    <div className="flex-1 border-b border-gray-100/70" />
                  </div>
                  <div className="flex items-center w-full">
                    <span className="w-8 shrink-0">0</span>
                    <div className="flex-1 border-b border-gray-200" />
                  </div>
                </div>

                {/* Bars */}
                <div className="w-full pl-9 pr-2 h-full flex items-end justify-between gap-2 sm:gap-4 z-10">
                  {monthlyBars.map((item, index) => (
                    <div
                      key={item.month}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative"
                      onMouseEnter={() => setHoveredBar(index)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Tooltip on hover */}
                      {hoveredBar === index && (
                        <div className="absolute -top-7 bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap z-20 pointer-events-none">
                          ₹ {item.amount.toLocaleString("en-IN")}
                        </div>
                      )}

                      {/* Bar Pillar */}
                      <div
                        className="w-full max-w-[28px] bg-[#0E1528] rounded-t-md hover:bg-[#1E293B] transition-all cursor-pointer"
                        style={{ height: `${item.heightPct}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Month X-Axis Labels */}
              <div className="pl-9 pr-2 flex justify-between gap-2 sm:gap-4 mt-2 text-[10px] text-gray-500 font-medium text-center">
                {monthlyBars.map((item) => (
                  <span key={item.month} className="flex-1 max-w-[28px]">
                    {item.month}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom 2 Summary Metric Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 mt-4 border-t border-gray-100/80">
            {/* Box 1: Total Collected */}
            <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl px-3.5 py-3 flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#0E1528] text-white flex items-center justify-center font-bold text-sm shrink-0">
                ₹
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-bold text-gray-900 whitespace-nowrap">
                  {stats.totalCollected}
                </span>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5 whitespace-nowrap truncate">
                  Total Collected
                </p>
              </div>
            </div>

            {/* Box 2: Successful Payments */}
            <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl px-3.5 py-3 flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#EDF5FF] text-[#1D63ED] flex items-center justify-center shrink-0">
                <CreditCard size={18} weight="regular" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-bold text-gray-900 whitespace-nowrap">
                  {stats.successfulPayments}
                </span>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5 whitespace-nowrap truncate">
                  Successful Payments
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TWO COLUMN GRID - ROW 2: Gallery Images & Recent Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Gallery Images */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
          <div className="pb-4 border-b border-gray-100/80">
            <h2 className="text-base font-bold text-gray-900">Recent Gallery Images</h2>
          </div>

          {/* 5 newly uploaded images inside scrollable box */}
          <div className="admin-card-scroll max-h-[340px] overflow-y-auto pr-1.5 mt-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {galleryImages.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shadow-xs">
                    <Image
                      src={item.imageUrl}
                      alt={item.category}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    {/* Category Pill Tag overlaid at bottom center */}
                    <div className="absolute bottom-2 inset-x-0 flex justify-center px-1.5 pointer-events-none">
                      <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-xs">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 font-medium text-center mt-2 whitespace-nowrap">
                    {item.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Recent Reviews */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 flex flex-col justify-between overflow-hidden">
          <div className="w-full">
            <div className="pb-4 border-b border-gray-100/80">
              <h2 className="text-base font-bold text-gray-900">Recent Reviews</h2>
            </div>

            {/* 5 Review Cards with scroll */}
            <div className="admin-card-scroll max-h-[340px] overflow-y-auto overflow-x-hidden space-y-3.5 pr-1.5 mt-5">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-[#F8FAFC] border border-slate-100/90 rounded-2xl p-4 sm:p-5 w-full max-w-full overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {rev.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4
                          className="text-xs sm:text-sm font-bold text-gray-900 leading-tight truncate max-w-[150px] sm:max-w-[220px]"
                          title={rev.name}
                        >
                          {rev.name}
                        </h4>
                        <p className="text-[11px] text-gray-400 font-medium leading-tight mt-1">
                          {rev.date}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                        rev.status === "Visible"
                          ? "bg-[#EDFAF3] text-[#16A34A] border border-emerald-100"
                          : "bg-[#FEF1F2] text-[#E11D48] border border-rose-100"
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 font-normal leading-relaxed mt-3 break-words [overflow-wrap:anywhere] [word-break:break-word] line-clamp-3">
                    {rev.quote}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

