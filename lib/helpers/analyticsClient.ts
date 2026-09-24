"use client";

/**
 * Helper function to retrieve or generate a persistent visitor ID for the browser.
 */
export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  let visitorId = localStorage.getItem("visitorId");
  if (!visitorId) {
    try {
      visitorId = crypto.randomUUID();
    } catch {
      visitorId = "v-" + Math.random().toString(36).substring(2, 15) + "-" + Date.now().toString(36);
    }
    localStorage.setItem("visitorId", visitorId);
  }
  return visitorId;
}

/**
 * Dispatches an analytics event from client components to /api/analytics
 */
export async function trackClientEvent(
  eventType: "page_view" | "admission_open" | "form_submit" | string,
  details: {
    formType?: string;
    applicationId?: number;
    path?: string;
    metadata?: Record<string, any>;
    college?: string;
  } = {}
) {
  try {
    if (typeof window === "undefined") return;
    const visitorId = getOrCreateVisitorId();
    const currentPath = details.path || (window.location.pathname + window.location.search);

    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId,
        eventType,
        formType: details.formType,
        applicationId: details.applicationId,
        path: currentPath,
        metadata: details.metadata || { referrer: document.referrer },
        college: details.college || "Achievers Junior College",
      }),
    });
  } catch (err) {
    // Fail silently so user interactions are never blocked
    console.debug("Analytics event dispatch ignored:", err);
  }
}
