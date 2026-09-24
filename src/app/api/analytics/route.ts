import { NextRequest, NextResponse } from "next/server";
import { logAnalyticsEvent, getAnalyticsKpiCounts, getRecentAnalyticsLogs } from "@/lib/helpers/analyticsAPI";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const college = searchParams.get("college") || undefined;

    if (type === "kpi") {
      const counts = await getAnalyticsKpiCounts(college);
      return NextResponse.json(counts);
    }

    const limit = Number(searchParams.get("limit") || 100);
    const logs = await getRecentAnalyticsLogs(limit, college);
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error in analytics GET API:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Extract IP and user agent
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : (req.headers.get("x-real-ip") || "unknown");
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Validate required fields
    if (!body.visitorId || !body.eventType || !body.path) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }


    const event = {
      visitorId: body.visitorId,
      eventType: body.eventType,
      formType: body.formType,
      applicationId: body.applicationId,
      path: body.path,
      ipAddress,
      userAgent,
      metadata: body.metadata,
      college: body.college || "Achievers Junior College",
    };

    await logAnalyticsEvent(event);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in analytics API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

