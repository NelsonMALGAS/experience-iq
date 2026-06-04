import { NextRequest, NextResponse } from "next/server";

export const proxy = (req: NextRequest) => {
  const pathname = req.nextUrl.pathname;

  // Redirect any URL segment equal to the string "undefined"
  const hasUndefinedSegment = pathname
    .split("/")
    .some((segment) => segment === "undefined");

  if (hasUndefinedSegment) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const isProtected =
    pathname.startsWith("/owner") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/guest") ||
    pathname.startsWith("/onboarding");

  const token =
    req.cookies.get("_SESSION_")?.value || req.headers.get("Authorization");

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/owner/:path*",
    "/admin/:path*",
    "/staff/:path*",
    "/guest/:path*",
    "/onboarding/:path*",
  ],
};
