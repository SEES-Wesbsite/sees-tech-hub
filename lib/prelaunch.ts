import { NextRequest, NextResponse } from "next/server";

const ENABLE_PRELAUNCH = true;

const ALLOWED_PATHS = ["/", "/countdown"];

export function handlePrelaunch(request: NextRequest) {
  if (!ENABLE_PRELAUNCH) return null;

  const { pathname } = request.nextUrl;

  // Never rewrite Next.js internals or API routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return null;
  }

  // Never rewrite requests for assets or metadata
  const accept = request.headers.get("accept") ?? "";
  if (!accept.includes("text/html")) {
    return null;
  }

  // Allow public pages
  if (ALLOWED_PATHS.includes(pathname)) {
    return null;
  }

  // Rewrite every other page to the countdown
  return NextResponse.rewrite(new URL("/countdown", request.url));
}
