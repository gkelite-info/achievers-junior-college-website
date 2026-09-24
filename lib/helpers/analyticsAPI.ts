import { pool } from "@/lib/db";
import { supabase } from "@/lib/supabaseClient";

export type AnalyticsEvent = {
  visitorId: string;
  eventType: string; // e.g., 'page_view', 'form_start', 'form_submit', 'payment_success'
  formType?: string;
  applicationId?: number;
  path: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  college?: string;
};

export async function logAnalyticsEvent(event: AnalyticsEvent) {
  const now = new Date().toISOString();

  // 1. Try Supabase REST Client (HTTPS) first - works in serverless, Vercel, and across all networks
  try {
    const { data, error } = await supabase.from("application_analytics_logs").insert({
      visitorId: event.visitorId,
      eventType: event.eventType,
      formType: event.formType || null,
      applicationId: event.applicationId || null,
      path: event.path,
      ipAddress: event.ipAddress || null,
      userAgent: event.userAgent || null,
      metadata: event.metadata || null,
      college: event.college || "Achievers Junior College",
      createdAt: now,
      updatedAt: now,
    }).select("logId").single();

    if (!error && data) {
      return data;
    }
    if (error) {
      console.warn("Supabase analytics insert notice:", error.message);
    }
  } catch (supabaseErr) {
    console.warn("Supabase client analytics logging error:", supabaseErr);
  }

  // 2. Fallback to direct pg.Pool if configured
  if (process.env.DBHOSTNAME && process.env.DBPASSWORD) {
    try {
      const query = `
        INSERT INTO public.application_analytics_logs (
          "visitorId", "eventType", "formType", "applicationId", 
          "path", "ipAddress", "userAgent", "metadata", "college", 
          "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
        ) RETURNING "logId";
      `;
      const values = [
        event.visitorId,
        event.eventType,
        event.formType || null,
        event.applicationId || null,
        event.path,
        event.ipAddress || null,
        event.userAgent || null,
        event.metadata ? JSON.stringify(event.metadata) : null,
        event.college || null
      ];
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (process.env.NODE_ENV === 'production' || process.env.DEBUG_ANALYTICS) {
        console.error("Failed to log analytics event via pg.Pool:", msg);
      }
      return null;
    }
  }

  return null;
}

/**
 * Helper to fetch aggregated KPI counts directly from the analytics log table:
 * - total unique website visitors
 * - total unique visitors who opened an admission form
 * - total form submissions
 */
export async function getAnalyticsKpiCounts(college?: string) {
  // 1. Try Supabase Client first
  try {
    let q = supabase.from("application_analytics_logs").select("visitorId, eventType").eq("is_deleted", false);
    if (college) q = q.eq("college", college);
    const { data, error } = await q;
    if (!error && data) {
      const uniqueVisitors = new Set(data.filter((r) => ["page_view", "visitor", "site_visit"].includes(r.eventType?.toLowerCase())).map((r) => r.visitorId)).size;
      const admissionsOpened = new Set(data.filter((r) => ["admission_open", "form_open"].includes(r.eventType?.toLowerCase())).map((r) => r.visitorId)).size;
      const formsSubmitted = data.filter((r) => ["form_submit", "submission"].includes(r.eventType?.toLowerCase())).length;
      return { uniqueVisitors, admissionsOpened, formsSubmitted };
    }
  } catch (err) {
    console.warn("Supabase KPI fetch error:", err);
  }

  // 2. Fallback to pg.Pool
  if (process.env.DBHOSTNAME && process.env.DBPASSWORD) {
    try {
      const collegeFilter = college ? `AND college = $1` : ``;
      const params = college ? [college] : [];

      const query = `
        SELECT 
          COUNT(DISTINCT "visitorId") FILTER (WHERE "eventType" IN ('page_view', 'visitor', 'site_visit')) as "uniqueVisitors",
          COUNT(DISTINCT "visitorId") FILTER (WHERE "eventType" IN ('admission_open', 'form_open')) as "admissionsOpened",
          COUNT(*) FILTER (WHERE "eventType" IN ('form_submit', 'submission')) as "formsSubmitted"
        FROM public.application_analytics_logs
        WHERE is_deleted = false ${collegeFilter};
      `;

      const res = await pool.query(query, params);
      const row = res.rows[0] || {};

      return {
        uniqueVisitors: Number(row.uniqueVisitors || 0),
        admissionsOpened: Number(row.admissionsOpened || 0),
        formsSubmitted: Number(row.formsSubmitted || 0),
      };
    } catch (error) {
      console.error("Failed to fetch analytics KPI counts:", error);
    }
  }

  return {
    uniqueVisitors: 0,
    admissionsOpened: 0,
    formsSubmitted: 0,
  };
}

/**
 * Helper to fetch raw recent analytics logs
 */
export async function getRecentAnalyticsLogs(limit = 100, college?: string) {
  // 1. Try Supabase Client first
  try {
    let q = supabase.from("application_analytics_logs").select("*").eq("is_deleted", false).order("createdAt", { ascending: false }).limit(limit);
    if (college) q = q.eq("college", college);
    const { data, error } = await q;
    if (!error && data) return data;
  } catch (err) {
    console.warn("Supabase recent logs fetch error:", err);
  }

  // 2. Fallback to pg.Pool
  if (process.env.DBHOSTNAME && process.env.DBPASSWORD) {
    try {
      const collegeFilter = college ? `AND college = $2` : ``;
      const params = college ? [limit, college] : [limit];

      const query = `
        SELECT *
        FROM public.application_analytics_logs
        WHERE is_deleted = false ${collegeFilter}
        ORDER BY "createdAt" DESC
        LIMIT $1;
      `;

      const res = await pool.query(query, params);
      return res.rows;
    } catch (error) {
      console.error("Failed to fetch recent analytics logs:", error);
    }
  }

  return [];
}
