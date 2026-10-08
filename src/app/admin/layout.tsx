"use client";

import React, { useEffect, useState, useRef, Fragment } from "react";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  House,
  FileText,
  Image as ImageIcon,
  CreditCard,
  ChatCircleText,
  User,
  SignOut,
  CaretDown,
  MagnifyingGlass,
  List,
  X,
  IdentificationCard,
  BookOpen,
  Star,
  Bell,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { fetchAdminAlumniReviews } from "@/lib/helpers/alumniReviewsAPI";
import { NavbarActionsShimmer } from "@/app/admin/components/Shimmers";
import { AdminLoadingProvider, useAdminLoading } from "./context/AdminLoadingContext";
import { useUser } from "@/context/UserContext";

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLoadingProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminLoadingProvider>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isPageLoading } = useAdminLoading();
  const { user: adminProfile, loading: isUserLoading, logout } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [appCount, setAppCount] = useState<number | string>("42");
  const [reviewCount, setReviewCount] = useState<number | string>(5);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isNavbarLoading, setIsNavbarLoading] = useState(true);

  const isProfileShimmering = isUserLoading || isPageLoading || isNavbarLoading;

  // Keep the navbar skeleton visible long enough to be perceived even when
  // the cached profile and page data resolve immediately.
  useEffect(() => {
    const showTimer = window.setTimeout(() => setIsNavbarLoading(true), 0);
    const hideTimer = window.setTimeout(() => setIsNavbarLoading(false), 700);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    // Fetch live counts for applications and reviews
    async function fetchCounts() {
      try {
        const { count } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("is_deleted", false);
        if (typeof count === "number") {
          setAppCount(count);
        }
      } catch {
        // fallback to default
      }

      try {
        const result = await fetchAdminAlumniReviews();
        if (result?.stats?.total !== undefined) {
          setReviewCount(result.stats.total);
        }
      } catch {
        try {
          const { count } = await supabase
            .from("alumni_reviews")
            .select("*", { count: "exact", head: true })
            .eq("is_deleted", false);
          if (typeof count === "number") {
            setReviewCount(count);
          }
        } catch {
          // fallback
        }
      }
    }
    fetchCounts();
  }, [pathname]);

  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/admin/home", icon: House },
    { name: "Applications", href: "/admin/applications", icon: FileText, badge: appCount },
    { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Reviews", href: "/admin/reviews", icon: ChatCircleText, badge: reviewCount },
  ];

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const executeLogout = async () => {
    setLogoutModalOpen(false);
    await logout();
  };

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    setLogoutModalOpen(true);
  };

  const isCurrentActive = (href: string) => {
    if (href === "/admin/home") {
      return pathname === "/admin/home" || pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-[265px] bg-[#0E1528] text-white shrink-0 z-30 select-none border-r border-slate-800/80">
        {/* Brand Header */}
        <div className="flex items-center gap-3.5 px-6 pt-7 pb-6">
          {/* Circular Emblem with Amber Glow */}
          <div className="relative w-12 h-12 rounded-full border-2 border-[#FFA401] shadow-[0_0_16px_rgba(255,164,1,0.5)] bg-[#0A1020] flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/college_logo.jpeg" alt="Achievers Logo" className="w-full h-full object-cover" />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-bold text-white text-[15px] tracking-wide leading-tight">
              ACHIEVERS
            </span>
            <span className="text-[#FFA401] font-semibold text-xs tracking-wider uppercase leading-tight mt-1">
              JUNIOR COLLEGE
            </span>
          </div>
        </div>

        {/* Subtle Divider Line */}
        <div className="mx-6 border-b border-slate-800/80 mb-5" />

        {/* Section Header: MAIN NAVIGATION */}
        <div className="px-6 mb-2">
          <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            MAIN NAVIGATION
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isCurrentActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm transition-all group ${
                  active
                    ? "bg-[#252233] text-white shadow-md font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {/* Active Left Amber Indicator Bar */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#FFA401] rounded-r-full" />
                )}
                <Icon
                  size={20}
                  weight={active ? "fill" : "regular"}
                  className={`transition-colors shrink-0 ${
                    active ? "text-[#FFA401]" : "text-slate-400 group-hover:text-white"
                  }`}
                />
                <span className="truncate">{item.name}</span>

                {/* Badge if present */}
                {item.badge !== undefined && (
                  <span
                    className={`ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors ${
                      active
                        ? "bg-[#3D2C1E] text-[#FFA401] border border-[#FFA401]/30 font-bold"
                        : "bg-slate-800/90 text-slate-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Section Header: ACCOUNT MANAGEMENT */}
          <div className="px-2 pt-4 pb-1">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              ACCOUNT MANAGEMENT
            </p>
          </div>

          <Link
            href="/admin/profile"
            className={`relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm transition-all group ${
              pathname.startsWith("/admin/profile")
                ? "bg-[#252233] text-white shadow-md font-semibold"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {pathname.startsWith("/admin/profile") && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#FFA401] rounded-r-full" />
            )}
            <User
              size={20}
              weight={pathname.startsWith("/admin/profile") ? "fill" : "regular"}
              className={`transition-colors shrink-0 ${
                pathname.startsWith("/admin/profile") ? "text-[#FFA401]" : "text-slate-400 group-hover:text-white"
              }`}
            />
            <span>Admin Settings</span>
          </Link>
        </nav>

        {/* Bottom Section: Logout */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 w-full px-4 py-3 text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
          >
            <SignOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR MODAL */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative flex flex-col w-[265px] bg-[#0E1528] text-white z-10 shadow-2xl h-full">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full border border-[#FFA401] shadow-[0_0_10px_rgba(255,164,1,0.4)] bg-[#0A1020] flex items-center justify-center shrink-0 overflow-hidden">
                  <img src="/college_logo.jpeg" alt="Achievers Logo" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-white">ACHIEVERS</span>
                  <span className="text-[10px] text-[#FFA401] uppercase font-semibold">JUNIOR COLLEGE</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Section Header: MAIN NAVIGATION */}
            <div className="px-6 pt-4 pb-1">
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                MAIN NAVIGATION
              </p>
            </div>

            <nav className="flex-1 py-1 space-y-1.5 px-3 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isCurrentActive(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm transition-all group ${
                      active
                        ? "bg-[#252233] text-white shadow-md font-semibold"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#FFA401] rounded-r-full" />
                    )}
                    <Icon size={20} weight={active ? "fill" : "regular"} className={active ? "text-[#FFA401]" : "text-slate-400"} />
                    <span className="truncate">{item.name}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          active
                            ? "bg-[#3D2C1E] text-[#FFA401] border border-[#FFA401]/30 font-bold"
                            : "bg-slate-800/90 text-slate-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Section Header: ACCOUNT MANAGEMENT */}
              <div className="px-2 pt-4 pb-1">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  ACCOUNT MANAGEMENT
                </p>
              </div>

              <Link
                href="/admin/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm transition-all ${
                  pathname.startsWith("/admin/profile")
                    ? "bg-[#252233] text-white shadow-md font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {pathname.startsWith("/admin/profile") && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#FFA401] rounded-r-full" />
                )}
                <User
                  size={20}
                  weight={pathname.startsWith("/admin/profile") ? "fill" : "regular"}
                  className={pathname.startsWith("/admin/profile") ? "text-[#FFA401]" : "text-slate-400"}
                />
                <span>Admin Settings</span>
              </Link>
            </nav>

            <div className="p-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3.5 w-full px-4 py-3 text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
              >
                <SignOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP NAVBAR (Header) */}
        <header className="h-16 bg-white border-b border-gray-200/80 px-4 sm:px-8 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-800 md:hidden rounded-lg hover:bg-gray-100"
              aria-label="Open navigation menu"
            >
              <List size={22} />
            </button>
          </div>

          {/* Right Header Profile */}
          {isProfileShimmering ? (
            <NavbarActionsShimmer />
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1 sm:pl-1.5 sm:pr-2.5 py-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer select-none"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-[#0E1528] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {adminProfile?.firstName?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-gray-900 leading-tight">
                      {adminProfile ? `${adminProfile.firstName || ""} ${adminProfile.lastName || ""}`.trim() || "Admin" : "Admin"}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">
                      Administrator
                    </span>
                  </div>
                  <CaretDown
                    size={13}
                    className={`text-gray-400 transition-transform ${
                      profileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-gray-100 overflow-hidden">
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {adminProfile ? `${adminProfile.firstName || ""} ${adminProfile.lastName || ""}`.trim() || "Admin" : "Admin"}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">{adminProfile?.email || "admin@achievers.in"}</p>
                    </div>
                    <Link
                      href="/admin/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <User size={16} /> My Profile
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <SignOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        {/* MAIN SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      <Transition appear show={logoutModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[10000]" onClose={() => setLogoutModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                      <SignOut size={20} className="text-rose-600" />
                    </div>
                    <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 leading-6">
                      Confirm Logout
                    </Dialog.Title>
                  </div>
                  
                  <div className="mt-2 pl-14">
                    <p className="text-sm text-gray-500 font-medium">
                      Are you sure you want to logout? You will need to login again to access the admin panel.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex justify-center items-center rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
                      onClick={() => setLogoutModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center items-center rounded-xl border border-transparent bg-rose-600 px-5 py-2 text-sm font-bold text-white hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 transition-colors shadow-sm shadow-rose-200"
                      onClick={executeLogout}
                    >
                      Yes, Logout
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
