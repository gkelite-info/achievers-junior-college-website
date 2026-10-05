import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const redirectPath = searchParams.get("redirect") || "/admin/reviews";

  const response = NextResponse.redirect(new URL(redirectPath, request.url));
  response.cookies.set("dev_admin_bypass", "true", { path: "/" });
  return response;
}
