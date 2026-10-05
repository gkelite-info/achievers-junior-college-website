"use client";

import React, { useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import {
  isAuthOnlyRoute,
  getLandingPageForRole,
  ROLES,
  normalizeRole,
} from "@/lib/constants/routes";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAuthenticated, logout } = useUser();

  const isAdminRoute = pathname?.startsWith("/admin");
  const isAuthOnly = isAuthOnlyRoute(pathname || "");
  const isConstruction = pathname?.startsWith("/construction");

  // Client lifecycle validation (focus, pageshow, visibilitychange)
  const validateClientSession = useCallback(async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        // If session is missing or expired while on a protected admin route
        if (isAdminRoute) {
          await logout();
          return;
        }
      } else {
        // Active session detected
        if (isAuthOnly) {
          // If on /login or /forgot-password, redirect to role landing page
          router.replace(getLandingPageForRole(ROLES.ADMIN));
        }
      }
    } catch (err) {
      console.error("Client session validation error:", err);
    }
  }, [isAdminRoute, isAuthOnly, logout, router]);

  // Hook into browser lifecycle events for secondary defense
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        validateClientSession();
      }
    };

    const handleFocus = () => {
      validateClientSession();
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      // If page is restored from bfcache (Back/Forward Cache)
      if (e.persisted) {
        validateClientSession();
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [validateClientSession]);

  // Dynamic body padding control: Remove top 68px padding for admin / auth screens
  useEffect(() => {
    const shouldRemovePadding = isAdminRoute || isAuthOnly;
    if (shouldRemovePadding) {
      document.body.style.paddingTop = "0px";
    } else {
      document.body.style.paddingTop = "68px";
    }
  }, [isAdminRoute, isAuthOnly]);

  // In-page client guard for protected admin routes
  useEffect(() => {
    if (loading) return;

    if (isAdminRoute) {
      if (!isAuthenticated || !user) {
        router.replace(`/login?from=${encodeURIComponent(pathname)}`);
        return;
      }

      const role = normalizeRole(user.role);
      if (role !== ROLES.ADMIN && role !== ROLES.SUPER_ADMIN) {
        router.replace("/");
        return;
      }
    }
  }, [loading, isAdminRoute, isAuthenticated, user, pathname, router]);

  const showPublicNavbarAndFooter = !isAdminRoute && !isAuthOnly && !isConstruction;

  return (
    <>
      {showPublicNavbarAndFooter && <Navbar />}
      <main className="flex-grow min-h-0">{children}</main>
      {showPublicNavbarAndFooter && <Footer />}
    </>
  );
}
