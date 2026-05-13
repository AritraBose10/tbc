import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";

const PUBLIC_PATHS = ["/login"];

function isPublic(pathname: string): boolean {
  return (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  );
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) {
    // Authenticated user visiting /login → send them home
    if (pathname === "/login") {
      const user = await getAuthUserFromRequest(req);
      if (user) {
        const next = req.nextUrl.searchParams.get("next") ?? "/";
        const redirectTo = next.startsWith("/") ? next : "/";
        return NextResponse.redirect(new URL(redirectTo, req.url));
      }
    }
    return NextResponse.next();
  }

  const user = await getAuthUserFromRequest(req);
  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
