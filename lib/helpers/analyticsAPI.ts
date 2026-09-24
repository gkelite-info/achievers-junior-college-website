import { pool } from "@/lib/db";

export type AnalyticsEvent = {
  visitorId: string;
  eventType: string; // e.g., 'page_view', 'form_start', 'form_submit', 'payment_success'
  formType?: string;
  applicationId?: number;
  path: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  college?: string;
};

export async function logAnalyticsEvent(event: AnalyticsEvent) {
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
  } catch (error) {
    console.error("Failed to log analytics event:", error);
    // Silent fail for analytics so we don't break main app flows
    return null;
  }
}

/**
 * Helper to fetch aggregated KPI counts directly from the analytics log table:
 * - total unique website visitors
 * - total unique visitors who opened an admission form
 * - total form submissions
 */
export async function getAnalyticsKpiCounts(college?: string) {
  try {
    const collegeFilter = college ? `AND college = $1` : ``;
    const params = college ? [college] : [];

    const query = `
      SELECT 
        COUNT(DISTINCT "visitorId") FILTER (WHERE "eventType" IN ('page_view', 'visitor')) as "uniqueVisitors",
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
    return {
      uniqueVisitors: 0,
      admissionsOpened: 0,
      formsSubmitted: 0,
    };
  }
}

/**
 * Helper to fetch raw recent analytics logs
 */
export async function getRecentAnalyticsLogs(limit = 100, college?: string) {
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
    return [];
  }
}

