import { NextRequest, NextResponse } from "next/server";

export const proxy = (req: NextRequest) => {
  const pathname = req.nextUrl.pathname;

  const isProtected =
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
    "/admin/:path*",
    "/onboarding/:path*",
    "/staff/:path*",
    "/guest/:path*",
  ],
};
