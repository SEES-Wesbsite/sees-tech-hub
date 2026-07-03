import { NextRequest, NextResponse } from "next/server";

const ENABLE_PRELAUNCH = true;

const ALLOWED_PATHS = ["/", "/countdown"];

export function handlePrelaunch(request: NextRequest) {
  if (!ENABLE_PRELAUNCH) return null;

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return null;
  }

  if (ALLOWED_PATHS.includes(pathname)) {
    return null;
  }

  return NextResponse.rewrite(new URL("/countdown", request.url));
}
