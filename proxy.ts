import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const protectedPathPrefixes = [
  "/dashboard",
  "/projects",
  "/daily-updates",
  "/design",
  "/materials",
  "/sales",
  "/content",
  "/ai-summary",
  "/media",
  "/users",
  "/settings",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPath = protectedPathPrefixes.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/daily-updates/:path*",
    "/design/:path*",
    "/materials/:path*",
    "/sales/:path*",
    "/content/:path*",
    "/ai-summary/:path*",
    "/media/:path*",
    "/users/:path*",
    "/settings/:path*",
  ],
};
