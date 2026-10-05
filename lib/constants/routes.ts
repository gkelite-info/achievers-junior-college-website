export const ROLES = {
  ADMIN: "Admin",
  SUPER_ADMIN: "Super-Admin",
  STAFF: "Staff",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const matchesRouteSegment = (pathname: string, route: string): boolean => {
  if (route === "/") {
    return pathname === "/";
  }
  return pathname === route || pathname.startsWith(route + "/");
};

/**
 * Public routes: Accessible without an active session.
 */
export const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/services",
  "/gallery",
  "/alumni",
  "/payments",
  "/contact",
  "/apply",
  "/registration",
  "/login",
  "/forgot-password",
  "/privacy-policy",
  "/terms",
];

/**
 * Auth-only routes: Accessible only when NOT authenticated.
 * If an authenticated user visits here, they are redirected to their dashboard.
 */
export const AUTH_ONLY_ROUTES = [
  "/login",
  "/forgot-password",
];

/**
 * Dedicated portal routes locked to users with authorized roles.
 */
export const ROLE_PROTECTED_PORTALS = [
  "/admin",
];

/**
 * Generic protected routes accessible by authenticated users.
 */
export const PROTECTED_ROUTES = [
  "/admin",
  "/profile",
  "/settings",
];

/**
 * Routes that bypass edge middleware authentication checks entirely.
 */
export const EXEMPTED_ROUTES = [
  "/construction",
  "/api",
  "/_next",
];

/**
 * Shared authenticated routes that dynamically resolve according to role (e.g. /profile -> /admin/profile).
 */
export const AUTH_PROTECTED_ROUTES = [
  "/profile",
  "/settings",
];

export const normalizeRole = (role: string | null | undefined): UserRole | null => {
  if (!role) return null;
  const cleaned = role.toLowerCase().trim();

  const roleMap: Record<string, UserRole> = {
    admin: ROLES.ADMIN,
    administrator: ROLES.ADMIN,
    "super-admin": ROLES.SUPER_ADMIN,
    superadmin: ROLES.SUPER_ADMIN,
    staff: ROLES.STAFF,
  };

  return roleMap[cleaned] || null;
};

export const isValidRole = (role: unknown): role is UserRole => {
  return typeof role === "string" && Object.values(ROLES).includes(role as UserRole);
};

export const getLandingPageForRole = (role: UserRole | string | null | undefined): string => {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case ROLES.SUPER_ADMIN:
    case ROLES.ADMIN:
      return "/admin/home";
    default:
      return "/admin/home";
  }
};

export const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some((route) => matchesRouteSegment(pathname, route));
};

export const isAuthOnlyRoute = (pathname: string): boolean => {
  return AUTH_ONLY_ROUTES.some((route) => matchesRouteSegment(pathname, route));
};

export const isProtectedRoute = (pathname: string): boolean => {
  return PROTECTED_ROUTES.some((route) => matchesRouteSegment(pathname, route));
};

export const isAuthProtectedRoute = (pathname: string): boolean => {
  return AUTH_PROTECTED_ROUTES.some((route) => matchesRouteSegment(pathname, route));
};

export const needsRolePortalProtection = (pathname: string): boolean => {
  const isPortal = ROLE_PROTECTED_PORTALS.some((portal) => matchesRouteSegment(pathname, portal));
  return isPortal || (!isPublicRoute(pathname) && !isAuthProtectedRoute(pathname) && !isExemptedRoute(pathname));
};

export const isExemptedRoute = (pathname: string): boolean => {
  return EXEMPTED_ROUTES.some((route) => matchesRouteSegment(pathname, route));
};
