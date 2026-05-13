import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const user = await getAuthUserFromRequest(req);

  // Unauthenticated user trying to reach a protected page
  if (pathname.startsWith("/profile") && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated user trying to reach the login page
  if (pathname === "/login" && user) {
    const next = req.nextUrl.searchParams.get("next") ?? "/profile";
    const redirectTo = next.startsWith("/") ? next : "/profile";
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/login"],
};
