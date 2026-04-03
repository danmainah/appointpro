import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect dashboard routes — require session cookie
  if (pathname.startsWith("/dashboard")) {
    if (!hasSessionCookie(req)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Protect client portal — require session cookie
  if (pathname.startsWith("/client-portal")) {
    if (!hasSessionCookie(req)) {
      return NextResponse.redirect(new URL("/client/login", req.url));
    }
  }

  // Protect cron routes — require CRON_SECRET
  if (pathname.startsWith("/api/cron")) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

function hasSessionCookie(req: NextRequest): boolean {
  // NextAuth v5 uses these cookie names
  return !!(
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("authjs.session-token")?.value
  );
}

export const config = {
  matcher: ["/dashboard/:path*", "/client-portal/:path*", "/api/cron/:path*"],
};
