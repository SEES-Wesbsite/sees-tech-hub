import { NextRequest, NextResponse } from "next/server";

const ENABLE_PRELAUNCH = false;

const ALLOWED_PATHS = ["/", "/countdown"];

export function handlePrelaunch(request: NextRequest) {
  if (!ENABLE_PRELAUNCH) return null;

  const { pathname } = request.nextUrl;

  // Ignore Next.js internals
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return null;
  }

  // Ignore metadata routes
  if (
    pathname.startsWith("/icon") ||
    pathname.startsWith("/apple-icon") ||
    pathname.startsWith("/opengraph-image") ||
    pathname.startsWith("/twitter-image") ||
    pathname.startsWith("/manifest") ||
    pathname === "/favicon.ico"
  ) {
    return null;
  }

  // Ignore static files
  if (/\.[^/]+$/.test(pathname)) {
    return null;
  }

  // Allow public pages
  if (ALLOWED_PATHS.includes(pathname)) {
    return null;
  }

  // Redirect everything else
  return NextResponse.rewrite(new URL("/countdown", request.url));
}
