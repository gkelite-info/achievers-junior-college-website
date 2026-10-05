import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import {
  isAuthOnlyRoute,
  isExemptedRoute,
  isProtectedRoute,
  isAuthProtectedRoute,
  needsRolePortalProtection,
  getLandingPageForRole,
  normalizeRole,
  isPublicRoute,
  ROLES,
} from "@/lib/constants/routes";

function applyNoStoreHeaders(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("Surrogate-Control", "no-store");
  return response;
}

function redirectNoStore(request: NextRequest, pathname: string, search?: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = search ?? "";
  return applyNoStoreHeaders(NextResponse.redirect(url));
}

type AuthUserProfile = {
  authUserId: string;
  role: string | null;
  isActive: boolean;
  email: string | null;
};

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // 1. Check if route is exempted from edge middleware
  if (isExemptedRoute(pathname)) {
    return response;
  }

  // Dev mode test bypass (cookie or header):
  if (process.env.NODE_ENV !== "production" && (request.cookies.get("dev_admin_bypass")?.value === "true" || request.headers.get("x-dev-bypass") === "true")) {
    return response;
  }

  // 2. Subdomain / Tenant extraction (if tenant isolation is used)
  const host = request.headers.get("host") || "";
  const cleanHost = host.replace(/:\d+$/, "");
  const hostParts = cleanHost.split(".");
  let tenantSubdomain = "ACHIEVERS";
  if (hostParts.length > 2 && hostParts[0] !== "www") {
    tenantSubdomain = hostParts[0].toUpperCase();
  }
  response.headers.set("x-tenant-subdomain", tenantSubdomain);

  // 3. Initialize Supabase SSR Client for Next.js Edge Middleware
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mzbctopjpftwnkqpuqhf.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16YmN0b3BqcGZ0d25rcXB1cWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MTY5MTksImV4cCI6MjEwNTI5MjkxOX0.QQTMMDiztcU-O3ruU0Tjc9163PRVwLvThOGJixE2kWg";

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // 4. Authenticate User Session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 5. Unauthenticated User Handling
  if (!user) {
    if (isPublicRoute(pathname)) {
      return response;
    }

    // Attempted to access protected area while unauthenticated -> Redirect to /login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?from=${encodeURIComponent(pathname)}`;
    return applyNoStoreHeaders(NextResponse.redirect(url));
  }

  // 6. Authenticated User Handling
  // Auth-only route bounce: redirect logged-in user away from /login or /forgot-password
  if (isAuthOnlyRoute(pathname)) {
    const landingPage = getLandingPageForRole("Admin");
    return redirectNoStore(request, landingPage);
  }

  // 7. Fetch user profile from database to verify active status and role
  const { data: profileData, error: profileError } = await supabase
    .from("auth_users")
    .select("authUserId, role, isActive, email")
    .eq("authUserId", user.id)
    .maybeSingle();

  const profile = profileData as AuthUserProfile | null;

  // If user profile is not found or inactive, reject access
  if (!profile || profileError) {
    // If accessing public route, allow, otherwise redirect to login with error
    if (isPublicRoute(pathname)) {
      return response;
    }
    return redirectNoStore(request, "/login", "?error=profile_not_found");
  }

  if (profile.isActive === false) {
    return redirectNoStore(request, "/construction", "?error=account_inactive");
  }

  const normalizedRole = normalizeRole(profile.role);

  // 8. Shared Auth-Protected Routes (/profile, /settings)
  if (isAuthProtectedRoute(pathname)) {
    if (pathname === "/profile" || pathname.startsWith("/profile/")) {
      return redirectNoStore(request, "/admin/profile");
    }
    if (pathname === "/settings" || pathname.startsWith("/settings/")) {
      return redirectNoStore(request, "/admin/profile");
    }
  }

  // 9. Role-Protected Portals (/admin)
  if (needsRolePortalProtection(pathname)) {
    // Check if user has permission to access admin portal
    const hasAdminAccess =
      normalizedRole === ROLES.ADMIN || normalizedRole === ROLES.SUPER_ADMIN;

    if (!hasAdminAccess) {
      // Role mismatch -> bounce to public home
      return redirectNoStore(request, "/");
    }

    // If accessing root /admin directly, redirect to primary dashboard (/admin/home)
    if (pathname === "/admin" || pathname === "/admin/") {
      return redirectNoStore(request, "/admin/home");
    }

    // Allow access with no-store headers for security
    return applyNoStoreHeaders(response);
  }

  if (isProtectedRoute(pathname)) {
    return applyNoStoreHeaders(response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$).*)",
  ],
};
