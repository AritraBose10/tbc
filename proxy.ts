import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/login", "/menu", "/dish", "/offers", "/support", "/display"];

function isPublic(pathname: string): boolean {
  return (
    pathname === "/" ||
    PUBLIC_PATHS.some((p) => p !== "/" && (pathname === p || pathname.startsWith(p + "/"))) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png"
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
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|mp4|woff2?|ttf|otf)$).*)",
  ],
};
