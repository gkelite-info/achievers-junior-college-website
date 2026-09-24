"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackClientEvent } from "@/lib/helpers/analyticsClient";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const searchString = searchParams?.toString();
    const fullPath = searchString ? `${pathname}?${searchString}` : pathname;

    // Avoid double firing for the exact same path
    if (lastTracked.current === fullPath) return;
    lastTracked.current = fullPath;

    // Track general page view
    trackClientEvent("page_view", {
      path: fullPath,
      metadata: { referrer: document.referrer }
    });

    // If visiting the application page directly, also record admission_open
    if (pathname === "/apply") {
      trackClientEvent("admission_open", {
        path: fullPath,
        formType: searchParams?.get("course") || "General Application"
      });
    }
  }, [pathname, searchParams]);

  return null;
}
